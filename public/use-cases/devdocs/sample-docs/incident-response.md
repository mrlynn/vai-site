# Incident Response Process

**Last updated:** 2025-01-20
**Owner:** Platform Engineering
**Status:** Current

## Overview

This document defines how Meridian Commerce handles production incidents. Our incident response philosophy is rooted in blameless culture: we focus on systemic improvements, not individual fault. Every incident is a learning opportunity.

For details on how monitoring alerts escalate into incidents, see the [Monitoring Runbook](monitoring-runbook.md).

## Severity Levels

| Severity | Description | Response Time | Examples |
|----------|-------------|---------------|----------|
| SEV1 | Complete service outage affecting all users | 15 minutes | API gateway down, database unreachable, payment processing failure |
| SEV2 | Partial service degradation affecting a subset of users | 30 minutes | One microservice failing, elevated error rates (>5%), degraded checkout flow |
| SEV3 | Minor impact, workaround available | 4 hours | Slow queries on non-critical endpoints, intermittent timeout on a single route |
| SEV4 | Cosmetic issue or low-priority bug | Next sprint | UI rendering glitch, misleading log message, non-critical deprecation warning |

## Communication Channels

All incident communication flows through the `#incidents` Slack channel. This is the single source of truth during an active incident.

**SEV1 and SEV2 incidents additionally require:**

- StatusPage update within 10 minutes of incident declaration
- Customer-facing status update every 30 minutes until resolution
- Executive summary posted to `#incidents` after resolution

**SEV3 and SEV4 incidents** are tracked in Jira and communicated through normal engineering channels.

## Incident Commander Role

Every SEV1 and SEV2 incident must have a designated Incident Commander (IC). The IC is responsible for:

1. **Declaring the incident** in `#incidents` with a severity assessment
2. **Coordinating responders** and delegating investigation tasks
3. **Maintaining the timeline** of events, actions taken, and findings
4. **Communicating updates** to stakeholders at regular intervals
5. **Declaring resolution** when the immediate impact is mitigated

The on-call engineer automatically becomes the IC unless they explicitly hand off to someone else. The IC does not need to be the person fixing the issue; their role is coordination.

### IC Slack Template

When declaring an incident, use this format:

```
:rotating_light: INCIDENT DECLARED
Severity: SEV1
Summary: [Brief description of impact]
IC: @your-name
Status: Investigating
Affected services: [list services]
Customer impact: [describe user-facing impact]
```

## Response Workflow

1. **Alert fires** from Datadog or PagerDuty (see [Monitoring Runbook](monitoring-runbook.md))
2. **On-call engineer** acknowledges the page and assesses severity
3. **Incident declared** in `#incidents` if SEV1 or SEV2
4. **Investigate** using Datadog dashboards, service logs, and Kafka consumer lag metrics
5. **Mitigate** the immediate impact (rollback, feature flag kill-switch, scale up)
6. **Resolve** and confirm services are healthy
7. **Postmortem** scheduled within 48 hours for SEV1 and SEV2

## Postmortem Process

Postmortems are required for all SEV1 and SEV2 incidents and must be completed within 48 hours of resolution.

**Postmortem template sections:**

- Incident summary and timeline
- Root cause analysis (use the "5 Whys" technique)
- What went well during the response
- What could be improved
- Action items with owners and due dates

Postmortems are stored in the `engineering/postmortems` directory in the docs repository and reviewed during the weekly engineering sync.

**Remember:** Postmortems are blameless. We identify systemic factors, not individual mistakes. Phrasing like "the deployment pipeline lacked validation" is preferred over "engineer X forgot to check."

## Escalation Contacts

| Role | Primary | Backup |
|------|---------|--------|
| Engineering Lead | @sarah.chen | @david.park |
| Infrastructure | @ops-oncall (PagerDuty) | @infra-team (Slack) |
| Customer Support | @support-lead | #support-escalations |

## Related Documents

- [Monitoring Runbook](monitoring-runbook.md)
- [Deployment Guide](deployment-guide.md)
- [Feature Flags](feature-flags.md)
