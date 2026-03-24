import { VercelProvider } from './providers/vercel.js';
import { AwsS3Provider } from './providers/aws-s3.js';
import { AwsAmplifyProvider } from './providers/aws-amplify.js';
import { AwsEc2Provider } from './providers/aws-ec2.js';
import { AwsEcsProvider } from './providers/aws-ecs.js';
import { NetlifyProvider } from './providers/netlify.js';
import { FirebaseProvider } from './providers/firebase.js';
import { CloudflareProvider } from './providers/cloudflare.js';
import { CustomProvider } from './providers/custom.js';

/**
 * プロバイダーファクトリー
 * 設定に基づいて適切なプロバイダーインスタンスを生成
 */
export class DeployProviderFactory {
  /**
   * プロバイダーを作成
   * @param {Object} config - 設定オブジェクト
   * @param {string} environment - デプロイ環境
   * @returns {DeployProvider}
   */
  static createProvider(config, environment) {
    const provider = config.provider;

    console.log('Creating provider: ' + provider);

    const normalizedProvider = provider.replace(/_/g, '-').toLowerCase();

    switch (normalizedProvider) {
      case 'vercel':
        return new VercelProvider(config, environment);

      case 'aws-s3':
      case 's3':
        return new AwsS3Provider(config, environment);

      case 'aws-amplify':
      case 'amplify':
        return new AwsAmplifyProvider(config, environment);

      case 'aws-ec2':
      case 'ec2':
        return new AwsEc2Provider(config, environment);

      case 'aws-ecs':
      case 'ecs':
        return new AwsEcsProvider(config, environment);

      case 'netlify':
        return new NetlifyProvider(config, environment);

      case 'firebase':
        return new FirebaseProvider(config, environment);

      case 'cloudflare':
        return new CloudflareProvider(config, environment);

      case 'custom':
        return new CustomProvider(config, environment);

      default:
        throw new Error('Unknown provider: ' + provider + '. Supported: ' + DeployProviderFactory.getSupportedProviders().join(', '));
    }
  }

  /**
   * サポートされているプロバイダーのリストを取得
   * @returns {string[]}
   */
  static getSupportedProviders() {
    return [
      'vercel',
      'aws-s3',
      'aws-amplify',
      'aws-ec2',
      'aws-ecs',
      'netlify',
      'firebase',
      'cloudflare',
      'custom'
    ];
  }

  /**
   * プロバイダーの説明を取得
   * @returns {Object}
   */
  static getProviderDescriptions() {
    return {
      'vercel': 'Next.js, React SPA',
      'aws-s3': 'AWS S3 + CloudFront',
      'aws-amplify': 'AWS Amplify',
      'aws-ec2': 'AWS EC2 (SSH)',
      'aws-ecs': 'AWS ECS (Container)',
      'netlify': 'Netlify',
      'firebase': 'Firebase Hosting',
      'cloudflare': 'Cloudflare Pages',
      'custom': 'Custom command'
    };
  }
}
