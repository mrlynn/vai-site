# Monitoring and Alerting Runbook

**Last updated:** 2025-01-14
**Owner:** Platform Engineering / SRE
**Status:** Current

## Overview

This runbook documents the monitoring infrastructure, key alerts, and first-response procedures for the Meridian Commerce platform. The goal is to provide on-call engineers with clear, actionable guidance when an alert fires.

For deployment procedures and rollback instructions, see [Deployment Guide](deployment-guide.md). For severity classification and incident management process, see the Incident Response document (internal wiki).

## Monitoring Stack

| Tool | Purpose | Access |
|---|---|---|
| Datadog | Metrics, dashboards, APM traces | `https://app.datadoghq.com` (SSO) |
| PagerDuty | Alerting, on-call scheduling, escalation | `https://meridian-eng.pagerduty.com` (SSO) |
| AWS CloudWatch | Infrastructure-level metrics (ECS, RDS, MSK) | AWS Console, dev account |
| Sentry | Application error tracking and grouping | `https://meridian-eng.sentry.io` (SSO) |

## Key Dashboards

All dashboards are in the "Meridian Production" folder in Datadog:

- **Platform Overview:** High-level health across all services (request rate, error rate, latency P50/P95/P99)
- **Service Detail:** Per-service deep dive (select service from dropdown)
- **Database Performance:** PostgreSQL query performance, connection pool usage, replication lag
- **Kafka Health:** Consumer lag per topic, broker disk usage, partition distribution
- **Infrastructure:** ECS task health, CPU/memory utilization, ALB metrics

## Escalation Policy

PagerDuty escalation follows this sequence:

| Step | Timeout | Target |
|---|---|---|
| 1 | 0 min | Primary on-call engineer |
| 2 | 15 min | Secondary on-call engineer |
| 3 | 30 min | Engineering manager |
| 4 | 45 min | VP of Engineering |

If you are paged and cannot respond, acknowledge the alert in PagerDuty and reassign to the secondary on-call.

## Alert Reference

### API Error Rate > 5%

**Severity:** High
**Source:** Datadog metric `meridian.api.error_rate`
**Condition:** 5xx error rate exceeds 5% of total requests over a 5-minute rolling window

**What this means:** A significant portion of API requests are failing with server errors. This typically indicates a service crash, database connectivity issue, or a bad deployment.

**First response steps:**

1. Open the Platform Overview dashboard and identify which service is generating errors
2. Check Sentry for new error groups that correlate with the alert start time
3. Check the `#deployments` Slack channel for recent deployments
4. If a deployment occurred in the last 30 minutes, consider rolling back (see [Deployment Guide](deployment-guide.md))
5. Check database and Kafka connectivity from the affected service's logs in Datadog

**Escalation criteria:** Escalate if the error rate does not decrease within 10 minutes of initial response, or if the root cause is not identifiable.

### P95 Latency > 500ms

**Severity:** Medium
**Source:** Datadog metric `meridian.api.latency.p95`
**Condition:** 95th percentile response time exceeds 500ms for any service over a 5-minute window

**What this means:** API responses are significantly slower than normal. The P95 baseline for most endpoints is 80 to 150ms. Common causes include slow database queries, Redis cache misses, increased traffic, or resource contention.

**First response steps:**

1. Open the Service Detail dashboard for the affected service
2. Check the APM trace view for slow spans. Look for database queries exceeding 100ms or external calls exceeding 200ms
3. Check Redis hit rate on the Platform Overview dashboard. A sudden drop in cache hit rate can cause latency spikes as requests fall through to PostgreSQL
4. Review the Database Performance dashboard for lock contention or long-running queries
5. Check ECS task CPU and memory utilization. If tasks are near resource limits, consider scaling out

**Escalation criteria:** Escalate if latency remains above 500ms for more than 15 minutes, or if the cause appears to be infrastructure-related (RDS, MSK, ECS).

### Database Connection Pool > 80%

**Severity:** High
**Source:** Datadog metric `meridian.db.connection_pool.usage_pct`
**Condition:** Connection pool utilization exceeds 80% for any service

**What this means:** The service is running low on available database connections. If the pool is exhausted, new requests will queue and eventually timeout. This can cascade into widespread failures.

**First response steps:**

1. Identify the affected service from the alert metadata
2. Check the Database Performance dashboard for long-running transactions or queries
3. Look for connection leaks: queries that are started but never committed or rolled back. The `pg_stat_activity` view shows active connections and their state
4. Check if a recent deployment introduced a new query pattern that holds connections longer than expected
5. As a temporary measure, increase the pool size via environment variable (`DB_POOL_MAX`) and restart the affected tasks

**Escalation criteria:** Escalate immediately if the pool reaches 95% or if you cannot identify the cause within 10 minutes.

### Kafka Consumer Lag > 10,000

**Severity:** Medium
**Source:** Datadog metric `meridian.kafka.consumer_lag`
**Condition:** Consumer group lag exceeds 10,000 messages for any topic

**What this means:** A consuming service is falling behind in processing messages from Kafka. This can cause delayed order status updates, delayed notifications, or stale data in downstream services.

**First response steps:**

1. Identify the affected consumer group and topic from the alert
2. Check the Kafka Health dashboard for the lag trend. Is it growing steadily or was there a sudden spike?
3. Check if the consuming service is healthy. If tasks are crashing and restarting, they will fall behind
4. Review the consumer service's error logs for processing failures. A poison message (one that consistently fails processing) can block a partition
5. If a single partition is affected, check for message ordering issues or a particularly large message

**Escalation criteria:** Escalate if lag continues to grow after 20 minutes, or if the consuming service is the order-service (which directly impacts order processing).

### Disk Usage > 85%

**Severity:** Medium
**Source:** AWS CloudWatch metric `VolumeReadBytes` / Datadog metric `meridian.infra.disk_usage_pct`
**Condition:** Disk usage exceeds 85% on any persistent volume (RDS, MSK broker)

**What this means:** A storage volume is approaching capacity. If it reaches 100%, the associated service will fail. For RDS, writes will stop. For Kafka brokers, new messages cannot be persisted.

**First response steps:**

1. Identify the affected resource from the alert
2. **For RDS:** Check for table bloat using `pg_stat_user_tables`. Run `VACUUM ANALYZE` on tables with high dead tuple counts. Review whether old data can be archived or purged
3. **For Kafka (MSK):** Check topic retention settings. If a topic has `retention.ms` set to a long period, reducing it (with team approval) will free space as old segments are deleted
4. If immediate relief is needed, increase the volume size through AWS Console or Terraform. RDS and MSK both support online volume expansion without downtime
5. Open a follow-up ticket to investigate the growth trend and implement a long-term fix

**Escalation criteria:** Escalate immediately if disk usage exceeds 90%, as the remaining headroom may be consumed quickly.

## General Troubleshooting Tips

- **Always check the deployment timeline first.** Many incidents correlate with recent deployments
- **Use Datadog APM traces** to pinpoint the slow or failing component within a request chain
- **Cross-reference with Sentry** for application-level errors with full stack traces
- **Check the `#incidents` Slack channel** before starting a new investigation. Someone else may already be working on the same issue
- **Document your findings** in the incident thread, even if the alert resolves on its own. This context is valuable for postmortems

## Related Documents

- [Architecture Overview](architecture-overview.md)
- [Deployment Guide](deployment-guide.md)
- [Database Schema](database-schema.md)
- [Local Development Setup](local-dev-setup.md)
