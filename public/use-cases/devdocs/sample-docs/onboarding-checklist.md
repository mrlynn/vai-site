# New Engineer Onboarding Checklist

**Last updated:** 2025-01-18
**Owner:** Engineering Management
**Status:** Current

## Overview

Welcome to Meridian Commerce Engineering. This checklist covers everything you need to get productive in your first month. Your onboarding buddy will help you work through each section. If you get stuck on any step, ask in `#eng-onboarding` on Slack.

## Day 1: Access and Accounts

Your manager should have submitted access requests before your start date. Verify you have access to each of the following:

### Required Accounts

- [ ] **GitHub:** Added to the `meridian-commerce` organization with appropriate team membership
- [ ] **Datadog:** Account created, added to your team's dashboard group
- [ ] **PagerDuty:** Account created and added to your team's escalation policy (shadow only for first month)
- [ ] **LaunchDarkly:** Account created with viewer role (write access granted after Week 2)
- [ ] **1Password:** Invited to the Engineering vault for shared credentials and API keys
- [ ] **AWS Console:** Read-only access to staging environment via SSO

### Slack Channels

Join these channels on your first day:

| Channel | Purpose |
|---------|---------|
| `#engineering` | General engineering discussion |
| `#incidents` | Active incident coordination |
| `#deploys` | Deployment notifications from CI/CD |
| `#eng-onboarding` | Questions from new engineers (no question is too basic) |
| `#your-team-name` | Your team's private channel |
| `#code-review` | Cross-team code review requests |

### Day 1 Meetings

- [ ] Welcome meeting with your manager (30 min)
- [ ] Meet your onboarding buddy (30 min)
- [ ] IT setup session for laptop, VPN, and 2FA enrollment

## Week 1: Local Development and First PR

### Local Environment Setup

- [ ] Clone all service repositories from the `meridian-commerce` GitHub org
- [ ] Follow the [Local Development Setup](local-dev-setup.md) guide to get the full stack running with Docker Compose
- [ ] Verify you can hit `http://localhost:8000/health` and see healthy responses from all services
- [ ] Configure your IDE with the team's shared linting and formatting rules (`.editorconfig` and `.eslintrc` in each repo)

### First Pull Request

- [ ] Browse the `good-first-issue` label in GitHub across all repositories
- [ ] Pick an issue, assign it to yourself, and move it to "In Progress"
- [ ] Submit a pull request following the [Code Review Guidelines](code-review.md) and PR template
- [ ] Get your PR reviewed and merged

This first PR is about learning the workflow, not shipping a complex feature. Documentation fixes, test additions, and small bug fixes are all great choices.

### Week 1 Meetings

- [ ] Daily standup with your team
- [ ] 1:1 with your onboarding buddy (2x this week)

## Week 2: Systems Understanding

### On-Call Shadow

- [ ] Shadow the current on-call engineer for at least two days
- [ ] Review the [Monitoring Runbook](monitoring-runbook.md) and the [Incident Response](incident-response.md) process
- [ ] Familiarize yourself with Datadog dashboards for your team's services
- [ ] Walk through PagerDuty escalation policies with the on-call engineer

### Architecture Deep Dive

- [ ] Read the [Architecture Overview](architecture-overview.md) document end to end
- [ ] Schedule a 1-hour architecture walkthrough with your onboarding buddy or tech lead
- [ ] Trace a request from the API gateway through to database write and Kafka event publication
- [ ] Review the [Database Schema](database-schema.md) for the services your team owns

### Week 2 Meetings

- [ ] Architecture walkthrough (1 hour with tech lead)
- [ ] Mid-onboarding check-in with your manager

## Month 1: Independence

### Feature Work

- [ ] Pick up a medium-sized feature or story from the sprint backlog
- [ ] Write a brief design doc or Slack thread outlining your approach before coding
- [ ] Implement the feature behind a feature flag (see [Feature Flags](feature-flags.md))
- [ ] Write tests following the [Testing Strategy](testing-strategy.md)
- [ ] Deploy to staging and verify with QA

### On-Call Rotation

- [ ] Join the on-call rotation as a secondary responder
- [ ] Ensure PagerDuty notifications are configured on your phone
- [ ] Review the escalation runbook for your team's services

### End of Month 1

- [ ] 30-day check-in with your manager to discuss onboarding experience
- [ ] Share feedback on the onboarding process in `#eng-onboarding` so we can improve it

## Related Documents

- [Local Development Setup](local-dev-setup.md)
- [Architecture Overview](architecture-overview.md)
- [Monitoring Runbook](monitoring-runbook.md)
- [Incident Response](incident-response.md)
- [Testing Strategy](testing-strategy.md)
- [Feature Flags](feature-flags.md)
