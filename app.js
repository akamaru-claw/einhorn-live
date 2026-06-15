function fmt(value) {
  if (value === undefined || value === null || isNaN(value)) return '—';
  const rounded = Math.round(value);
  return '€' + rounded.toLocaleString('de-DE');
}
function fmtPct(value) {
  if (value === undefined || value === null || isNaN(value)) return '—';
  return (value * 100).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
}
function fmtNum(value) {
  if (value === undefined || value === null || isNaN(value)) return '—';
  return value.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 8 });
}

function getInputs() {
  const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
  const btcAmount = parseFloat(document.getElementById('btcAmount').value) || 0;
  const btcPriceNow = parseFloat(document.getElementById('btcPriceNow').value) || 0;
  const holdingPeriodMet = document.getElementById('holdingPeriodMet').value === 'yes';
  const btcPricePessimistic = parseFloat(document.getElementById('btcPricePessimistic').value) || 0;
  const btcPriceRealistic = parseFloat(document.getElementById('btcPriceRealistic').value) || 0;
  const btcPriceOptimistic = parseFloat(document.getElementById('btcPriceOptimistic').value) || 0;
  const btcLoanRate = (parseFloat(document.getElementById('btcLoanRate').value) || 0) / 100;
  const dealerLoanRate = (parseFloat(document.getElementById('dealerLoanRate').value) || 0) / 100;
  const dealerLoanYears = parseInt(document.getElementById('dealerLoanYears').value) || 5;
  const dealerDownPaymentPercent = (parseFloat(document.getElementById('dealerDownPaymentPercent').value) || 0) / 100;
  const taxRate = (parseFloat(document.getElementById('taxRate').value) || 0) / 100;
  const weightBtcRetention = parseInt(document.getElementById('weightBtcRetention').value) || 3;
  const weightMonthlyBurden = parseInt(document.getElementById('weightMonthlyBurden').value) || 3;
  const weightImmediateSale = parseInt(document.getElementById('weightImmediateSale').value) || 3;
  const weightTotalCost = parseInt(document.getElementById('weightTotalCost').value) || 3;
  return { purchasePrice, btcAmount, btcPriceNow, holdingPeriodMet, btcPricePessimistic, btcPriceRealistic, btcPriceOptimistic, btcLoanRate, dealerLoanRate, dealerLoanYears, dealerDownPaymentPercent, taxRate, weightBtcRetention, weightMonthlyBurden, weightImmediateSale, weightTotalCost };
}

function calcTax(btcAmount, btcPriceNow, btcPriceFuture, taxRate, holdingPeriodMet) {
  // Einfaches FIFO-Modell: Gewinn = (Future - Now) * Menge
  const gain = Math.max(0, (btcPriceFuture - btcPriceNow) * btcAmount);
  return holdingPeriodMet ? 0 : gain * taxRate;
}

function calcBtcLoanScenario(i) {
  // Maximaler Kredit: 50% LTV, also Kreditsumme <= 50% des Wertes der hinterlegten BTC
  // Wenn mehr BTC da sind, kann man weniger hinterlegen und den Rest behalten.
  const totalBtcValue = i.btcAmount * i.btcPriceNow;
  const maxLoanFromLtv = totalBtcValue * 0.50; // LTV 50%

  // Kredit soll den Kaufpreis decken
  const loanNeeded = i.purchasePrice;
  const loanAmount = Math.min(loanNeeded, maxLoanFromLtv);
  const directPayment = i.purchasePrice - loanAmount;

  // BTC, die als Sicherheit hinterlegt werden müssen (2x Kreditsumme)
  const btcCollateralValueNeeded = loanAmount * 2;
  const btcCollateralAmount = btcCollateralValueNeeded / i.btcPriceNow;
  const btcRemaining = i.btcAmount - btcCollateralAmount;

  // 1 Jahr Zinskosten
  const yearlyInterest = loanAmount * i.btcLoanRate;
  const totalInterest5Y = yearlyInterest * 5;

  // Verkaufte BTC für direkte Zahlung
  const btcSoldNowForDirect = directPayment > 0 ? directPayment / i.btcPriceNow : 0;
  const finalBtcIfNoLoan = i.btcAmount - (i.purchasePrice / i.btcPriceNow);

  return {
    loanAmount,
    directPayment,
    btcCollateralValueNeeded,
    btcCollateralAmount,
    btcRemaining,
    yearlyInterest,
    totalInterest5Y,
    btcSoldNowForDirect,
    isFeasible: loanAmount >= i.purchasePrice || directPayment >= 0,
    ltv: 50,
    covered: loanAmount >= i.purchasePrice ? 'vollständig' : 'teilweise',
  };
}

