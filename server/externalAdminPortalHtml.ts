export function getExternalAdminPortalHtml(host: string): string {
  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BundeliTube Admin Bridge — विज्ञापन आय व वॉलेट वितरण</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    body { background-color: #0f172a; color: #f8fafc; min-height: 100vh; padding: 24px 16px; }
    .container { max-width: 1100px; margin: 0 auto; }
    
    header { background: #1e293b; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; border: 1px solid #334155; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; }
    .header-title h1 { font-size: 20px; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 10px; }
    .header-title p { font-size: 13px; color: #94a3b8; margin-top: 4px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
    .badge-green { background: #065f46; color: #34d399; }
    .badge-amber { background: #78350f; color: #fbbf24; }

    .nav-tabs { display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid #334155; padding-bottom: 8px; flex-wrap: wrap; }
    .tab-btn { background: transparent; border: none; color: #94a3b8; font-size: 14px; font-weight: 600; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
    .tab-btn.active { background: #2563eb; color: #ffffff; }
    .tab-btn:hover:not(.active) { background: #1e293b; color: #f8fafc; }

    .tab-content { display: none; }
    .tab-content.active { display: block; }

    .card { background: #1e293b; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #334155; }
    .card h2 { font-size: 16px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }

    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; }

    .stat-box { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; }
    .stat-box .num { font-size: 24px; font-weight: 800; color: #38bdf8; }
    .stat-box .lbl { font-size: 12px; color: #94a3b8; margin-top: 4px; font-weight: 600; }

    label { display: block; font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 6px; }
    input[type="number"], input[type="text"], select { width: 100%; background: #0f172a; border: 1px solid #475569; border-radius: 8px; padding: 10px 14px; color: #f8fafc; font-size: 14px; margin-bottom: 12px; }
    input:focus, select:focus { outline: none; border-color: #38bdf8; ring: 2px solid #38bdf8; }

    .chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
    .chip { background: #0f172a; border: 1px solid #475569; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; color: #94a3b8; cursor: pointer; }
    .chip:hover, .chip.active { background: #38bdf8; color: #0f172a; border-color: #38bdf8; }

    .btn { background: #2563eb; color: #ffffff; border: none; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
    .btn:hover { background: #1d4ed8; }
    .btn-green { background: #059669; }
    .btn-green:hover { background: #047857; }
    .btn-red { background: #dc2626; }
    .btn-red:hover { background: #b91c1c; }
    .btn-full { width: 100%; }

    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th { text-align: left; padding: 12px; background: #0f172a; color: #94a3b8; border-bottom: 1px solid #334155; }
    td { padding: 12px; border-bottom: 1px solid #1e293b; color: #cbd5e1; }
    tr:hover td { background: #1e293b; }

    pre { background: #0f172a; border: 1px solid #334155; padding: 16px; border-radius: 8px; font-size: 13px; color: #38bdf8; overflow-x: auto; margin-top: 8px; margin-bottom: 16px; }
    .code-title { font-size: 13px; font-weight: 700; color: #cbd5e1; margin-top: 16px; margin-bottom: 4px; display: flex; justify-content: space-between; }
    .copy-btn { background: #334155; color: #f8fafc; border: none; padding: 2px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; }

    #alert-box { display: none; padding: 14px 18px; border-radius: 10px; margin-bottom: 20px; font-size: 14px; font-weight: 600; }
    .alert-success { background: #065f46; color: #34d399; border: 1px solid #059669; }
    .alert-error { background: #7f1d1d; color: #f87171; border: 1px solid #dc2626; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="header-title">
        <h1><span>🎬</span> BundeliTube Admin External Bridge</h1>
        <p>बाहरी एडमिन वेबसाइट से सीधे विज्ञापन आय जोड़ें और विड्रॉल कंट्रोल करें (Firebase कनेक्टेड)</p>
      </div>
      <div style="display:flex; align-items:center; gap:12px;">
        <span class="badge badge-green" id="server-status">● सर्वर ऑनलाइन</span>
        <button class="btn" style="padding:6px 12px; font-size:12px;" onclick="loadCreators()">🔄 रिफ्रेश डेटा</button>
      </div>
    </header>

    <div id="alert-box"></div>

    <div class="nav-tabs">
      <button class="tab-btn active" onclick="switchTab('distribute')">⚡ 1. विज्ञापन आय वितरण (Ad Payout)</button>
      <button class="tab-btn" onclick="switchTab('withdrawal')">🔒 2. विड्रॉल विंडो (1 से 5 तारीख)</button>
      <button class="tab-btn" onclick="switchTab('history')">📜 3. वितरण इतिहास (History)</button>
      <button class="tab-btn" onclick="switchTab('api-code')">💻 4. आपकी वेबसाइट का कोड (API / Code)</button>
    </div>

    <!-- TAB 1: DISTRIBUTE -->
    <div id="tab-distribute" class="tab-content active">
      <div class="grid-2">
        <div class="card">
          <h2>📊 विज्ञापन दर व कैलकुलेशन</h2>
          
          <label>1 Ad का रेट दर्ज करें (₹):</label>
          <input type="number" id="ratePerAd" step="0.01" min="0.01" value="0.50" placeholder="उदा. 0.50 (50 पैसे)" oninput="recalcPreview()">
          
          <div class="chips">
            <span class="chip" onclick="setRate(0.20)">₹0.20</span>
            <span class="chip" onclick="setRate(0.35)">₹0.35</span>
            <span class="chip active" onclick="setRate(0.50)">₹0.50</span>
            <span class="chip" onclick="setRate(0.75)">₹0.75</span>
            <span class="chip" onclick="setRate(1.00)">₹1.00</span>
            <span class="chip" onclick="setRate(1.50)">₹1.50</span>
          </div>

          <div style="background:#0f172a; padding:12px; border-radius:8px; margin-bottom:14px; border:1px solid #334155;">
            <label style="font-size:12px; color:#94a3b8; cursor:pointer;">
              <input type="checkbox" id="useBudgetCalc" onchange="toggleBudgetCalc()" style="width:auto; margin-right:6px;">
              अथवा: कुल बजट (₹) और कुल विज्ञापनों से दर निकालें
            </label>
            <div id="budgetInputs" style="display:none; margin-top:10px;">
              <label>कुल विज्ञापन बजट (₹):</label>
              <input type="number" id="totalBudget" placeholder="उदा. 10000" oninput="calcRateFromBudget()">
              <label>कुल विज्ञापन चले:</label>
              <input type="number" id="totalAdsBudget" placeholder="उदा. 20000" oninput="calcRateFromBudget()">
            </div>
          </div>

          <label>क्रिएटर शेयर प्रतिशत (%):</label>
          <select id="creatorSharePercentage" onchange="recalcPreview()">
            <option value="50" selected>50% क्रिएटर शेयर (मानक)</option>
            <option value="60">60% क्रिएटर शेयर</option>
            <option value="70">70% क्रिएटर शेयर</option>
            <option value="100">100% पूरा शेयर क्रिएटर को</option>
          </select>

          <label>विवरण / नोट (वैकल्पिक):</label>
          <input type="text" id="adminNote" placeholder="उदा. मार्च 2026 विज्ञापन आय">

          <button class="btn btn-green btn-full" id="btnDistribute" onclick="submitDistribution()">
            ⚡ सभी क्रिएटर्स के वॉलेट में जोड़ें (Firebase Auto-Credit)
          </button>
        </div>

        <div class="card">
          <h2>📈 लाइव वितरण प्रीव्यू</h2>
          <div class="grid-3">
            <div class="stat-box">
              <div class="num" id="statCreators">0</div>
              <div class="lbl">पात्र क्रिएटर्स</div>
            </div>
            <div class="stat-box">
              <div class="num" id="statAds">0</div>
              <div class="lbl">कुल विज्ञापन</div>
            </div>
            <div class="stat-box">
              <div class="num" id="statTotalAmount">₹0.00</div>
              <div class="lbl">कुल वितरित राशि</div>
            </div>
          </div>

          <p style="font-size:12px; color:#94a3b8; margin-bottom:12px;">
            नीचे क्रिएटर्स के विज्ञापनों के अनुसार उनके वॉलेट में जुड़ने वाली राशि का विवरण है:
          </p>

          <div style="max-height: 280px; overflow-y: auto; border:1px solid #334155; border-radius:8px;">
            <table>
              <thead>
                <tr>
                  <th>चैनल / क्रिएटर</th>
                  <th>Ads</th>
                  <th>क्रेडिट राशि</th>
                </tr>
              </thead>
              <tbody id="creatorsTableBody">
                <tr><td colspan="3" style="text-align:center;">डेटा लोड हो रहा है...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: WITHDRAWAL WINDOW -->
    <div id="tab-withdrawal" class="tab-content">
      <div class="card" style="max-width: 600px; margin: 0 auto;">
        <h2>🔒 विड्रॉल विंडो कंट्रोल (1 से 5 तारीख)</h2>
        <p style="color:#94a3b8; font-size:14px; margin-bottom:20px;">
          क्रिएटर्स केवल 1 से 5 तारीख के बीच ही विड्रॉल कर सकते हैं। एडमिन अपनी अलग वेबसाइट से इस विंडो को जब चाहे चालू या बंद कर सकता है।
        </p>

        <div style="background:#0f172a; border:1px solid #334155; border-radius:12px; padding:20px; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:700; font-size:16px;">विड्रॉल विंडो स्थिति:</div>
              <div style="font-size:13px; color:#94a3b8; margin-top:4px;">न्यूनतम विड्रॉल सीमा: ₹5,000</div>
            </div>
            <span class="badge badge-green" id="withdrawalStatusBadge">सक्रिय (खुला)</span>
          </div>
        </div>

        <label>एडमिन सूचना / संदेश:</label>
        <input type="text" id="withdrawalNotice" placeholder="उदा. विड्रॉल विंडो 1 से 5 तारीख के लिए खुली है।">

        <div style="display:flex; gap:12px;">
          <button class="btn btn-green" style="flex:1;" onclick="setWithdrawalStatus(true)">🔓 विंडो खोलें (Unlock)</button>
          <button class="btn btn-red" style="flex:1;" onclick="setWithdrawalStatus(false)">🔒 विंडो बंद करें (Lock)</button>
        </div>
      </div>
    </div>

    <!-- TAB 3: HISTORY -->
    <div id="tab-history" class="tab-content">
      <div class="card">
        <h2>📜 पिछले विज्ञापन आय वितरण का इतिहास</h2>
        <div style="overflow-x:auto;">
          <table>
            <thead>
              <tr>
                <th>तारीख</th>
                <th>1 Ad का रेट</th>
                <th>कुल विज्ञापन</th>
                <th>कुल राशि</th>
                <th>क्रिएटर्स</th>
                <th>स्टेटस</th>
              </tr>
            </thead>
            <tbody id="historyTableBody">
              <tr><td colspan="6" style="text-align:center;">इतिहास लोड हो रहा है...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 4: API & INTEGRATION CODE -->
    <div id="tab-api-code" class="tab-content">
      <div class="card">
        <h2>🔥 अपनी अलग एडमिन वेबसाइट से Firebase द्वारा सीधे जोड़ने का कोड</h2>
        <p style="font-size:14px; color:#94a3b8; margin-bottom:16px;">
          चूंकि आपकी अलग एडमिन वेबसाइट उसी Firebase प्रोजेक्ट (<code style="color:#38bdf8;">bundelitube-1c045</code>) से जुड़ी है, आप अपनी एडमिन वेबसाइट में नीचे दिए गए किसी भी तरीके से सीधे Firebase Firestore में 1 Ad का रेट डाल सकते हैं:
        </p>

        <!-- Method A: Firebase Firestore addDoc -->
        <div class="code-title">
          <span>तरीका 1: Firebase Firestore (addDoc - सबसे आसान और तेज)</span>
          <button class="copy-btn" onclick="copyCode('firebase-sdk-code')">कॉपी करें</button>
        </div>
        <pre id="firebase-sdk-code">// अपनी अलग एडमिन वेबसाइट के JS/TS में लगाएं:
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

async function distributeAdRevenueFromAdmin(ratePerAd) {
  // जब एडमिन 1 Ad का रेट डालकर सबमिट करेगा:
  const docRef = await addDoc(collection(db, "ad_distribution_requests"), {
    ratePerAd: Number(ratePerAd),         // जैसे 0.50 (50 पैसे)
    creatorSharePercentage: 50,           // 50% क्रिएटर शेयर
    status: "pending",                    // तुरंत ऑटो-प्रोसेस होगा
    note: "एडमिन पैनल वेबसाइट द्वारा विज्ञापन आय वितरण",
    createdAt: new Date().toISOString()
  });

  alert("अनुरोध Firebase में दर्ज हुआ! सभी वॉलेट में पैसे स्वतः जुड़ रहे हैं। ID: " + docRef.id);
}</pre>

        <!-- Method B: Direct Wallet Batch Update in Firestore -->
        <div class="code-title">
          <span>तरीका 2: Firebase Firestore से सीधे सभी Wallets में बैलेंस बढ़ाना (Direct Batch)</span>
          <button class="copy-btn" onclick="copyCode('firebase-batch-code')">कॉपी करें</button>
        </div>
        <pre id="firebase-batch-code">import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";

async function creditAllCreatorWalletsDirectly(ratePerAd = 0.50) {
  const netRate = ratePerAd * 0.50; // 50% क्रिएटर शेयर (₹0.25 प्रति Ad)
  
  // 1. सभी चैनल्स लाएं
  const snap = await getDocs(collection(db, "channels"));
  
  for (const docSnap of snap.docs) {
    const channel = docSnap.data();
    const creatorId = channel.ownerUid || channel.id;
    const ads = Number(channel.totalAdImpressions || channel.total_long_impressions || 0);
    
    if (!creatorId || ads &lt;= 0) continue;
    
    const earnings = Number((ads * netRate).toFixed(2));
    if (earnings &lt;= 0) continue;

    // 2. क्रिएटर के वॉलेट में पैसे जोड़ें
    const wRef = doc(db, "wallets", creatorId);
    const wDoc = await getDoc(wRef);
    const prevBal = wDoc.exists() ? Number(wDoc.data().currentBalance || 0) : 0;
    const newBal = Number((prevBal + earnings).toFixed(2));

    await setDoc(wRef, {
      currentBalance: newBal,
      walletBalance: newBal,
      minWithdrawalLimit: 5000,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  }

  alert("सभी क्रिएटर्स के वॉलेट में पैसे जुड़ गए!");
}</pre>

        <!-- Method C: Withdrawal Window Lock/Unlock via Firestore -->
        <div class="code-title">
          <span>तरीका 3: विड्रॉल विंडो को Firebase में लॉक / अनलॉक करना (1 से 5 तारीख)</span>
          <button class="copy-btn" onclick="copyCode('firebase-lock-code')">कॉपी करें</button>
        </div>
        <pre id="firebase-lock-code">import { doc, setDoc } from "firebase/firestore";

// 1 तारीख को विड्रॉल खोलने के लिए:
async function unlockWithdrawal() {
  await setDoc(doc(db, "config", "app_config"), {
    isWithdrawalWindowUnlocked: true,
    withdrawalMinAmount: 5000,
    withdrawalWindowDatesText: "1 से 5 तारीख"
  }, { merge: true });
}

// 6 तारीख को विड्रॉल बंद करने के लिए:
async function lockWithdrawal() {
  await setDoc(doc(db, "config", "app_config"), {
    isWithdrawalWindowUnlocked: false
  }, { merge: true });
}</pre>

        <!-- Method D: HTTP API Endpoint -->
        <div class="code-title">
          <span>तरीका 4: HTTP API Endpoint (POST Request)</span>
          <button class="copy-btn" onclick="copyCode('js-code')">कॉपी करें</button>
        </div>
        <pre id="js-code">async function distributeAdRevenue(ratePerAd) {
  const response = await fetch('${host}/api/external-admin/distribute-ad-revenue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ratePerAd: ratePerAd, // e.g. 0.50
      creatorSharePercentage: 50,
      note: 'Admin Website Payout'
    })
  });
  const data = await response.json();
  alert(data.message);
}</pre>
      </div>
    </div>
  </div>

  <script>
    let creatorsList = [];

    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById('tab-' + tabId).classList.add('active');
      if (tabId === 'history') loadHistory();
    }

    function showAlert(msg, isSuccess = true) {
      const box = document.getElementById('alert-box');
      box.className = isSuccess ? 'alert-success' : 'alert-error';
      box.textContent = msg;
      box.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => { box.style.display = 'none'; }, 8000);
    }

    function setRate(val) {
      document.getElementById('ratePerAd').value = val;
      document.querySelectorAll('.chip').forEach(c => {
        c.classList.toggle('active', c.textContent === '₹' + val.toFixed(2));
      });
      recalcPreview();
    }

    function toggleBudgetCalc() {
      const show = document.getElementById('useBudgetCalc').checked;
      document.getElementById('budgetInputs').style.display = show ? 'block' : 'none';
      if (!show) recalcPreview();
    }

    function calcRateFromBudget() {
      const budget = parseFloat(document.getElementById('totalBudget').value) || 0;
      const ads = parseFloat(document.getElementById('totalAdsBudget').value) || 0;
      if (budget > 0 && ads > 0) {
        const rate = (budget / ads).toFixed(4);
        document.getElementById('ratePerAd').value = rate;
      }
      recalcPreview();
    }

    async function loadCreators() {
      try {
        const res = await fetch('/api/external-admin/creators-stats');
        const data = await res.json();
        if (data.success && Array.isArray(data.creators)) {
          creatorsList = data.creators;
          recalcPreview();
        }
      } catch (err) {
        console.error('Error loading creators:', err);
      }
    }

    function recalcPreview() {
      const grossRate = parseFloat(document.getElementById('ratePerAd').value) || 0;
      const sharePct = parseFloat(document.getElementById('creatorSharePercentage').value) || 50;
      const netRate = grossRate * (sharePct / 100);

      let totalAds = 0;
      let totalAmount = 0;
      const tbody = document.getElementById('creatorsTableBody');
      tbody.innerHTML = '';

      if (creatorsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#94a3b8;">कोई क्रिएटर नहीं मिला।</td></tr>';
        return;
      }

      creatorsList.forEach(c => {
        const ads = Math.max(c.totalAdImpressions || 0, c.total_long_impressions || 0);
        const amount = ads * netRate;
        totalAds += ads;
        totalAmount += amount;

        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td>
            <div style="font-weight:700; color:#f8fafc;">\${c.channelName}</div>
            <div style="font-size:11px; color:#94a3b8;">\${c.panCardHolderName ? c.panCardHolderName + ' • ' : ''}UPI: \${c.upiId || 'Not set'}</div>
          </td>
          <td style="font-weight:600; color:#38bdf8;">\${ads.toLocaleString('en-IN')}</td>
          <td style="font-weight:700; color:#34d399;">₹\${amount.toFixed(2)}</td>
        \`;
        tbody.appendChild(tr);
      });

      document.getElementById('statCreators').textContent = creatorsList.length;
      document.getElementById('statAds').textContent = totalAds.toLocaleString('en-IN');
      document.getElementById('statTotalAmount').textContent = '₹' + totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    async function submitDistribution() {
      const rate = parseFloat(document.getElementById('ratePerAd').value) || 0;
      if (rate <= 0) {
        alert('कृपया वैध विज्ञापन दर दर्ज करें!');
        return;
      }

      const share = parseFloat(document.getElementById('creatorSharePercentage').value) || 50;
      const note = document.getElementById('adminNote').value;

      if (!confirm(\`क्या आप 1 Ad = ₹\${rate} (\${share}% शेयर) के हिसाब से सभी \${creatorsList.length} क्रिएटर्स के वॉलेट में पैसे जोड़ना चाहते हैं?\`)) {
        return;
      }

      const btn = document.getElementById('btnDistribute');
      btn.disabled = true;
      btn.textContent = '⏳ प्रोसेस हो रहा है (Firebase अपडेट हो रहा है)...';

      try {
        const res = await fetch('/api/external-admin/distribute-ad-revenue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ratePerAd: rate,
            creatorSharePercentage: share,
            note: note
          })
        });

        const data = await res.json();
        if (data.success) {
          showAlert(data.message, true);
          loadCreators();
        } else {
          showAlert(data.error || 'वितरण विफल रहा', false);
        }
      } catch (err) {
        showAlert('सर्वर से कनेक्ट करने में त्रुटि: ' + err.message, false);
      } finally {
        btn.disabled = false;
        btn.textContent = '⚡ सभी क्रिएटर्स के वॉलेट में जोड़ें (Firebase Auto-Credit)';
      }
    }

    async function setWithdrawalStatus(unlocked) {
      const notice = document.getElementById('withdrawalNotice').value;
      try {
        const res = await fetch('/api/external-admin/toggle-withdrawal-window', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ unlocked, adminNote: notice })
        });
        const data = await res.json();
        if (data.success) {
          const badge = document.getElementById('withdrawalStatusBadge');
          badge.className = unlocked ? 'badge badge-green' : 'badge badge-amber';
          badge.textContent = unlocked ? 'सक्रिय (खुला)' : 'बंद (Locked)';
          showAlert(unlocked ? 'विड्रॉल विंडो खोल दी गई है (1 से 5 तारीख)' : 'विड्रॉल विंडो बंद कर दी गई है', true);
        }
      } catch (err) {
        showAlert('त्रुटि: ' + err.message, false);
      }
    }

    async function loadHistory() {
      const tbody = document.getElementById('historyTableBody');
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">लोड हो रहा है...</td></tr>';
      try {
        const res = await fetch('/api/external-admin/distribution-history');
        const data = await res.json();
        if (data.success && Array.isArray(data.history) && data.history.length > 0) {
          tbody.innerHTML = '';
          data.history.forEach(b => {
            const tr = document.createElement('tr');
            tr.innerHTML = \`
              <td>\${new Date(b.createdAt).toLocaleDateString('hi-IN')}</td>
              <td style="color:#38bdf8; font-weight:600;">₹\${Number(b.ratePerAd || 0).toFixed(2)}</td>
              <td>\${Number(b.totalAds || 0).toLocaleString('en-IN')}</td>
              <td style="color:#34d399; font-weight:700;">₹\${Number(b.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td>\${b.totalCreators || 0} क्रिएटर्स</td>
              <td><span class="badge badge-green">सफल</span></td>
            \`;
            tbody.appendChild(tr);
          });
        } else {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94a3b8;">कोई पिछला रिकॉर्ड नहीं मिला।</td></tr>';
        }
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#f87171;">इतिहास लोड नहीं हो सका।</td></tr>';
      }
    }

    function copyCode(id) {
      const text = document.getElementById(id).textContent;
      navigator.clipboard.writeText(text);
      alert('कोड क्लिपबोर्ड पर कॉपी हो गया!');
    }

    // Initial load
    loadCreators();
  </script>
</body>
</html>`;
}
