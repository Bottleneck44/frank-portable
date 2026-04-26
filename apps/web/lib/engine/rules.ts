import { RuleDefinition, RuleSeverity, FinancialYear } from "./types";
import * as calc from "./utils";

function rule(
  id: string, name: string,
  category: RuleDefinition["category"],
  severity: RuleSeverity,
  description: string,
  educationalNote: string,
  evaluate: RuleDefinition["evaluate"]
): RuleDefinition {
  return { id, name, category, severity, description, educationalNote, evaluate };
}

// ─── PROFITABILITY ────────────────────────────────────────────────────────────

const R_GROSS_MARGIN = rule(
  "PROF_001", "Gross Margin Trend", "profitability", "warning",
  "Checks if gross margin is declining over time",
  "Gross margin = (Revenue − Cost of Goods Sold) / Revenue. It shows how much of each rupee of sales the company keeps after direct costs. A declining trend means either pricing power is weakening or input costs are rising faster than the company can pass them on.",
  (years) => {
    const values = calc.extractValuesOverTime(years, calc.grossMargin);
    const trend = calc.analyzeTrend(values);
    const passed = trend.direction !== "deteriorating";
    return { passed, value: trend.endValue, threshold: "Stable or improving", trend: trend.direction,
      message: passed ? `Gross margin is ${trend.direction} at ${calc.formatPercentage(trend.endValue)}` : `Gross margin declined ${calc.formatPercentage(Math.abs(trend.percentageChange))} from ${calc.formatPercentage(trend.startValue)} to ${calc.formatPercentage(trend.endValue)}`,
      recommendation: "Investigate pricing power erosion or rising input costs" };
  }
);

const R_OP_MARGIN = rule(
  "PROF_002", "Operating Margin Adequacy", "profitability", "caution",
  "Checks if operating margin is above minimum threshold",
  "Operating margin = Operating Income / Revenue. It measures how much profit a company makes on each rupee of sales after paying variable production costs and fixed costs like salaries and rent, but before interest and taxes. Below 5% signals weak cost control.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const margin = calc.operatingMargin(latest);
    const passed = margin >= 5;
    return { passed, value: margin, threshold: 5,
      message: passed ? `Operating margin of ${calc.formatPercentage(margin)} indicates reasonable efficiency` : `Operating margin of ${calc.formatPercentage(margin)} is below 5%, suggesting weak operational control`,
      recommendation: "Review fixed-cost structure and pricing strategy" };
  }
);

const R_NET_PROFIT = rule(
  "PROF_003", "Net Profitability", "profitability", "critical",
  "Checks if the company is profitable",
  "Net profit margin = Net Income / Revenue. This is the 'bottom line' — how much of each rupee of sales becomes actual profit after ALL expenses including taxes and interest. A negative number means the company is losing money on its core business.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const margin = calc.netProfitMargin(latest);
    const passed = margin > 0;
    return { passed, value: margin, threshold: "> 0%",
      message: passed ? `Company is profitable with net margin of ${calc.formatPercentage(margin)}` : `Company is loss-making with net margin of ${calc.formatPercentage(margin)}`,
      recommendation: "Loss-making companies carry elevated risk of capital erosion" };
  }
);

const R_ROE = rule(
  "PROF_004", "Return on Equity", "profitability", "caution",
  "Checks if ROE meets minimum expectations",
  "ROE = Net Income / Shareholders' Equity. Think of it as: for every ₹100 shareholders have invested, how many rupees of profit does the company generate? A figure below 12% often means shareholders would be better off in a fixed deposit.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const roe = calc.returnOnEquity(latest);
    const passed = roe >= 12;
    return { passed, value: roe, threshold: 12,
      message: passed ? `ROE of ${calc.formatPercentage(roe)} suggests adequate shareholder returns` : `ROE of ${calc.formatPercentage(roe)} is below 12%, indicating suboptimal capital efficiency`,
      recommendation: "Compare against sector peers and risk-free rate" };
  }
);