function calcDealerLoanScenario(i) {
  const downPayment = i.purchasePrice * i.dealerDownPaymentPercent;
  const loanAmount = i.purchasePrice - downPayment;
  const monthlyRate = i.dealerLoanRate / 12;
  const months = i.dealerLoanYears * 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalPaid = downPayment + monthlyPayment * months;
  const totalInterest = totalPaid - i.purchasePrice;
  const btcSoldNow = downPayment > 0 ? downPayment / i.btcPriceNow : 0;
  const btcRemaining = i.btcAmount - btcSoldNow;
  return { downPayment, loanAmount, monthlyPayment, totalPaid, totalInterest, btcSoldNow, btcRemaining, months };
}

function calcSellNowScenario(i) {
  const btcNeeded = i.purchasePrice / i.btcPriceNow;
  const btcRemaining = i.btcAmount - btcNeeded;
  const tax = 0; // Haltefrist irrelevant, wenn jetzt verkauft — Steuer wird sowieso fällig, aber das ist in diesem Snapshot schon eingerechnet
  const proceeds = i.purchasePrice;
  return { btcNeeded, btcRemaining, proceeds };
}

function calcFutureScenarios(i) {
  const scenarios = [
    { name: 'Pessimistisch', price: i.btcPricePessimistic },
    { name: 'Realistisch', price: i.btcPriceRealistic },
    { name: 'Optimistisch', price: i.btcPriceOptimistic },
  ];
  return scenarios.map(s => {
    const btcNeeded = i.purchasePrice / s.price;
    const btcRemaining = i.btcAmount - btcNeeded;
    const tax = calcTax(i.btcAmount, i.btcPriceNow, s.price, i.taxRate, i.holdingPeriodMet);
    const opportunityCost = Math.max(0, i.purchasePrice - (btcNeeded * i.btcPriceNow)); // Verlust ggü. heute (wenn Preis steigt)
    const gainVsNow = (s.price - i.btcPriceNow) * i.btcAmount;
    return { ...s, btcNeeded, btcRemaining, tax, opportunityCost, gainVsNow };
  });
}

function generateAmortizationTable(i) {
  const dl = calcDealerLoanScenario(i);
  const rows = [];
  let remaining = dl.loanAmount;
  for (let m = 1; m <= dl.months; m++) {
    const interest = remaining * (i.dealerLoanRate / 12);
    const principal = dl.monthlyPayment - interest;
    remaining -= principal;
    if (m <= 12 || m % 12 === 0 || m === dl.months) {
      rows.push({ month: m, payment: dl.monthlyPayment, interest, principal, remaining: Math.max(0, remaining) });
    }
  }
  return rows;
}

function metric(label, value, cls = 'neutral') {
  return `<div class="metric"><span class="label">${label}</span><span class="value ${cls}">${value}</span></div>`;
}

