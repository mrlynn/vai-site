# Acme Corp Interest Rate Sensitivity Analysis

**Document ID:** FIN-IR-2025-Q1
**Report Date:** January 31, 2025
**Classification:** Internal, Confidential
**Prepared by:** Treasury Risk Analytics

## 1. Current Rate Environment

As of January 31, 2025, the Federal Funds target range stands at 4.25% to 4.50%, following two 25-basis-point cuts in Q4 2024. Market-implied forward rates suggest an additional 50 to 75 basis points of easing over the next 12 months, though the pace remains data-dependent. The 10-year Treasury yield closed at 4.18%, reflecting a modest flattening of the yield curve relative to Q3 2024. The 2s/10s spread has narrowed to +22 basis points from +38 basis points at the end of September.

Acme Corp's balance sheet carries meaningful interest rate exposure through its investment portfolio, variable-rate credit facility, and customer financing arrangements. This report quantifies that exposure and evaluates the effectiveness of current hedging strategies.

## 2. Portfolio Duration Analysis

Duration measures the sensitivity of asset and liability values to changes in interest rates. The following table summarizes the effective duration of Acme Corp's key rate-sensitive positions as of January 31, 2025.

| Category | Book Value ($M) | Effective Duration (Years) | DV01 ($K) |
|---|---|---|---|
| Fixed Income Investments | $312.4 | 3.8 | $118.7 |
| Customer Financing Receivables | $87.6 | 2.1 | $18.4 |
| Cash and Short-Term Instruments | $156.2 | 0.2 | $3.1 |
| **Total Rate-Sensitive Assets** | **$556.2** | **3.2** | **$140.2** |
| Variable-Rate Borrowings | $200.0 | 0.3 | $6.0 |
| Fixed-Rate Notes (2027, 2030) | $175.0 | 3.4 | $59.5 |
| Operating Lease Obligations | $42.8 | 2.6 | $11.1 |
| **Total Rate-Sensitive Liabilities** | **$417.8** | **1.8** | **$76.6** |

## 3. Duration Gap Assessment

**Asset Duration:** 3.2 years
**Liability Duration:** 1.8 years
**Duration Gap:** 1.4 years (positive)

A positive duration gap of 1.4 years indicates that Acme Corp's assets are more sensitive to interest rate changes than its liabilities. In a rising rate environment, asset values will decline more than liability values, resulting in a reduction in economic value of equity. Conversely, falling rates would produce a net benefit.

The current gap has widened from 1.1 years at the end of Q3 2024, primarily due to the extension of the fixed income portfolio during the November rebalancing (average portfolio maturity increased from 4.2 to 5.1 years).

## 4. Sensitivity Analysis

The following table presents the estimated impact on Acme Corp's net interest income (NII) and economic value of equity (EVE) under parallel rate shift scenarios.

| Scenario | NII Impact (12-Month, $M) | EVE Impact ($M) |
|---|---|---|
| +200 bps | ($8.4) | ($35.2) |
| +100 bps | ($4.1) | ($17.8) |
| +50 bps | ($2.0) | ($8.9) |
| Base Case | $0.0 | $0.0 |
| -50 bps | +$1.8 | +$8.5 |
| -100 bps | +$3.4 | +$16.2 |
| -200 bps | +$6.1 | +$29.8 |

Under the +100 bps scenario, the estimated $4.1M NII reduction represents approximately 1.2% of projected annual revenue, which is within the Board-approved tolerance of 2.0%. The EVE impact of ($17.8M) represents 2.8% of total equity, within the 5.0% tolerance.

## 5. Hedging Strategy

Acme Corp employs the following derivative instruments to manage interest rate exposure:

**Interest Rate Swaps:** The company holds $125M in notional pay-fixed, receive-variable interest rate swaps with a weighted average fixed rate of 3.85% and remaining tenor of 2.3 years. These swaps effectively convert a portion of the variable-rate borrowings to fixed rate, reducing NII volatility.

**Interest Rate Caps:** The company purchased $75M in notional interest rate caps with a strike rate of 5.50% and expiry in June 2026. These caps provide protection against extreme upward rate moves while preserving the benefit of further rate declines.

**Net Hedged Position:** After accounting for derivatives, the effective duration gap narrows from 1.4 years to 0.9 years. The hedged NII sensitivity to a +100 bps shock is reduced from ($4.1M) to ($2.6M).

## 6. Hedge Effectiveness

All designated hedging relationships are assessed for effectiveness on a quarterly basis using the dollar-offset method and regression analysis.

**Q4 2024 Results:** All seven active hedge relationships achieved effectiveness ratios between 82% and 97%, within the 80% to 125% range required for hedge accounting under ASC 815. No hedges were de-designated during the quarter.

**Cumulative Hedge P&L:** For the 12 months ending January 31, 2025, the hedging program generated a net gain of $2.1M, reflecting the benefit of pay-fixed swaps in a declining rate environment. Unrealized gains on the interest rate cap portfolio total $0.8M.

The Treasury team recommends maintaining the current hedge portfolio through Q2 2025 and reassessing swap notional levels following the March and May FOMC meetings. A proposal to extend the cap program beyond June 2026 will be presented to the CFO by April 15.
