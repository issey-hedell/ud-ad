import { SentryProvider } from './providers/sentry.js';
import { DatadogProvider } from './providers/datadog.js';
import { CloudWatchProvider } from './providers/cloudwatch.js';
import { NewRelicProvider } from './providers/newrelic.js';
import { CustomProvider } from './providers/custom.js';

/**
 * モニタリングプロバイダーのFactoryクラス
 */
export class MonitoringProviderFactory {
  static createProvider(config, deploymentInfo) {
    const provider = config.provider;

    switch (provider) {
      case 'sentry':
        return new SentryProvider(config, deploymentInfo);

      case 'datadog':
        return new DatadogProvider(config, deploymentInfo);

      case 'cloudwatch':
        return new CloudWatchProvider(config, deploymentInfo);

      case 'newrelic':
        return new NewRelicProvider(config, deploymentInfo);

      case 'custom':
        return new CustomProvider(config, deploymentInfo);

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  static getSupportedProviders() {
    return [
      'sentry',
      'datadog',
      'cloudwatch',
      'newrelic',
      'custom'
    ];
  }
}