const R_ROA = rule(
  "PROF_005", "Return on Assets", "profitability", "info",
  "Checks if ROA meets minimum expectations",
  "ROA = Net Income / Total Assets. It measures how efficiently management uses the company's assets to generate profit. A bank or heavy-industry company naturally has lower ROA than a software company — context matters.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const roa = calc.returnOnAssets(latest);
    const passed = roa >= 5;
    return { passed, value: roa, threshold: 5,
      message: passed ? `ROA of ${calc.formatPercentage(roa)} indicates efficient asset utilization` : `ROA of ${calc.formatPercentage(roa)} is below 5%`,
      recommendation: "Compare with industry average — asset-heavy industries tolerate lower ROA" };
  }
);

const R_MARGIN_CONSISTENCY = rule(
  "PROF_006", "Profit Margin Consistency", "profitability", "warning",
  "Checks for erratic swings in net profit margin",
  "Highly volatile net margins across years can indicate one-time charges, accounting adjustments, or an unpredictable business model. Consistent margins — even if modest — are a sign of a stable, predictable business that is easier to value.",
  (years) => {
    const values = calc.extractValuesOverTime(years, calc.netProfitMargin);
    if (values.length < 3) return { passed: true, value: null, threshold: null, message: "Insufficient data for consistency check", recommendation: "" };
    const maxSwing = Math.max(...values) - Math.min(...values);
    const passed = maxSwing <= 15;
    return { passed, value: maxSwing, threshold: 15,
      message: passed ? "Profit margins are reasonably consistent" : `Profit margins show ${calc.formatPercentage(maxSwing)} swing, suggesting earnings instability`,
      recommendation: "Investigate one-time items or cyclical exposure" };
  }
);

// ─── LIQUIDITY ────────────────────────────────────────────────────────────────

const R_CURRENT_RATIO = rule(
  "LIQ_001", "Current Ratio", "liquidity", "warning",
  "Checks short-term liquidity adequacy",
  "Current Ratio = Current Assets / Current Liabilities. It answers: can the company pay its bills due within the next 12 months using assets it can convert to cash within 12 months? Below 1.0 is a danger sign — liabilities exceed liquid assets.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const ratio = calc.currentRatio(latest);
    const passed = ratio >= 1.0;
    return { passed, value: ratio, threshold: 1.0,
      message: passed ? `Current ratio of ${calc.formatNumber(ratio)} indicates adequate short-term liquidity` : `Current ratio of ${calc.formatNumber(ratio)} is below 1.0, suggesting potential liquidity stress`,
      recommendation: "Company may struggle to meet short-term obligations" };
  }
);

const R_QUICK_RATIO = rule(
  "LIQ_002", "Quick Ratio (Acid Test)", "liquidity", "caution",
  "Checks liquidity excluding inventory",
  "Quick Ratio = (Current Assets − Inventory) / Current Liabilities. It's a stricter version of the current ratio because inventory can't always be converted to cash quickly. This is especially important for manufacturing or retail companies.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const ratio = calc.quickRatio(latest);
    const passed = ratio >= 0.8;
    return { passed, value: ratio, threshold: 0.8,
      message: passed ? `Quick ratio of ${calc.formatNumber(ratio)} suggests ability to meet obligations without selling inventory` : `Quick ratio of ${calc.formatNumber(ratio)} is low, indicating reliance on inventory liquidation`,
      recommendation: "Assess inventory quality and liquidation timeline" };
  }
);

const R_LIQUIDITY_TREND = rule(
  "LIQ_003", "Liquidity Trend", "liquidity", "caution",
  "Checks if current ratio is deteriorating",
  "Even if the current ratio is acceptable today, a consistent downward trend is a warning sign. It may mean the company is taking on more short-term debt or seeing its current assets shrink — both of which can lead to a liquidity crisis.",
  (years) => {
    const values = calc.extractValuesOverTime(years, calc.currentRatio);
    const trend = calc.analyzeTrend(values);
    const passed = trend.direction !== "deteriorating";
    return { passed, value: trend.endValue, threshold: "Stable or improving", trend: trend.direction,
      message: passed ? `Liquidity position is ${trend.direction}` : `Liquidity is deteriorating: current ratio fell from ${calc.formatNumber(trend.startValue)} to ${calc.formatNumber(trend.endValue)}`,
      recommendation: "Monitor short-term debt levels and working capital management" };
  }
);

