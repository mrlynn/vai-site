# SOC 2 Policy Overview: Acme Corp

**Document ID:** ACME-LEGAL-SOC2-2024-003
**Effective Date:** March 1, 2024
**Last Reviewed:** November 1, 2024
**Classification:** Internal, Confidential

## 1. Overview of SOC 2 Type II

1.1 Acme Corp ("the Company") maintains a SOC 2 Type II compliance program in accordance with the Trust Services Criteria ("TSC") established by the American Institute of Certified Public Accountants ("AICPA"). The SOC 2 Type II report evaluates the design and operating effectiveness of the Company's controls over a minimum observation period of six (6) months.

1.2 The Company's most recent SOC 2 Type II examination covers the period from January 1, 2024 through June 30, 2024 and was performed by an independent certified public accounting firm. The report is available to customers and prospective customers under a non-disclosure agreement upon written request.

1.3 The Company's SOC 2 program encompasses the following Trust Services Categories: Security, Availability, Confidentiality, Processing Integrity, and Privacy.

## 2. Security (CC6)

2.1 The Company implements logical and physical access controls to protect information assets against unauthorized access. All production systems require multi-factor authentication, and access is provisioned on a least-privilege basis in accordance with role-based access control policies.

2.2 Network security controls include firewalls, intrusion detection and prevention systems, and network segmentation. All data in transit is encrypted using TLS 1.2 or higher, and all data at rest is encrypted using AES-256 encryption.

2.3 The Company conducts annual penetration testing performed by qualified third-party assessors. Vulnerability scanning is performed on a weekly basis, and critical vulnerabilities are remediated within seventy-two (72) hours of identification.

2.4 Security awareness training is mandatory for all employees upon hire and on an annual basis thereafter. Phishing simulation exercises are conducted quarterly.

## 3. Availability (A1)

3.1 The Company maintains infrastructure designed to support the availability commitments set forth in its service level agreements. Production systems are deployed across multiple geographically distributed availability zones with automated failover capabilities.

3.2 The Company's target availability is 99.9% uptime, measured on a monthly basis, excluding scheduled maintenance windows. Scheduled maintenance is communicated to customers at least seventy-two (72) hours in advance.

3.3 Business continuity and disaster recovery plans are documented, tested annually, and designed to achieve a Recovery Time Objective ("RTO") of four (4) hours and a Recovery Point Objective ("RPO") of one (1) hour for critical systems.

## 4. Confidentiality (C1)

4.1 Information classified as confidential is identified, protected, and disposed of in accordance with the Company's Data Classification Policy. Confidential information includes customer data, source code, internal financial records, and trade secrets.

4.2 Access to confidential information is restricted to personnel with a documented business need. All employees and contractors are required to execute confidentiality agreements prior to accessing Company systems.

4.3 Confidential data is encrypted both in transit and at rest. Data retention and disposal procedures ensure that confidential information is securely deleted when it is no longer required for business or legal purposes.

## 5. Processing Integrity (PI1)

5.1 The Company maintains controls to ensure that system processing is complete, valid, accurate, timely, and authorized. Input validation controls, automated reconciliation processes, and exception handling procedures are implemented across all critical processing workflows.

5.2 Changes to production systems are governed by a formal change management process that includes peer code review, automated testing in staging environments, and documented approval by authorized personnel prior to deployment.

5.3 Processing errors and anomalies are logged, monitored, and escalated through the Company's incident management process. Root cause analysis is performed for all material processing failures.

## 6. Privacy

6.1 The Company's privacy practices are governed by its publicly available Privacy Policy, which describes the types of personal information collected, the purposes for which it is used, and the rights available to individuals. The Privacy Policy is reviewed and updated at least annually.

6.2 Privacy controls are aligned with applicable regulatory requirements including the GDPR and CCPA. The Company has designated a Data Protection Officer responsible for overseeing privacy compliance.

## 7. Control Environment

7.1 The Company's control environment is established through a formal governance structure that includes a Board of Directors, an executive leadership team, and dedicated security and compliance functions. Management has adopted a risk-based approach to identifying, assessing, and mitigating risks to the Company's operations and information assets.

7.2 Policies and procedures are documented, approved by senior management, and communicated to all relevant personnel. Policy compliance is monitored through periodic internal audits and management reviews.

## 8. Monitoring Activities

8.1 The Company employs continuous monitoring of its control environment through automated alerting, log aggregation and analysis, and periodic control testing. Security Information and Event Management ("SIEM") systems aggregate logs from all production systems and generate alerts based on predefined correlation rules.

8.2 Internal audits of key controls are performed on a quarterly basis. Findings are reported to management and tracked through remediation to closure. External audits, including the annual SOC 2 Type II examination, provide independent assurance of control effectiveness.

8.3 Key performance indicators and control metrics are reported to the executive leadership team on a monthly basis and to the Board of Directors on a quarterly basis.
