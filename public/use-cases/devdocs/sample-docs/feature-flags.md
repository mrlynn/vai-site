# Feature Flags

**Last updated:** 2025-01-19
**Owner:** Platform Engineering
**Status:** Current

## Overview

Meridian Commerce uses LaunchDarkly for feature flag management. Feature flags decouple deployment from release, allowing us to ship code to production without exposing it to users until we are ready. Every new user-facing feature must be behind a feature flag.

For how flags interact with the deployment pipeline, see the [Deployment Guide](deployment-guide.md).

## Naming Convention

Flags follow the pattern: `team.feature-name`

Examples:

| Flag Key | Team | Purpose |
|----------|------|---------|
| `orders.express-checkout` | Orders | New express checkout flow |
| `catalog.search-v2` | Catalog | Redesigned search results page |
| `platform.rate-limit-v2` | Platform | Updated rate limiting algorithm |
| `notifications.sms-opt-in` | Notifications | SMS notification opt-in prompt |

Rules:
- Use lowercase with hyphens for the feature name
- Prefix with the owning team name
- Keep names descriptive but concise
- Never reuse a flag key, even after deletion

## Flag Types

### Boolean Flags (Release)

The most common type. Used to gate access to a new feature.

```javascript
const showExpressCheckout = await ldClient.variation(
  'orders.express-checkout',
  user,
  false // default: feature off
);

if (showExpressCheckout) {
  renderExpressCheckoutButton();
}
```

### Multivariate Flags (Experiment)

Used for A/B testing when you need more than two variations. Returns a string or JSON value.

```javascript
const checkoutLayout = await ldClient.variation(
  'orders.checkout-layout',
  user,
  'control' // default variation
);

// Possible values: 'control', 'single-page', 'accordion'
renderCheckout(checkoutLayout);
```

### Kill Switches (Emergency)

Boolean flags that are normally **on** and toggled **off** to disable functionality during an incident. Kill switches bypass the normal rollout process.

```javascript
const paymentsEnabled = await ldClient.variation(
  'platform.payments-enabled',
  user,
  true // default: payments on
);

if (!paymentsEnabled) {
  return res.status(503).json({
    error: { code: 'SYSTEM_010', message: 'Payments temporarily unavailable' }
  });
}
```

Kill switches should be prefixed with the team name and use a clearly descriptive name. Document all kill switches in the [Monitoring Runbook](monitoring-runbook.md) so on-call engineers know when to use them.

## Rollout Lifecycle

Every feature flag follows this lifecycle:

### 1. Create the Flag

Create the flag in LaunchDarkly with the correct naming convention. Set the default value to `false` (or the control variation for multivariate flags). Add a description and link to the Jira ticket.

### 2. Develop Behind the Flag

All code paths for the new feature check the flag value. Both the "on" and "off" paths must be tested. Include the flag in integration tests by mocking LaunchDarkly responses.

### 3. Roll Out Incrementally

Follow this rollout schedule for user-facing features:

| Stage | Percentage | Duration | What to Monitor |
|-------|-----------|----------|-----------------|
| Internal | 0% (targeting internal users only) | 1-2 days | Functional correctness |
| Canary | 1% of users | 1 day | Error rates, latency |
| Early adopters | 10% of users | 2-3 days | Performance, user feedback |
| Broad rollout | 50% of users | 2-3 days | Business metrics |
| Full rollout | 100% of users | Permanent until cleanup | All dashboards |

Monitor Datadog dashboards at each stage. If error rates increase by more than 0.5% or p99 latency increases by more than 200ms, pause the rollout and investigate.

### 4. Remove the Flag

Once a feature has been at 100% for a full release cycle with no issues, remove the flag. This means:

- Delete the flag from LaunchDarkly
- Remove all conditional logic from the codebase
- Remove the "off" code path entirely
- Submit a PR with the cleanup

**Flag removal deadline:** Flags must be removed within 30 days of reaching 100% rollout.

## Stale Flag Cleanup

Stale flags create technical debt and confuse the codebase. We run a monthly cleanup process:

1. LaunchDarkly generates a report of flags that have been at 100% for over 30 days
2. The report is posted to `#engineering` on the first Monday of each month
3. Owning teams have one sprint to clean up their stale flags
4. Flags not cleaned up after two reminders are escalated to the engineering lead

### Identifying Stale Flags in Code

```bash
# Search for flag references across all services
grep -r "ldClient.variation" --include="*.js" --include="*.ts" -l
```

## LaunchDarkly SDK Configuration

All services initialize the LaunchDarkly SDK with consistent settings:

```javascript
const LaunchDarkly = require('launchdarkly-node-server-sdk');

const ldClient = LaunchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY, {
  logger: LaunchDarkly.basicLogger({ level: 'warn' }),
  flushInterval: 5,
  streamUri: process.env.LD_STREAM_URI, // optional relay proxy
});
```

The SDK key is stored in AWS Secrets Manager and injected as an environment variable. Never commit SDK keys to source control.

## Related Documents

- [Deployment Guide](deployment-guide.md)
- [Monitoring Runbook](monitoring-runbook.md)
- [Incident Response](incident-response.md)
- [Testing Strategy](testing-strategy.md)