const R_CASH_POSITION = rule(
  "LIQ_004", "Cash Position", "liquidity", "info",
  "Checks if cash covers at least 3 months of operating expenses",
  "Cash runway tells you how long the company can keep operating even if revenues suddenly stop. At least 3 months provides a buffer for unexpected disruptions. Startups and growth companies often burn through cash — this metric helps identify that risk.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const cash = latest.balanceSheet.cashAndEquivalents;
    const monthlyOpex = latest.incomeStatement.operatingExpenses / 12;
    const monthsCovered = monthlyOpex > 0 ? cash / monthlyOpex : Infinity;
    const passed = monthsCovered >= 3;
    return { passed, value: Number(monthsCovered.toFixed(1)), threshold: 3,
      message: passed ? `Cash reserves cover ~${calc.formatNumber(monthsCovered, 1)} months of operating expenses` : `Cash reserves cover only ${calc.formatNumber(monthsCovered, 1)} months of operating expenses`,
      recommendation: "Consider cash burn rate relative to fundraising or cash generation capacity" };
  }
);

// ─── SOLVENCY ─────────────────────────────────────────────────────────────────

const R_DE_RATIO = rule(
  "SOLV_001", "Debt to Equity Ratio", "solvency", "warning",
  "Checks if leverage is within acceptable bounds",
  "D/E Ratio = Total Liabilities / Shareholders' Equity. It shows how much debt the company uses to finance its assets relative to equity. High D/E means the company is heavily reliant on creditors — fine in good times, dangerous when revenues fall.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const ratio = calc.debtToEquity(latest);
    const passed = isFinite(ratio) ? ratio <= 2.0 : false;
    return { passed, value: isFinite(ratio) ? ratio : null, threshold: 2.0,
      message: passed ? `Debt-to-equity of ${calc.formatNumber(ratio)} is within acceptable range` : `Debt-to-equity of ${isFinite(ratio) ? calc.formatNumber(ratio) : "N/A"} exceeds 2.0, indicating high financial leverage`,
      recommendation: "High leverage increases vulnerability to interest rate changes" };
  }
);

const R_INTEREST_COVERAGE = rule(
  "SOLV_002", "Interest Coverage Ratio", "solvency", "critical",
  "Checks ability to service debt from operations",
  "Interest Coverage = Operating Income / Interest Expense. It answers: can the company afford its interest payments from its operations? Below 2x is dangerous — if profits dip even slightly, the company may not be able to pay its lenders.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const ratio = calc.interestCoverageRatio(latest);
    const noDebt = latest.incomeStatement.interestExpense === 0;
    const passed = noDebt || (isFinite(ratio) && ratio >= 2.0);
    return { passed, value: isFinite(ratio) ? ratio : null, threshold: 2.0,
      message: noDebt ? "No interest expense reported — debt-free company" : passed ? `Interest coverage of ${calc.formatNumber(ratio)}x provides adequate debt service buffer` : `Interest coverage of ${calc.formatNumber(ratio)}x is dangerously low. Debt service at risk.`,
      recommendation: "Low coverage means any revenue shock could trigger default" };
  }
);

const R_DEBT_RATIO = rule(
  "SOLV_003", "Total Debt Ratio", "solvency", "caution",
  "Checks proportion of assets funded by debt",
  "Debt Ratio = Total Liabilities / Total Assets. While D/E compares debt to equity, this ratio shows what fraction of the company's entire asset base is funded by creditors. Above 70% means creditors own more of the company than shareholders do.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const ratio = latest.balanceSheet.totalAssets > 0 ? (latest.balanceSheet.totalLiabilities / latest.balanceSheet.totalAssets) * 100 : 0;
    const passed = ratio <= 70;
    return { passed, value: ratio, threshold: 70,
      message: passed ? `${calc.formatPercentage(ratio)} of assets are debt-funded` : `${calc.formatPercentage(ratio)} of assets are debt-funded — elevated leverage`,
      recommendation: "Compare with industry norms — financial services firms tolerate higher ratios" };
  }
);

