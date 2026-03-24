# Deploy Automation

Multi-provider deployment automation system for Phase 3.

## Supported Providers

- ✅ **Vercel** - Next.js, React SPA, Static Sites
- ✅ **AWS S3 + CloudFront** - Static Sites
- ✅ **AWS Amplify** - Full-stack Applications

## Setup

### 1. Choose Provider

Copy and edit the configuration file:

```bash
cp deploy-config.yml.example deploy-config.yml
```

Edit `deploy-config.yml`:

```yaml
provider: vercel  # or aws-s3, aws-amplify
```

### 2. Configure GitHub Secrets

#### For Vercel

```bash
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID
```

#### For AWS S3 + CloudFront

```bash
gh secret set AWS_ACCESS_KEY_ID
gh secret set AWS_SECRET_ACCESS_KEY
gh secret set AWS_REGION
gh secret set AWS_S3_BUCKET
gh secret set AWS_CLOUDFRONT_ID  # Optional
gh secret set AWS_CLOUDFRONT_DOMAIN  # Optional
```

#### For AWS Amplify

```bash
gh secret set AWS_ACCESS_KEY_ID
gh secret set AWS_SECRET_ACCESS_KEY
gh secret set AWS_REGION
gh secret set AWS_AMPLIFY_APP_ID
```

#### For Slack Notifications (Optional)

```bash
gh secret set SLACK_WEBHOOK_URL
```

### 3. Test Deployment

Create a PR to test automatic deployment:

```bash
git checkout -b feat/test-deploy
echo "# Test" >> README.md
git add .
git commit -m "test: deployment"
git push origin feat/test-deploy
gh pr create --title "Test Deployment" --body "Testing Phase 3"
```

## Configuration

### deploy-config.yml

```yaml
provider: vercel  # Choose: vercel, aws-s3, aws-amplify

providers:
  vercel:
    token: ${VERCEL_TOKEN}
    org_id: ${VERCEL_ORG_ID}
    project_id: ${VERCEL_PROJECT_ID}

  aws_s3:
    bucket: my-app-bucket
    region: us-east-1
    access_key_id: ${AWS_ACCESS_KEY_ID}
    secret_access_key: ${AWS_SECRET_ACCESS_KEY}
    distribution_id: ${CLOUDFRONT_DISTRIBUTION_ID}
    build_command: npm run build
    output_directory: dist

  aws_amplify:
    app_id: ${AMPLIFY_APP_ID}
    region: us-east-1
    access_key_id: ${AWS_ACCESS_KEY_ID}
    secret_access_key: ${AWS_SECRET_ACCESS_KEY}
```

## How It Works

1. **Trigger**: Phase 2 (Test) completes successfully
2. **Load Config**: Read `deploy-config.yml`
3. **Select Provider**: Create provider instance via factory
4. **Deploy**: Execute provider-specific deployment
5. **Notify**: Post PR comment and Slack notification
6. **Trigger Phase 4**: (Production only, when implemented)

## Validation

Test configuration without deploying:

```bash
cd .github/deploy-automation
npm run validate
```

## Troubleshooting

### Deployment fails with "Invalid token"

- Check that secrets are correctly set
- Verify token has not expired
- Ensure token has necessary permissions

### Files not uploading to S3

- Check IAM permissions
- Verify S3 bucket exists
- Check bucket region matches AWS_REGION

### Amplify deployment hangs

- Check Amplify app ID is correct
- Verify branch exists in Amplify
- Check build settings in Amplify console

## Architecture

```
DeployProvider (Abstract Base Class)
    ├─ VercelProvider
    ├─ AwsS3Provider
    └─ AwsAmplifyProvider
```

## Directory Structure

```
.github/deploy-automation/
├── package.json
├── deploy-config.yml.example
├── README.md
└── src/
    ├── index.js           # Entry point
    ├── factory.js         # Provider factory
    ├── config-loader.js   # Config loading
    ├── providers/
    │   ├── base.js        # Abstract base class
    │   ├── vercel.js      # Vercel provider
    │   ├── aws-s3.js      # S3 + CloudFront provider
    │   └── aws-amplify.js # Amplify provider
    └── utils/
        ├── command.js     # Command execution
        ├── environment.js # Environment detection
        ├── github.js      # GitHub API
        ├── logger.js      # Logging
        └── slack.js       # Slack notifications
```

## Adding a New Provider

1. Create `src/providers/your-provider.js`
2. Extend `DeployProvider` class
3. Implement required methods:
   - `deploy()`
   - `validate()`
4. Update `factory.js` to include the new provider
5. Add provider config to `deploy-config.yml.example`

## License

MIT
