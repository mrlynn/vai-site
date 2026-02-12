# Deployment Guide

**Last updated:** 2025-01-11
**Owner:** Platform Engineering
**Status:** Current

## Overview

The Meridian Commerce platform uses a continuous delivery pipeline powered by GitHub Actions. Code flows through three stages: automated PR checks, automatic staging deployment, and manually approved production deployment. All services are deployed as Docker containers to AWS ECS Fargate using a blue-green deployment strategy.

For architecture context, see [Architecture Overview](architecture-overview.md). For post-deployment monitoring and alerting, see [Monitoring Runbook](monitoring-runbook.md).

## Deployment Pipeline

### Stage 1: Pull Request Checks

Every pull request triggers the following automated checks:

```yaml
# .github/workflows/pr-checks.yml
jobs:
  lint:
    - ESLint with project configuration
    - Prettier format check
  test:
    - Unit tests (Jest)
    - Integration tests (against Docker Compose test environment)
    - Minimum coverage threshold: 80% lines, 75% branches
  build:
    - Docker image build (validates Dockerfile)
    - TypeScript compilation (no emit, type checking only)
  security:
    - npm audit (critical and high severity fail the build)
    - Trivy container image scan
```

All checks must pass before a PR can be merged. Branch protection rules on `main` enforce this requirement.

### Stage 2: Staging Deployment

When a PR is merged to `main`, the staging deployment workflow runs automatically:

1. **Build:** Docker images are built and tagged with the Git SHA
2. **Push:** Images are pushed to Amazon ECR
3. **Deploy:** ECS task definitions are updated with the new image tag
4. **Verify:** Health check endpoints are polled for 60 seconds to confirm successful startup

Staging uses the same infrastructure topology as production (ECS Fargate, RDS, MSK, ElastiCache) but with smaller instance sizes. The staging environment is available at `https://staging-api.meridiancommerce.io`.

### Stage 3: Production Deployment

Production deployments require manual approval through GitHub Environments. The process:

1. A team lead or designated deployer navigates to the GitHub Actions workflow run
2. They click "Review deployments" and approve the production environment
3. The deployment proceeds using blue-green strategy (detailed below)

Production deployments are restricted to business hours (9 AM to 4 PM ET, Monday through Thursday) unless an emergency hotfix is approved by the on-call engineer.

## Blue-Green Deployment

Production uses a blue-green deployment strategy to minimize downtime and enable instant rollback.

### How It Works

1. **New task set:** ECS creates a new (green) task set with the updated container image
2. **Health validation:** The ALB target group runs health checks against the green tasks for 90 seconds
3. **Traffic shift:** If health checks pass, the ALB shifts 100% of traffic from blue to green
4. **Stabilization:** The old (blue) task set is retained for 30 minutes as a rollback target
5. **Cleanup:** After the stabilization period, the blue task set is drained and terminated

```
                Time 0           Time +90s         Time +30min
                ------           ---------         -----------
Blue (old):     100% traffic     0% traffic        terminated
Green (new):    health checks    100% traffic      100% traffic
```

### Health Check Configuration

Each service exposes a `/health` endpoint that returns:

```json
{
  "status": "ok",
  "version": "1.24.3",
  "commitSha": "a1b2c3d",
  "checks": {
    "database": "ok",
    "kafka": "ok",
    "redis": "ok"
  }
}
```

The ALB health check is configured with:

| Setting | Value |
|---|---|
| Path | `/health` |
| Interval | 10 seconds |
| Healthy threshold | 3 consecutive successes |
| Unhealthy threshold | 2 consecutive failures |
| Timeout | 5 seconds |

## Rollback Procedure

If issues are detected after a production deployment, follow this rollback procedure:

### Automatic Rollback

If the green task set fails health checks during the initial 90-second validation window, ECS automatically rolls back by keeping traffic on the blue task set. No manual intervention is required.

### Manual Rollback (within 30 minutes)

During the 30-minute stabilization period, the previous blue task set is still running. To roll back:

```bash
# From the platform-deploy repository
./scripts/rollback.sh production --service <service-name>
```

This script updates the ALB target group to route traffic back to the blue task set.

### Manual Rollback (after 30 minutes)

If the blue task set has already been terminated, you must redeploy the previous version:

```bash
# Find the previous image tag
aws ecr describe-images --repository-name meridian/<service-name> \
  --query 'sort_by(imageDetails,&imagePushedAt)[-2].imageTags[0]'

# Deploy the previous version
./scripts/deploy.sh production --service <service-name> --tag <previous-tag>
```

## Pre-Deployment Checklist

Before deploying to production, verify the following:

- [ ] All PR checks passed on the merged commit
- [ ] Staging deployment succeeded and was verified
- [ ] Feature flags are in place for any new user-facing functionality
- [ ] Database migrations (if any) have been applied to production during the maintenance window
- [ ] The team Slack channel (`#deployments`) has been notified
- [ ] The on-call engineer is aware of the deployment

Feature flags are mandatory for any production deployment that introduces new behavior visible to end users. This allows the team to decouple deployment from feature release and provides a kill switch if issues arise. Feature flag configuration is managed through LaunchDarkly.

## Environment Variables and Secrets

Environment-specific configuration is managed through:

- **ECS Task Definition:** Non-sensitive configuration (log level, feature flag keys, service URLs)
- **AWS Secrets Manager:** Sensitive values (database credentials, API keys, encryption keys)

Secrets are injected into containers at startup via ECS secret references. They are never stored in the task definition or Docker image.

## Related Documents

- [Architecture Overview](architecture-overview.md)
- [Monitoring Runbook](monitoring-runbook.md)
- [Local Development Setup](local-dev-setup.md)
- [Database Schema](database-schema.md)
