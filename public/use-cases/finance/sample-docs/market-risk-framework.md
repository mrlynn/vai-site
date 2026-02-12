# Acme Corp Market Risk Management Framework

**Document ID:** FIN-MR-2025-001
**Effective Date:** February 1, 2025
**Last Revised:** January 22, 2025
**Classification:** Internal, Confidential
**Owner:** Chief Risk Officer

## 1. Risk Governance

Market risk management at Acme Corp operates within a three-lines-of-defense model. The Treasury and Investment team (first line) is responsible for day-to-day risk-taking within approved limits. The Enterprise Risk Management group (second line) provides independent oversight, methodology development, and limit monitoring. Internal Audit (third line) performs periodic assessments of the framework's effectiveness. The Board Risk Committee receives quarterly market risk reports and approves all material changes to risk limits and methodologies.

## 2. Value-at-Risk (VaR) Methodology

Acme Corp employs a historical simulation approach as its primary VaR methodology. This method uses 500 trading days of observed market data to generate a distribution of potential portfolio losses without imposing assumptions about the shape of the return distribution.

**Key Parameters:**
- Confidence Level: 99th percentile (1% probability of exceedance)
- Holding Period: 1 business day
- Observation Window: 500 trading days, equally weighted
- Asset Classes Covered: Fixed income securities, foreign exchange exposures, equity investments, and derivative instruments
- Reporting Frequency: Daily calculation, weekly reporting to senior management

**Current VaR (as of January 17, 2025):** The firm-wide 1-day 99% VaR is $4.2M, reflecting an increase from $3.8M at the end of Q3 2024. The increase is primarily attributable to heightened interest rate volatility and increased duration in the fixed income portfolio following the rebalancing executed in November 2024.

**VaR by Risk Factor:**
| Risk Factor | Current VaR | Prior Quarter VaR | Change |
|---|---|---|---|
| Interest Rates | $2.9M | $2.5M | +$0.4M |
| Foreign Exchange | $1.1M | $1.0M | +$0.1M |
| Equity | $0.6M | $0.5M | +$0.1M |
| Diversification Benefit | ($0.4M) | ($0.2M) | ($0.2M) |
| **Total** | **$4.2M** | **$3.8M** | **+$0.4M** |

## 3. Stress Testing Scenarios

In addition to VaR, Acme Corp conducts monthly stress tests using both historical and hypothetical scenarios to assess potential losses under extreme but plausible market conditions.

**Historical Scenarios:**
- **2008 Global Financial Crisis Replay:** Applies the market movements observed from September through November 2008 to the current portfolio. Estimated impact: ($18.7M) loss, within the $25M stress loss tolerance.
- **COVID-19 Market Shock (March 2020):** Replicates the rapid equity selloff and credit spread widening of March 2020. Estimated impact: ($12.4M) loss.

**Hypothetical Scenarios:**
- **Interest Rate Shock (+300 bps):** A parallel upward shift of 300 basis points across the yield curve. Estimated impact: ($22.1M) loss on the fixed income portfolio, partially offset by $3.8M in hedge gains, resulting in a net impact of ($18.3M).
- **Severe USD Depreciation (15%):** A sudden 15% decline in the U.S. dollar against major trading currencies. Estimated impact: ($6.2M) loss on unhedged FX exposures.

## 4. Backtesting Results

VaR model performance is validated through daily backtesting, comparing predicted losses with actual portfolio P&L. Under the 99% confidence level, the model is expected to produce no more than 2 to 3 exceedances per year (approximately 1% of 250 trading days).

Over the trailing 12-month period ending January 17, 2025, the model recorded 3 exceedances, which falls within the acceptable range under the Basel traffic light framework (green zone). All three exceedances occurred during the period of elevated rate volatility in Q4 2024. No model remediation is required at this time, though the Risk Committee has requested enhanced monitoring of interest rate sensitivity through Q1 2025.

## 5. Limits and Escalation

**VaR Limits:**
- Firm-wide VaR limit: $7.5M (1-day, 99%)
- Interest rate VaR sub-limit: $4.5M
- FX VaR sub-limit: $2.0M
- Equity VaR sub-limit: $1.5M

**Escalation Protocol:**
- Utilization exceeding 75% of any limit: notification to CRO and Treasury Head
- Utilization exceeding 85%: mandatory position review and reduction plan within 2 business days
- Utilization exceeding 95%: immediate trading restriction pending CRO approval to resume
- Limit breach: immediate notification to the Board Risk Committee, mandatory position reduction within 24 hours

Current firm-wide VaR utilization stands at 56% ($4.2M against the $7.5M limit), which is within the normal operating range.