function render() {
  const results = document.getElementById('results');
  if (results) {
    results.classList.remove('hidden');
  }

  const i = getInputs();

  // Summary
  const totalBtcValue = i.btcAmount * i.btcPriceNow;
  const canAffordNow = totalBtcValue >= i.purchasePrice;
  document.getElementById('summaryText').innerHTML = `
    ${metric('Wert deiner BTC heute', fmt(totalBtcValue), canAffordNow ? 'positive' : 'negative')}
    ${metric('Kaufpreis', fmt(i.purchasePrice))}
    ${metric('Deckung heute', fmtPct(canAffordNow ? 1 : totalBtcValue / i.purchasePrice), canAffordNow ? 'positive' : 'negative')}
    ${metric('Haltefrist', i.holdingPeriodMet ? 'steuerfrei (> 1 Jahr)' : `Spekulationssteuer ${fmtPct(i.taxRate)}`)}
  `;

  // Scenario 1: Sell now
  const sn = calcSellNowScenario(i);
  const snEl = document.querySelector('#scenario-sell-now .scenario-content');
  snEl.innerHTML = `
    ${metric('BTC für Kauf nötig', fmtNum(sn.btcNeeded) + ' BTC')}
    ${metric('BTC verbleibend', fmtNum(sn.btcRemaining) + ' BTC')}
    ${metric('Wert verbleibende BTC heute', fmt(sn.btcRemaining * i.btcPriceNow), sn.btcRemaining >= 0 ? 'positive' : 'negative')}
    <div class="recommendation">
      ${sn.btcRemaining >= 0
        ? '✅ Du kannst das Auto heute bar kaufen und behältst noch BTC.'
        : '❌ Nicht genug BTC für den Kauf heute.'}
    </div>
  `;

  // Scenario 2: BTC loan
  const bl = calcBtcLoanScenario(i);
  const blEl = document.querySelector('#scenario-btc-loan .scenario-content');
  if (bl.loanAmount >= i.purchasePrice) {
    blEl.innerHTML = `
      ${metric('Mögliche Kreditsumme', fmt(bl.loanAmount))}
      ${metric('Direktzahlung nötig', fmt(bl.directPayment))}
      ${metric('Hinterlegte BTC', fmtNum(bl.btcCollateralAmount) + ' BTC (' + fmt(bl.btcCollateralValueNeeded) + ')')}
      ${metric('BTC verbleibend', fmtNum(bl.btcRemaining) + ' BTC')}
      ${metric('Zinsen p.a.', fmt(bl.yearlyInterest))}
      ${metric('Zinsen 5 Jahre', fmt(bl.totalInterest5Y))}
      <div class="recommendation">✅ Kredit deckt den Kauf vollständig. Du musst jetzt keine BTC verkaufen und behältst das Upside.</div>
    `;
  } else {
    blEl.innerHTML = `
      ${metric('Mögliche Kreditsumme (50% LTV)', fmt(bl.loanAmount))}
      ${metric('Fehlender Betrag', fmt(i.purchasePrice - bl.loanAmount), 'negative')}
      ${metric('Zinsen p.a.', fmt(bl.yearlyInterest))}
      <div class="recommendation">⚠️ Mit den aktuellen BTC reicht die Sicherheit nicht für den vollen Kaufpreis. Du brauchst einen Mix oder mehr BTC.</div>
    `;
  }

  // Scenario 3: Dealer loan
  const dl = calcDealerLoanScenario(i);
  const dlEl = document.querySelector('#scenario-dealer-loan .scenario-content');
  dlEl.innerHTML = `
    ${metric('Anzahlung', fmt(dl.downPayment))}
    ${metric('Kreditbetrag', fmt(dl.loanAmount))}
    ${metric('Monatliche Rate', fmt(dl.monthlyPayment))}
    ${metric('Zinsen gesamt', fmt(dl.totalInterest), 'negative')}
    ${metric('Gesamtkosten', fmt(dl.totalPaid))}
    ${metric('BTC für Anzahlung nötig', fmtNum(dl.btcSoldNow) + ' BTC')}
    ${metric('BTC verbleibend', fmtNum(dl.btcRemaining) + ' BTC')}
    <div class="recommendation">${dl.totalInterest < (i.purchasePrice * 0.10) ? '✅' : '⚠️'} Händlerkosten: ${fmt(dl.totalInterest)} Zinsen über ${i.dealerLoanYears} Jahre.</div>
  `;

  // Scenario 4: Mix (50% verkaufen, 50% BTC-Kredit)
  const halfPrice = i.purchasePrice / 2;
  const btcForHalf = halfPrice / i.btcPriceNow;
  const mixLoan = halfPrice; // rest via BTC loan
  const mixCollateral = (mixLoan * 2) / i.btcPriceNow;
  const mixRemaining = i.btcAmount - btcForHalf - mixCollateral;
  const mixInterestYear = mixLoan * i.btcLoanRate;
  const mixEl = document.querySelector('#scenario-mix .scenario-content');
  mixEl.innerHTML = `
    ${metric('Direkt verkaufte BTC', fmtNum(btcForHalf) + ' BTC (' + fmt(halfPrice) + ')')}
    ${metric('BTC-Kredit', fmt(mixLoan))}
    ${metric('Als Sicherheit hinterlegt', fmtNum(mixCollateral) + ' BTC')}
    ${metric('BTC verbleibend', fmtNum(mixRemaining) + ' BTC')}
    ${metric('Zinsen p.a. (BTC-Kredit)', fmt(mixInterestYear))}
    <div class="recommendation">🔀 Balance aus Steuern reduzieren (nur halber Verkauf) und trotzdem Liquidität behalten.</div>
  `;

  // Future scenarios
  const fs = calcFutureScenarios(i);
  const fsEl = document.getElementById('futureScenarios');
  fsEl.innerHTML = fs.map(s => `
    <div class="card" style="margin-bottom:0.75rem;">
      <strong>${s.name} — ${fmt(s.price)}</strong>
      ${metric('BTC für Kauf nötig', fmtNum(s.btcNeeded) + ' BTC')}
      ${metric('BTC verbleibend', fmtNum(s.btcRemaining) + ' BTC')}
      ${metric('Wert verbleibend', fmt(s.btcRemaining * s.price), s.btcRemaining > 0 ? 'positive' : 'negative')}
      ${i.holdingPeriodMet ? metric('Steuer', 'steuerfrei', 'positive') : metric('Geschätzte Steuer', fmt(s.tax), 'negative')}
      ${metric('BTC-Gewinn vs. heute', fmt(s.gainVsNow), s.gainVsNow >= 0 ? 'positive' : 'negative')}
    </div>
  `).join('');

  // Amortization table
  const rows = generateAmortizationTable(i);
  const amEl = document.getElementById('amortizationSchedule');
  amEl.innerHTML = `
    <table>
      <thead><tr><th>Monat</th><th>Rate</th><th>Zinsen</th><th>Tilgung</th><th>Restschuld</th></tr></thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td>${r.month}</td>
            <td>${fmt(r.payment)}</td>
            <td>${fmt(r.interest)}</td>
            <td>${fmt(r.principal)}</td>
            <td>${fmt(r.remaining)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // Decision matrix
  renderDecisionMatrix(i, sn, bl, dl);
}

function renderDecisionMatrix(i, sn, bl, dl) {
  const mixBtcSold = (i.purchasePrice / 2) / i.btcPriceNow;
  const mixLoan = i.purchasePrice / 2;
  const mixCollateral = (mixLoan * 2) / i.btcPriceNow;
  const mixBtcRemaining = i.btcAmount - mixBtcSold - mixCollateral;
  const mixMonthly = mixLoan * i.btcLoanRate / 12;

  const futureRealistic = i.btcPriceRealistic;
  const futurePessimistic = i.btcPricePessimistic;

  const scenarios = [
    {
      key: 'sell-now',
      name: '🪙 Sofort verkaufen',
      btcRemaining: sn.btcRemaining,
      monthlyBurden: 0,
      immediateBtcSold: sn.btcNeeded,
      totalCost: 0,
      futureValue: sn.btcRemaining * futureRealistic,
      description: 'Einfach, keine monatliche Belastung, aber maximaler sofortiger Verkauf.'
    },
    {
      key: 'btc-loan',
      name: '🏦 BTC-besicherter Kredit',
      btcRemaining: i.btcAmount - bl.btcCollateralAmount,
      monthlyBurden: bl.loanAmount * i.btcLoanRate / 12,
      immediateBtcSold: 0,
      totalCost: bl.yearlyInterest * 5,
      futureValue: (i.btcAmount - bl.btcCollateralAmount) * futureRealistic,
      description: bl.loanAmount >= i.purchasePrice
        ? 'Kein sofortiger Verkauf, du behältst fast alle BTC.'
        : 'Nicht vollständig finanzierbar ohne zusätzlichen Verkauf.'
    },
    {
      key: 'dealer-loan',
      name: '🚗 Händlerkredit',
      btcRemaining: dl.btcRemaining,
      monthlyBurden: dl.monthlyPayment,
      immediateBtcSold: dl.btcSoldNow,
      totalCost: dl.totalInterest,
      futureValue: dl.btcRemaining * futureRealistic,
      description: 'Voraussetzung: Bonität beim Händler. Niedrigere monatliche Rate als BTC-Kredit, aber verlangt Anzahlung.'
    },
    {
      key: 'mix',
      name: '🔀 Mix: 50% Verkauf + 50% BTC-Kredit',
      btcRemaining: mixBtcRemaining,
      monthlyBurden: mixMonthly,
      immediateBtcSold: mixBtcSold,
      totalCost: mixLoan * i.btcLoanRate * 5,
      futureValue: mixBtcRemaining * futureRealistic,
      description: 'Kompromiss: etwas BTC verkaufen, Rest über Kredit refinanzieren.'
    }
  ];

  // Normalize metrics for scoring (higher is better for retention & future value; lower is better for burden, sale, cost)
  const maxBtc = Math.max(...scenarios.map(s => s.btcRemaining), 0.0001);
  const maxMonthly = Math.max(...scenarios.map(s => s.monthlyBurden), 0.0001);
  const maxImmediate = Math.max(...scenarios.map(s => s.immediateBtcSold), 0.0001);
  const maxCost = Math.max(...scenarios.map(s => s.totalCost), 0.0001);

  const weighted = scenarios.map(s => {
    const btcScore = (s.btcRemaining / maxBtc) * i.weightBtcRetention;
    const burdenScore = (1 - s.monthlyBurden / maxMonthly) * i.weightMonthlyBurden;
    const immediateScore = (1 - s.immediateBtcSold / maxImmediate) * i.weightImmediateSale;
    const costScore = (1 - s.totalCost / maxCost) * i.weightTotalCost;
    const total = btcScore + burdenScore + immediateScore + costScore;
    return { ...s, score: total };
  });

  weighted.sort((a, b) => b.score - a.score);

  const matrixEl = document.getElementById('decisionMatrix');
  matrixEl.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Option</th>
          <th>BTC übrig</th>
          <th>Monatl. Belastung</th>
          <th>Sofort verkauft</th>
          <th>Gesamtkosten</th>
          <th>Bewertung</th>
        </tr>
      </thead>
      <tbody>
        ${weighted.map((s, idx) => `
          <tr class="${idx === 0 ? 'best-option' : ''}">
            <td><strong>${s.name}</strong><br><small>${s.description}</small></td>
            <td>${fmtNum(s.btcRemaining)} BTC</td>
            <td>${fmt(s.monthlyBurden)}/Monat</td>
            <td>${fmtNum(s.immediateBtcSold)} BTC</td>
            <td>${fmt(s.totalCost)}</td>
            <td><span class="score">${s.score.toFixed(1)}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="recommendation" style="margin-top:1rem;">
      <strong>Empfehlung:</strong> ${weighted[0].name} ist nach deinen Prioritäten aktuell die beste Wahl.
      Sie lässt dir ${fmtNum(weighted[0].btcRemaining)} BTC und kostet dich monatlich ${fmt(weighted[0].monthlyBurden)}.
    </div>
  `;
}

document.getElementById('inputs').addEventListener('submit', e => {
  e.preventDefault();
  render();
});

// Initial render on load (script is at end of body, DOM is ready)
render();
