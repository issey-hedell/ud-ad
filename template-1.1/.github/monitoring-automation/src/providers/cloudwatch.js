import { MonitoringProvider } from './base.js';
import { CloudWatchClient, PutMetricAlarmCommand } from '@aws-sdk/client-cloudwatch';
import { CloudWatchLogsClient, CreateLogGroupCommand, PutRetentionPolicyCommand } from '@aws-sdk/client-cloudwatch-logs';

export class CloudWatchProvider extends MonitoringProvider {
  async validate() {
    this.log('Validating CloudWatch configuration...');

    const required = ['region', 'access_key_id', 'secret_access_key', 'log_group'];
    for (const field of required) {
      if (!this.providerConfig[field]) {
        throw new Error(`Missing required CloudWatch config: ${field}`);
      }
    }

    return true;
  }

  async setup() {
    this.log('Starting CloudWatch monitoring setup...');

    try {
      const config = this.resolveEnvVars(this.providerConfig);

      // CloudWatchクライアント作成
      const cwClient = new CloudWatchClient({
        region: config.region,
        credentials: {
          accessKeyId: config.access_key_id,
          secretAccessKey: config.secret_access_key
        }
      });

      const cwLogsClient = new CloudWatchLogsClient({
        region: config.region,
        credentials: {
          accessKeyId: config.access_key_id,
          secretAccessKey: config.secret_access_key
        }
      });

      // ログ グループを作成
      await this.createLogGroup(cwLogsClient, config);

      // メトリクスを設定
      if (config.metrics?.enabled) {
        await this.setupMetrics(config);
      }

      // アラームを設定
      if (config.alarms?.enabled) {
        await this.setupAlarms(cwClient, config);
      }

      this.log('CloudWatch setup completed successfully');

      return {
        success: true,
        message: 'CloudWatch monitoring configured successfully',
        metadata: {
          log_group: config.log_group,
          region: config.region
        }
      };

    } catch (error) {
      this.error('CloudWatch setup failed', error);
      throw error;
    }
  }

  async createLogGroup(cwLogsClient, config) {
    this.log('Creating CloudWatch Log Group...');

    try {
      await cwLogsClient.send(new CreateLogGroupCommand({
        logGroupName: config.log_group
      }));

      // ログ保持期間を設定（30日）
      await cwLogsClient.send(new PutRetentionPolicyCommand({
        logGroupName: config.log_group,
        retentionInDays: 30
      }));

      this.log(`Log group created: ${config.log_group}`);
    } catch (error) {
      if (error.name === 'ResourceAlreadyExistsException') {
        this.log('Log group already exists');
      } else {
        throw error;
      }
    }
  }

  async setupMetrics(config) {
    this.log('Setting up CloudWatch Metrics...');

    // メトリクス設定の確認
    this.log(`Namespace: ${config.metrics.namespace}`);

    return true;
  }

  async setupAlarms(cwClient, config) {
    this.log('Setting up CloudWatch Alarms...');

    // エラー率アラーム
    const alarmCommand = new PutMetricAlarmCommand({
      AlarmName: `${this.deploymentInfo.project_name}-error-rate`,
      ComparisonOperator: 'GreaterThanThreshold',
      EvaluationPeriods: 1,
      MetricName: 'Errors',
      Namespace: config.metrics?.namespace || this.deploymentInfo.project_name,
      Period: 300,
      Statistic: 'Sum',
      Threshold: 10,
      ActionsEnabled: true,
      AlarmActions: [config.alarms.sns_topic],
      AlarmDescription: 'Alert when error rate exceeds threshold'
    });

    await cwClient.send(alarmCommand);

    this.log('Alarms configured successfully');
    return true;
  }
}