const R_NEGATIVE_EQUITY = rule(
  "SOLV_004", "Shareholder Equity", "solvency", "critical",
  "Checks for negative shareholder equity (technical insolvency)",
  "Shareholders' equity = Total Assets − Total Liabilities. When this goes negative, liabilities exceed assets — the company owes more than it owns. This is called 'technical insolvency.' It doesn't mean bankruptcy is immediate, but it's a severe warning sign.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const equity = latest.balanceSheet.shareholderEquity;
    const passed = equity > 0;
    return { passed, value: equity, threshold: "> 0",
      message: passed ? "Shareholder equity is positive" : "CRITICAL: Negative equity — liabilities exceed assets. Technical insolvency.",
      recommendation: "Negative equity is a severe red flag requiring immediate attention" };
  }
);

const R_LEVERAGE_TREND = rule(
  "SOLV_005", "Leverage Trend", "solvency", "caution",
  "Checks if debt-to-equity is increasing",
  "Even if D/E is acceptable today, a steadily rising trend suggests the company is taking on more and more debt relative to equity. This is an early warning sign of potential over-leverage, especially as interest rates rise.",
  (years) => {
    const values = calc.extractValuesOverTime(years, calc.debtToEquity).filter(isFinite);
    const trend = calc.analyzeTrend(values);
    const passed = trend.percentageChange <= 20;
    return { passed, value: trend.endValue, threshold: "Stable or decreasing", trend: trend.direction,
      message: passed ? "Leverage levels are stable or improving" : `Leverage increasing: D/E rose by ${calc.formatPercentage(trend.percentageChange)}`,
      recommendation: "Investigate if debt is funding growth (potentially ok) or covering losses (concerning)" };
  }
);

// ─── EFFICIENCY ───────────────────────────────────────────────────────────────

const R_ASSET_TURNOVER = rule(
  "EFF_001", "Asset Turnover", "efficiency", "info",
  "Checks how efficiently assets generate revenue",
  "Asset Turnover = Revenue / Total Assets. It measures how many rupees of revenue the company generates for each rupee of assets it holds. A ratio below 0.5 may indicate assets are idle or underutilized — though capital-intensive industries like utilities naturally have lower ratios.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const ratio = calc.assetTurnover(latest);
    const passed = ratio >= 0.5;
    return { passed, value: ratio, threshold: 0.5,
      message: passed ? `Asset turnover of ${calc.formatNumber(ratio)} indicates reasonable asset utilization` : `Asset turnover of ${calc.formatNumber(ratio)} is low, suggesting underutilized assets`,
      recommendation: "Context-dependent — compare with sector peers" };
  }
);

const R_INVENTORY_DAYS = rule(
  "EFF_002", "Days Inventory Outstanding", "efficiency", "caution",
  "Checks for inventory buildup",
  "DIO = 365 / Inventory Turnover. It tells you how many days, on average, inventory sits in the warehouse before being sold. High DIO can mean products are not selling, obsolescence risk is building, or management is over-ordering.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const days = calc.daysInventoryOutstanding(latest);
    const noInventory = latest.balanceSheet.inventory === 0;
    const passed = noInventory || days <= 120;
    return { passed, value: days, threshold: 120,
      message: noInventory ? "No significant inventory (service/asset-light model)" : passed ? `Inventory turns over every ${calc.formatNumber(days, 0)} days` : `Inventory takes ${calc.formatNumber(days, 0)} days to turn — possible obsolescence risk`,
      recommendation: "High DIO in retail/manufacturing warrants deeper investigation" };
  }
);

