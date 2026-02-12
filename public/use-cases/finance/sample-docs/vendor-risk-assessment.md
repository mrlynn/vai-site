# Acme Corp Third-Party Vendor Risk Assessment

**Report Period:** Q4 2025
**Prepared by:** Enterprise Risk Management
**Classification:** Internal, Confidential

## 1. Vendor Risk Framework

Acme Corp maintains a risk-based approach to vendor management. All third-party vendors with access to company data, systems, or that provide services critical to business operations are subject to tiered due diligence, ongoing monitoring, and periodic reassessment. The framework aligns with SOC 2 Trust Services Criteria and regulatory expectations for vendor oversight.

## 2. Tier Classification

### Tier 1: Critical Vendors
Vendors whose failure or disruption would result in immediate and material impact to business operations, customer service, or regulatory compliance. Requires annual on-site assessment, SOC 2 Type II report review, and executive sponsor.

### Tier 2: Important Vendors
Vendors whose disruption would cause significant operational impact within 48 to 72 hours. Requires annual questionnaire, SOC 2 report review, and business owner accountability.

### Tier 3: Standard Vendors
Vendors with limited access to data or systems, whose disruption can be managed through standard business continuity procedures. Requires initial assessment and biennial review.

## 3. Tier 1 Vendor Summary

| Vendor | Service | Annual Spend | Risk Rating | Last Assessment |
|---|---|---|---|---|
| Amazon Web Services | Cloud infrastructure | $8.2M | Medium | Oct 2025 |
| Stripe | Payment processing | $2.1M | Medium | Sep 2025 |
| Snowflake | Analytics data warehouse | $1.4M | Low | Nov 2025 |
| Salesforce | CRM platform | $1.2M | Low | Aug 2025 |
| Okta | Identity/access management | $0.8M | Medium | Oct 2025 |

### AWS (Cloud Infrastructure, $8.2M annually)
AWS hosts 72% of Acme's production infrastructure across three regions (us-east-1, eu-west-1, ap-northeast-1). Single points of failure have been identified in the event of a simultaneous multi-region outage, which AWS classifies as an extremely low probability event. Our architecture includes cross-region failover for all Tier 1 services, with a recovery time objective (RTO) of 4 hours.

**Concentration Risk:** AWS represents the largest single vendor dependency. Annual spend has grown 34% year-over-year as platform usage scales. The Infrastructure team has initiated a multi-cloud evaluation targeting a reduction in AWS dependency to 55% of total cloud spend by Q4 2026, with Google Cloud Platform as the secondary provider.

### Stripe (Payment Processing, $2.1M annually)
Stripe processes 100% of customer payment transactions. A Stripe outage would prevent new subscription activations and payment collection. Backup integration with Adyen is in development, with target completion in Q2 2026.

### Snowflake (Analytics, $1.4M annually)
Snowflake powers internal analytics, customer reporting dashboards, and the data pipeline for our AI insights engine. A disruption would degrade reporting capabilities but would not impact core platform availability. Data replication to a secondary warehouse (BigQuery) provides 24-hour RPO.

## 4. Due Diligence Requirements

### Tier 1 Requirements
- SOC 2 Type II report review (annual)
- Security questionnaire (annual, minimum 200 questions)
- On-site or virtual assessment by Information Security team
- Business continuity and disaster recovery plan review
- Financial stability assessment (Dun & Bradstreet or equivalent)
- Cyber insurance verification ($10M minimum coverage)
- Contractual right to audit

### Tier 2 Requirements
- SOC 2 Type II report review (annual)
- Security questionnaire (annual, minimum 100 questions)
- Financial stability assessment
- Cyber insurance verification ($5M minimum)

### Tier 3 Requirements
- Security questionnaire (initial and biennial)
- Contractual data protection provisions

## 5. Key Findings and Recommendations

**Finding 1:** AWS spend concentration exceeds the 60% threshold recommended by the Board Risk Committee. Multi-cloud migration plan is approved and budgeted for 2026.

**Finding 2:** Two Tier 2 vendors (CloudMonitor Analytics and SecureSign) had delayed SOC 2 report submissions. Follow-up actions have been initiated, with a 30-day remediation deadline.

**Finding 3:** Vendor contract review identified three Tier 1 contracts lacking adequate data breach notification clauses (required: 24-hour notification). Contract amendments are in progress with target completion by Q1 2026.

**Finding 4:** Fourth-party risk (vendors of our vendors) remains an emerging area. We have begun mapping critical fourth-party dependencies for Tier 1 vendors, with full mapping targeted for completion by mid-2026.

## 6. Annual Review Calendar

All Tier 1 vendors are assessed on a rolling annual basis. The next scheduled comprehensive vendor risk report is due April 2026. Interim reporting will be provided to the Risk Committee if any Tier 1 vendor risk rating changes or a material incident occurs.