const R_RECEIVABLES_DAYS = rule(
  "EFF_003", "Days Receivables Outstanding", "efficiency", "caution",
  "Checks for collection issues",
  "DRO = 365 / Receivables Turnover. It shows how long the company waits to collect cash after making a sale. High DRO means customers are slow to pay — this can create cash flow problems or indicate that revenue is being recognized before cash is actually received.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const days = calc.daysReceivablesOutstanding(latest);
    const noAR = latest.balanceSheet.accountsReceivable === 0;
    const passed = noAR || days <= 90;
    return { passed, value: days, threshold: 90,
      message: noAR ? "No significant receivables (cash business model)" : passed ? `Average collection period is ${calc.formatNumber(days, 0)} days` : `Collection period of ${calc.formatNumber(days, 0)} days — possible collection issues or aggressive revenue recognition`,
      recommendation: "Investigate customer concentration and credit terms" };
  }
);

const R_WORKING_CAPITAL = rule(
  "EFF_004", "Working Capital to Revenue", "efficiency", "info",
  "Checks working capital intensity",
  "Working Capital = Current Assets − Current Liabilities. High working capital relative to revenue means the business needs a lot of cash tied up just to run day-to-day operations. This limits how much cash is available for growth or returns to shareholders.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const wc = latest.balanceSheet.currentAssets - latest.balanceSheet.currentLiabilities;
    const ratio = latest.incomeStatement.revenue > 0 ? (wc / latest.incomeStatement.revenue) * 100 : 0;
    const passed = ratio <= 30;
    return { passed, value: ratio, threshold: 30,
      message: passed ? `Working capital at ${calc.formatPercentage(ratio)} of revenue — efficient capital management` : `Working capital at ${calc.formatPercentage(ratio)} of revenue — capital-intensive operations`,
      recommendation: "Negative working capital can be fine (e.g., supermarkets) if cash cycle is favorable" };
  }
);

// ─── EARNINGS QUALITY ─────────────────────────────────────────────────────────

const R_OCF_VS_NI = rule(
  "EQ_001", "Operating Cash Flow vs Net Income", "earnings_quality", "warning",
  "Checks if reported earnings are backed by cash",
  "A company can report profits on paper while actually running out of cash — this is called 'accrual manipulation.' The ratio OCF/Net Income should be close to 1.0. A value well below 0.8 means earnings are not being converted to cash, which is a classic early sign of accounting problems.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const ratio = calc.operatingCashFlowToNetIncome(latest);
    const notApplicable = latest.incomeStatement.netIncome <= 0;
    const passed = notApplicable || (isFinite(ratio) && ratio >= 0.8);
    return { passed, value: isFinite(ratio) ? ratio : null, threshold: 0.8,
      message: notApplicable ? "Company is loss-making, OCF comparison not applicable" : passed ? `OCF is ${calc.formatNumber(ratio)}x net income — quality earnings` : `OCF is only ${calc.formatNumber(ratio)}x net income — earnings may not be backed by cash`,
      recommendation: "Low OCF/NI can indicate aggressive accounting or working capital issues" };
  }
);

const R_ACCRUALS = rule(
  "EQ_002", "Accruals Quality (Sloan Ratio)", "earnings_quality", "warning",
  "Checks for high accruals relative to assets",
  "The Sloan Ratio = (Net Income − Operating Cash Flow) / Total Assets. High accruals mean a large portion of earnings comes from accounting estimates rather than real cash. Research shows that high-accrual companies tend to have lower future earnings — it's a forward-looking red flag.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const accruals = latest.incomeStatement.netIncome - latest.cashFlow.operatingCashFlow;
    const ratio = latest.balanceSheet.totalAssets > 0 ? (accruals / latest.balanceSheet.totalAssets) * 100 : 0;
    const passed = Math.abs(ratio) <= 10;
    return { passed, value: ratio, threshold: 10,
      message: passed ? `Accruals at ${calc.formatPercentage(ratio)} of assets — within normal range` : `Accruals at ${calc.formatPercentage(ratio)} of assets — potential earnings manipulation`,
      recommendation: "High accruals often precede earnings reversals" };
  }
);

const R_REV_AR_DIVERGENCE = rule(
  "EQ_003", "Revenue vs Receivables Growth", "earnings_quality", "warning",
  "Checks for receivables growing faster than revenue",
  "If accounts receivable grow much faster than revenue, it can mean the company is extending aggressive credit terms to boost reported sales, or customers are not actually paying. This is called 'channel stuffing' and it inflates revenue artificially.",
  (years) => {
    const revValues = calc.extractValuesOverTime(years, (y) => y.incomeStatement.revenue);
    const arValues = calc.extractValuesOverTime(years, (y) => y.balanceSheet.accountsReceivable);
    const revTrend = calc.analyzeTrend(revValues);
    const arTrend = calc.analyzeTrend(arValues);
    const divergence = arTrend.percentageChange - revTrend.percentageChange;
    const passed = divergence <= 20;
    return { passed, value: divergence, threshold: 20,
      message: passed ? "Receivables growth is consistent with revenue growth" : `Receivables grew ${calc.formatPercentage(divergence)} faster than revenue — possible channel stuffing`,
      recommendation: "Investigate credit terms and customer concentration" };
  }
);

const R_INV_REV_DIVERGENCE = rule(
  "EQ_004", "Inventory vs Revenue Growth", "earnings_quality", "caution",
  "Checks for inventory growing faster than sales",
  "When inventory grows faster than revenue, it often signals weakening demand — the company is producing but not selling. This can lead to future write-downs (charges against profits) and cash flow problems as money is tied up in unsold goods.",
  (years) => {
    const revValues = calc.extractValuesOverTime(years, (y) => y.incomeStatement.revenue);
    const invValues = calc.extractValuesOverTime(years, (y) => y.balanceSheet.inventory);
    const revTrend = calc.analyzeTrend(revValues);
    const invTrend = calc.analyzeTrend(invValues);
    const divergence = invTrend.percentageChange - revTrend.percentageChange;
    const passed = divergence <= 25;
    return { passed, value: divergence, threshold: 25,
      message: passed ? "Inventory growth is aligned with revenue" : `Inventory grew ${calc.formatPercentage(divergence)} faster than revenue — possible demand weakness`,
      recommendation: "Assess inventory age and write-down risk" };
  }
);

const R_GP_COGS = rule(
  "EQ_005", "Gross Profit Arithmetic Check", "earnings_quality", "critical",
  "Validates that Revenue - COGS = Gross Profit",
  "This is a data integrity check. The basic accounting equation is Gross Profit = Revenue − COGS. If the numbers provided don't add up, either the data entry has errors or the financial statements have been manipulated. Always verify data quality before trusting any analysis.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const { revenue, cogs, grossProfit } = latest.incomeStatement;
    const expected = revenue - cogs;
    const tolerance = Math.abs(expected * 0.01);
    const passed = Math.abs(grossProfit - expected) <= tolerance;
    return { passed, value: grossProfit, threshold: expected,
      message: passed ? "Income statement arithmetic is consistent" : `Gross profit (${grossProfit}) ≠ Revenue − COGS (${expected}). Data may be incorrect.`,
      recommendation: "Verify input data accuracy before relying on this analysis" };
  }
);

// ─── CASH FLOW ────────────────────────────────────────────────────────────────

const R_NEGATIVE_OCF = rule(
  "CF_001", "Operating Cash Flow", "cash_flow", "critical",
  "Checks if operations generate cash",
  "Operating Cash Flow is the lifeblood of a business — it's the cash actually generated from running the core business. A company can survive short periods of negative OCF (e.g., during a growth phase), but sustained negative OCF means the company is burning through reserves and will eventually need outside funding.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const ocf = latest.cashFlow.operatingCashFlow;
    const passed = ocf > 0;
    return { passed, value: ocf, threshold: "> 0",
      message: passed ? `Operations generated ₹${ocf.toLocaleString()} in cash flow` : `Operations consumed ₹${Math.abs(ocf).toLocaleString()} — core business is cash-burning`,
      recommendation: "Negative OCF is unsustainable long-term without external funding" };
  }
);

const R_FCF = rule(
  "CF_002", "Free Cash Flow", "cash_flow", "warning",
  "Checks if company generates free cash flow",
  "Free Cash Flow = Operating Cash Flow − Capital Expenditures. It represents the cash left over after maintaining and expanding the asset base. FCF is what pays dividends, funds buybacks, reduces debt, or finances acquisitions. Consistently positive FCF is one of the strongest signs of financial health.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const fcf = calc.freeCashFlow(latest);
    const passed = fcf > 0;
    return { passed, value: fcf, threshold: "> 0",
      message: passed ? `Free cash flow of ₹${fcf.toLocaleString()} available for dividends, buybacks, or debt reduction` : `Negative FCF of ₹${Math.abs(fcf).toLocaleString()} — requires external funding`,
      recommendation: "Distinguish between FCF negative due to growth capex (ok) vs poor operations (bad)" };
  }
);

const R_OCF_TREND = rule(
  "CF_003", "Operating Cash Flow Trend", "cash_flow", "caution",
  "Checks if OCF is improving over time",
  "A company with positive OCF today but a declining trend may be heading toward trouble. Watch for OCF shrinking year-over-year — it can mean margins are compressing, customers are paying more slowly, or the business model is under pressure.",
  (years) => {
    const values = calc.extractValuesOverTime(years, (y) => y.cashFlow.operatingCashFlow);
    const trend = calc.analyzeTrend(values);
    const passed = trend.direction !== "deteriorating";
    return { passed, value: trend.endValue, threshold: "Stable or improving", trend: trend.direction,
      message: passed ? `OCF trend is ${trend.direction}` : `OCF is deteriorating, declining ${calc.formatPercentage(Math.abs(trend.percentageChange))}`,
      recommendation: "Distinguish seasonal effects from structural decline" };
  }
);

// ─── RED FLAGS ────────────────────────────────────────────────────────────────

const R_BS_EQUATION = rule(
  "RF_001", "Balance Sheet Equation", "red_flags", "critical",
  "Validates Assets = Liabilities + Equity",
  "Every balance sheet must satisfy: Total Assets = Total Liabilities + Shareholders' Equity. If this basic equation doesn't hold (within a 1% tolerance for rounding), the data is unreliable. Never draw conclusions from a balance sheet that doesn't balance.",
  (years) => {
    const latest = calc.getLatestYear(years);
    const { totalAssets, totalLiabilities, shareholderEquity } = latest.balanceSheet;
    const expected = totalLiabilities + shareholderEquity;
    const tolerance = Math.abs(totalAssets * 0.01);
    const passed = Math.abs(totalAssets - expected) <= tolerance;
    return { passed, value: totalAssets, threshold: expected,
      message: passed ? "Balance sheet equation is valid" : `Balance sheet doesn't balance: Assets (${totalAssets.toLocaleString()}) ≠ Liabilities + Equity (${expected.toLocaleString()})`,
      recommendation: "Correct input data before proceeding with any analysis" };
  }
);

const R_CONSECUTIVE_LOSSES = rule(
  "RF_002", "Consecutive Losses", "red_flags", "critical",
  "Checks for multiple years of losses",
  "One year of losses can happen to any company (COVID, one-time charges). Two or more consecutive years of losses is a structural problem — it suggests the business model is not working and the company is systematically destroying value.",
  (years) => {
    const sorted = [...years].sort((a, b) => b.year - a.year);
    let consecutive = 0;
    for (const y of sorted) {
      if (y.incomeStatement.netIncome < 0) consecutive++;
      else break;
    }
    const passed = consecutive < 2;
    return { passed, value: consecutive, threshold: "< 2",
      message: passed ? consecutive === 0 ? "No recent losses" : "One year of loss recorded" : `${consecutive} consecutive years of losses — viability concerns`,
      recommendation: "Multiple consecutive losses indicate structural business problems" };
  }
);

const R_REVENUE_DECLINE = rule(
  "RF_003", "Revenue Decline", "red_flags", "warning",
  "Checks for significant revenue decline",
  "Revenue is the starting point of every financial analysis. If the company can't grow or even maintain its revenue, everything downstream (profits, cash flow) will suffer. A decline greater than 10% over the analysis period suggests the company is losing market share or customers.",
  (years) => {
    const values = calc.extractValuesOverTime(years, (y) => y.incomeStatement.revenue);
    const trend = calc.analyzeTrend(values);
    const passed = trend.percentageChange >= -10;
    return { passed, value: trend.percentageChange, threshold: -10,
      message: passed ? `Revenue trend: ${calc.formatPercentage(trend.percentageChange)} change` : `Revenue declined ${calc.formatPercentage(Math.abs(trend.percentageChange))} — market share loss or demand erosion`,
      recommendation: "Investigate competitive dynamics and market conditions" };
  }
);

// ─── GROWTH RULES ─────────────────────────────────────────────────────────────

const R_REVENUE_GROWTH = rule(
  "GROW_001", "Revenue Growth", "growth", "info",
  "Checks if revenue is growing over the analysis period",
  "Revenue growth is the engine of long-term shareholder value. A company growing revenues consistently is expanding its market presence. Flat or shrinking revenue in a growing economy signals competitive pressure. Note: high growth rates in early-stage companies are normal; in mature companies they're exceptional.",
  (years) => {
    const values = calc.extractValuesOverTime(years, (y) => y.incomeStatement.revenue);
    const trend = calc.analyzeTrend(values);
    const passed = trend.percentageChange >= 10;
    return { passed, value: trend.percentageChange, threshold: 10, trend: trend.direction,
      message: trend.direction === "improving" ? `Revenue grew ${calc.formatPercentage(trend.percentageChange)} — healthy expansion` : `Revenue growth of ${calc.formatPercentage(trend.percentageChange)} is below expectations`,
      recommendation: "Compare with industry growth rate to assess competitive positioning" };
  }
);

const R_EARNINGS_GROWTH = rule(
  "GROW_002", "Earnings Growth", "growth", "info",
  "Checks if net income is growing",
  "Revenue growth is good, but earnings growth is better. A company that grows revenue without growing profits may be investing heavily for future returns (potentially fine) or struggling to manage costs (a problem). Consistent earnings growth is what creates durable shareholder value.",
  (years) => {
    const values = calc.extractValuesOverTime(years, (y) => y.incomeStatement.netIncome).filter((v) => v > 0);
    if (values.length < 2) return { passed: true, value: null, threshold: null, message: "Insufficient profitable years for growth analysis", recommendation: "" };
    const trend = calc.analyzeTrend(values);
    const passed = trend.percentageChange >= 5;
    return { passed, value: trend.percentageChange, threshold: 5, trend: trend.direction,
      message: passed ? `Earnings grew ${calc.formatPercentage(trend.percentageChange)} — positive momentum` : `Earnings growth of ${calc.formatPercentage(trend.percentageChange)} is below expectations`,
      recommendation: "Look for consistency — one large year can inflate the trend" };
  }
);

// ─── ALL RULES ────────────────────────────────────────────────────────────────

export const ALL_RULES: RuleDefinition[] = [
  R_GROSS_MARGIN, R_OP_MARGIN, R_NET_PROFIT, R_ROE, R_ROA, R_MARGIN_CONSISTENCY,
  R_CURRENT_RATIO, R_QUICK_RATIO, R_LIQUIDITY_TREND, R_CASH_POSITION,
  R_DE_RATIO, R_INTEREST_COVERAGE, R_DEBT_RATIO, R_NEGATIVE_EQUITY, R_LEVERAGE_TREND,
  R_ASSET_TURNOVER, R_INVENTORY_DAYS, R_RECEIVABLES_DAYS, R_WORKING_CAPITAL,
  R_OCF_VS_NI, R_ACCRUALS, R_REV_AR_DIVERGENCE, R_INV_REV_DIVERGENCE, R_GP_COGS,
  R_NEGATIVE_OCF, R_FCF, R_OCF_TREND,
  R_BS_EQUATION, R_CONSECUTIVE_LOSSES, R_REVENUE_DECLINE,
  R_REVENUE_GROWTH, R_EARNINGS_GROWTH,
];

export const RULE_ENGINE_VERSION = "2.0.0";
