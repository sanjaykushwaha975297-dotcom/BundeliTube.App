/**
 * Server-rendered Legal & Compliance Pages for Google AdSense & SEO Compliance
 * Provides fully crawlable, indexable, fast HTML pages for /privacy-policy, /terms, /about, /contact, /disclaimer
 */

export type LegalPageType = 'privacy' | 'terms' | 'about' | 'contact' | 'disclaimer' | 'creator-program';

interface PageMeta {
  title: string;
  description: string;
  canonical: string;
}

const PUBLISHER_ID = 'ca-pub-5666532653138550';
const DOMAIN = 'bundelitube.fun';
const APP_NAME = 'BundeliTube (बुन्देली ट्यूब)';
const CONTACT_EMAIL = 'sanjaykushwaha975297@gmail.com';

function getHeaderHtml(active: LegalPageType): string {
  return `
    <header class="site-header">
      <div class="container header-inner">
        <a href="/" class="brand-logo">
          <span class="logo-badge">🎬</span>
          <span class="brand-text"><strong>BundeliTube</strong> <span class="hindi-text">बुन्देली ट्यूब</span></span>
        </a>
        <nav class="nav-links">
          <a href="/" class="nav-link">Home (होम)</a>
          <a href="/about" class="nav-link ${active === 'about' ? 'active' : ''}">About Us</a>
          <a href="/creator-program" class="nav-link ${active === 'creator-program' ? 'active' : ''}">Creator 50/50</a>
          <a href="/privacy-policy" class="nav-link ${active === 'privacy' ? 'active' : ''}">Privacy Policy</a>
          <a href="/terms" class="nav-link ${active === 'terms' ? 'active' : ''}">Terms</a>
          <a href="/contact" class="nav-link ${active === 'contact' ? 'active' : ''}">Contact Us</a>
        </nav>
      </div>
    </header>
  `;
}

function getFooterHtml(): string {
  return `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-col">
          <div class="brand-logo" style="margin-bottom: 12px;">
            <span class="logo-badge">🎬</span>
            <span class="brand-text"><strong>BundeliTube</strong></span>
          </div>
          <p class="footer-desc">
            बुंदेलखंड की समृद्ध लोक-संस्कृति, राई, आल्हा, फाग, लोकगीत और स्थानीय संगीत प्रतिभाओं को वैश्विक पहचान दिलाने वाला भारत का समर्पित क्षेत्रीय डिजिटल स्ट्रीमिंग व क्रिएटर प्लेटफ़ॉर्म।
          </p>
          <p class="footer-meta">
            © ${new Date().getFullYear()} BundeliTube Platform. All rights reserved. Registered Indian Digital Content Intermediary.
          </p>
        </div>
        <div class="footer-col">
          <h4 class="footer-title">त्वरित लिंक (Quick Links)</h4>
          <ul class="footer-links">
            <li><a href="/">मुखपृष्ठ (Home Feed)</a></li>
            <li><a href="/about">हमारे बारे में (About Us)</a></li>
            <li><a href="/creator-program">क्रिएटर 50-50 अर्निंग नीति</a></li>
            <li><a href="/contact">संपर्क व सहायता (Contact Us)</a></li>
            <li><a href="/disclaimer">अस्वीकरण (Disclaimer)</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-title">कानूनी व गोपनीयता (Legal & Compliance)</h4>
          <ul class="footer-links">
            <li><a href="/privacy-policy">गोपनीयता नीति (Privacy Policy)</a></li>
            <li><a href="/terms">उपयोग की शर्तें (Terms of Service)</a></li>
            <li><a href="/privacy-policy#cookies">कुकीज व विज्ञापन नीति (Cookies & Ads)</a></li>
            <li><a href="/privacy-policy#grievance">शिकायत निवारण अधिकारी (Grievance Officer)</a></li>
            <li><a href="/sitemap.xml">साइटमैप (Sitemap.xml)</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-title">प्रकाशक व सहायता केंद्र</h4>
          <p class="footer-contact">
            <strong>ईमेल:</strong> <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a><br>
            <strong>डोमेन:</strong> ${DOMAIN}<br>
            <strong>प्रकाशक आईडी:</strong> ${PUBLISHER_ID}<br>
            <strong>क्षेत्राधिकार:</strong> बुंदेलखंड (मध्य प्रदेश एवं उत्तर प्रदेश, भारत)
          </p>
        </div>
      </div>
    </footer>
  `;
}

export function renderLegalPage(type: LegalPageType): string {
  const meta: Record<LegalPageType, PageMeta> = {
    privacy: {
      title: 'Privacy Policy (गोपनीयता नीति) - BundeliTube & Google AdSense Compliance',
      description: 'BundeliTube Privacy Policy: Detailed disclosure on user data, Google AdSense cookies, DoubleClick DART, AdMob advertising, GDPR, and Indian IT Rules compliance.',
      canonical: `https://${DOMAIN}/privacy-policy`
    },
    terms: {
      title: 'Terms of Service (नियम एवं शर्तें) - BundeliTube',
      description: 'Official Terms of Service for BundeliTube: User accounts, content guidelines, copyright protection, creator obligations, and community safety.',
      canonical: `https://${DOMAIN}/terms`
    },
    about: {
      title: 'About Us (हमारे बारे में) - BundeliTube Culture & Streaming Platform',
      description: 'Learn about BundeliTube: Our mission to preserve and celebrate Bundelkhand folk arts, music, Rai, Alha, and empower local rural creators with 50% ad revenue share.',
      canonical: `https://${DOMAIN}/about`
    },
    contact: {
      title: 'Contact Us & Grievance Officer - BundeliTube',
      description: 'Contact the BundeliTube team, Grievance Officer under Indian IT Rules 2021, support email, copyright infringement reporting, and creator inquiries.',
      canonical: `https://${DOMAIN}/contact`
    },
    disclaimer: {
      title: 'Disclaimer (अस्वीकरण) - BundeliTube Content & Copyright Notice',
      description: 'Content disclaimer, user generated content policies, fair use, copyright clearance, and limitation of liability on BundeliTube.',
      canonical: `https://${DOMAIN}/disclaimer`
    },
    'creator-program': {
      title: 'Creator Monetization & 50/50 Revenue Sharing Policy - BundeliTube',
      description: 'Transparent 50-50 revenue share program for Bundeli artists, folk singers, video creators, bank account payouts, UPI withdrawals, and eligibility rules.',
      canonical: `https://${DOMAIN}/creator-program`
    }
  };

  const currentMeta = meta[type];

  let bodyContent = '';

  if (type === 'privacy') {
    bodyContent = `
      <article class="content-article">
        <div class="article-badge">Google AdSense, AdMob & Indian IT Act 2021 Compliant</div>
        <h1>गोपनीयता नीति (Privacy Policy)</h1>
        <p class="last-updated">अंतिम अद्यतन: 23 सितम्बर 2026 | Last Updated: September 23, 2026</p>

        <section>
          <h2>1. परिचय (Introduction)</h2>
          <p>
            <strong>BundeliTube ("हम", "हमारा", "प्लेटफ़ॉर्म", ${DOMAIN})</strong> आपकी गोपनीयता की सुरक्षा के प्रति पूरी तरह प्रतिबद्ध है। यह गोपनीयता नीति स्पष्ट रूप से बताती है कि जब आप हमारी वेबसाइट (${DOMAIN}) या मोबाइल एप्लिकेशन का उपयोग करते हैं, तो हम किस प्रकार की जानकारी एकत्रित करते हैं, उसका उपयोग कैसे करते हैं, और तृतीय-पक्ष विज्ञापन भागीदारों जैसे <strong>Google AdSense</strong> तथा <strong>Google AdMob</strong> के साथ डेटा का आदान-प्रदान किस प्रकार होता है।
          </p>
          <p>
            हमारी सेवा का उपयोग करके, आप इस गोपनीयता नीति की शर्तों और Google प्रकाशक नीतियों के अनुरूप डेटा संग्रह और उपयोग से सहमति व्यक्त करते हैं।
          </p>
        </section>

        <section id="adsense">
          <h2>2. Google AdSense एवं Google AdMob विज्ञापन अनुपालन (Google Advertising Compliance)</h2>
          <p>
            हमारी वेबसाइट पर प्रासंगिक और उच्च-गुणवत्ता वाले विज्ञापन प्रदर्शित करने के लिए हम <strong>Google AdSense</strong> और <strong>Google AdMob</strong> (प्रकाशक आईडी: <code>${PUBLISHER_ID}</code>) का उपयोग करते हैं। Google एक तृतीय-पक्ष विक्रेता के रूप में हमारी साइट पर विज्ञापन दिखाने के लिए कुकीज़ का उपयोग करता है।
          </p>
          <h3>कुकीज़ और वेब बीकन (Cookies & Web Beacons):</h3>
          <ul>
            <li>
              <strong>DoubleClick DART Cookie:</strong> Google द्वारा DART कुकी का उपयोग हमारी वेबसाइट और इंटरनेट पर अन्य साइटों पर आपकी पिछली विज़िट के आधार पर आपको लक्षित एवं प्रासंगिक विज्ञापन प्रदर्शित करने के लिए किया जाता है।
            </li>
            <li>
              उपयोगकर्ता Google विज्ञापन और सामग्री नेटवर्क गोपनीयता नीति पृष्ठ पर जाकर DART कुकी के उपयोग से बाहर निकल (Opt-out) सकते हैं: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">https://policies.google.com/technologies/ads</a>
            </li>
            <li>
              आप अपने ब्राउज़र में कुकी प्राथमिकताओं को समायोजित करके या नेटवर्क एडवरटाइजिंग इनिशिएटिव ऑप्ट-आउट पृष्ठ (<a href="https://optout.networkadvertising.org" target="_blank" rel="noopener">optout.networkadvertising.org</a>) पर जाकर भी व्यक्तिगत विज्ञापनों को अक्षम कर सकते हैं।
            </li>
          </ul>
        </section>

        <section id="cookies">
          <h2>3. कुकीज़ नीति (Cookie Policy)</h2>
          <p>
            कुकीज़ छोटी टेक्स्ट फ़ाइलें होती हैं जो आपके ब्राउज़र में सहेजी जाती हैं। BundeliTube निम्नलिखित उद्देश्यों के लिए कुकीज़ का उपयोग करता है:
          </p>
          <ul>
            <li>उपयोगकर्ता सत्र (User Session) और पसंदीदा भाषा (हिन्दी/बुन्देली/अंग्रेजी) को बनाए रखना।</li>
            <li>क्रिएटर चैनल लॉगिन स्थिति और वॉच हिस्ट्री सुरक्षित रखना।</li>
            <li>Google AdSense के माध्यम से धोखाधड़ी रहित (Fraud-free), मान्य विज्ञापन प्रभाव (Valid Ad Impressions) को सुनिश्चित करना।</li>
          </ul>
        </section>

        <section>
          <h2>4. हमारे द्वारा एकत्रित की जाने वाली जानकारी (Information We Collect)</h2>
          <p>हम केवल वही जानकारी एकत्र करते हैं जो एक सुरक्षित और पारदर्शी वीडियो स्ट्रीमिंग अनुभव के लिए आवश्यक है:</p>
          <ul>
            <li><strong>व्यक्तिगत जानकारी (वैकल्पिक):</strong> जब कोई क्रिएटर चैनल बनाता है, तो हम उनका नाम, ईमेल पता, मोबाइल नंबर और बैंक/UPI विवरण (कमाई के भुगतान हेतु) सुरक्षित डेटाबेस में संग्रहित करते हैं।</li>
            <li><strong>स्वचालित तकनीकी डेटा:</strong> आईपी पता (IP Address), ब्राउज़र का प्रकार, ऑपरेटिंग सिस्टम, विज़िट का समय और देखे गए वीडियो की अवधि।</li>
          </ul>
        </section>

        <section>
          <h2>5. डेटा सुरक्षा और गोपनीयता (Data Security)</h2>
          <p>
            हम अपने उपयोगकर्ताओं और रचनाकारों के संवेदनशील वित्तीय विवरण (बैंक खाता संख्या, IFSC कोड, UPI आईडी) को उद्योग-मानक SSL/TLS एन्क्रिप्शन और Google Firebase सुरक्षा नियमों के तहत सुरक्षित रखते हैं। हम उपयोगकर्ताओं का व्यक्तिगत डेटा किसी भी असंबद्ध तृतीय पक्ष को न तो बेचते हैं और न ही किराए पर देते हैं।
          </p>
        </section>

        <section id="grievance">
          <h2>6. शिकायत निवारण अधिकारी (Grievance Officer - Indian IT Rules 2021)</h2>
          <p>
            सूचना प्रौद्योगिकी (मध्यवर्ती दिशानिर्देश और डिजिटल मीडिया आचार संहिता) नियम, 2021 (Information Technology Rules 2021) के अनुपालन में, किसी भी प्रकार की गोपनीयता चिंता, कॉपीराइट आपत्ति अथवा शिकायत के समाधान हेतु हमारे नामित शिकायत अधिकारी से संपर्क करें:
          </p>
          <div class="info-card">
            <p><strong>नामित शिकायत निवारण अधिकारी:</strong> कानूनी व अनुपालन विभाग, BundeliTube</p>
            <p><strong>आधिकारिक ईमेल:</strong> <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
            <p><strong>वेबसाइट:</strong> <a href="https://${DOMAIN}">https://${DOMAIN}</a></p>
            <p><strong>स्थान:</strong> बुंदेलखंड संभाग (मध्य प्रदेश / उत्तर प्रदेश), भारत</p>
            <p><strong>प्रतिक्रिया समय:</strong> कार्यदिवसों में 24 से 48 घंटे के भीतर पावती एवं समाधान।</p>
          </div>
        </section>
      </article>
    `;
  } else if (type === 'terms') {
    bodyContent = `
      <article class="content-article">
        <div class="article-badge">कानूनी समझौता (Legal Terms)</div>
        <h1>उपयोग की शर्तें (Terms of Service)</h1>
        <p class="last-updated">अंतिम अद्यतन: 23 सितम्बर 2026 | Last Updated: September 23, 2026</p>

        <section>
          <h2>1. शर्तों की स्वीकृति (Acceptance of Terms)</h2>
          <p>
            BundeliTube (${DOMAIN}) में आपका स्वागत है। हमारी वेबसाइट, मोबाइल ऐप अथवा सेवाओं का उपयोग करके आप इन सेवा शर्तों, हमारी गोपनीयता नीति तथा लागू भारतीय कानूनों का पालन करने के लिए बाध्य हैं।
          </p>
        </section>

        <section>
          <h2>2. प्लेटफ़ॉर्म का उद्देश्य एवं बुंदेली संस्कृति (Platform Mission)</h2>
          <p>
            BundeliTube भारत का प्रथम बुंदेली क्षेत्रीय वीडियो स्ट्रीमिंग और ऑडियो प्लेटफ़ॉर्म है। इसका उद्देश्य बुंदेलखंड की विलुप्त होती लोक कलाओं (राई, आल्हा, फाग, दिवारी, कछियाई, बधाई, दादरा, गारी, भगत) को डिजिटल रूप से संरक्षित करना और ग्रामीण तथा स्थानीय कलाकारों को एक सशक्त आजीविका मंच प्रदान करना है।
          </p>
        </section>

        <section>
          <h2>3. सामग्री दिशानिर्देश एवं कॉपीराइट (Content Guidelines & DMCA)</h2>
          <ul>
            <li><strong>मूल सामग्री:</strong> केवल वही सामग्री अपलोड करें जिसके आप मूल रचयिता हैं अथवा जिसके प्रसारण के कानूनी अधिकार आपके पास हैं।</li>
            <li><strong>प्रतिबंधित सामग्री:</strong> किसी भी प्रकार की अश्लील, भड़काऊ, घृणास्पद, हिंसात्मक, कॉपीराइट उल्लंघनकारी अथवा भारतीय संप्रभुता के विरुद्ध सामग्री अपलोड करना सख्त वर्जित है।</li>
            <li><strong>3-स्ट्राइक नीति:</strong> बार-बार कॉपीराइट उल्लंघन या अनैतिक सामग्री अपलोड करने वाले क्रिएटर चैनलों को बिना पूर्व सूचना के स्थायी रूप से निलंबित कर दिया जाएगा।</li>
          </ul>
        </section>

        <section>
          <h2>4. अमान्य ट्रैफ़िक और धोखाधड़ी निषेध (Anti-Fraud Policy)</h2>
          <p>
            Google AdSense एवं AdMob नीतियों के तहत, कृत्रिम क्लिक (Bot clicks), ऑटो-रिफ्रेशिंग टूल्स, क्लिक एक्सचेंज नेटवर्क अथवा स्वयं के विज्ञापनों पर क्लिक करना पूर्णतः प्रतिबंधित है। ऐसा करते पाए जाने पर संबंधित क्रिएटर का खाता तुरंत रद्द कर दिया जाएगा और किसी भी प्रकार का भुगतान नहीं किया जाएगा।
          </p>
        </section>

        <section>
          <h2>5. क्षेत्राधिकार एवं लागू कानून (Governing Law & Jurisdiction)</h2>
          <p>
            ये शर्तें भारतीय गणराज्य के कानूनों के तहत प्रशासित होंगी। किसी भी प्रकार के विवाद की स्थिति में न्यायिक क्षेत्राधिकार मध्य प्रदेश (बुंदेलखंड), भारत की सक्षम अदालतें होंगी।
          </p>
        </section>
      </article>
    `;
  } else if (type === 'about') {
    bodyContent = `
      <article class="content-article">
        <div class="article-badge">बुंदेलखंड की धरोहर (Cultural Heritage)</div>
        <h1>हमारे बारे में (About BundeliTube)</h1>
        <p class="last-updated">बुंदेलखंड का नंबर-1 लोकगीत, राई, आल्हा, फाग एवं संगीत स्ट्रीमिंग मंच</p>

        <section>
          <h2>हमारा विजन एवं मिशन (Our Vision & Mission)</h2>
          <p>
            बुंदेलखंड वीर भूमि है—झाँसी की रानी लक्ष्मीबाई, वीर आल्हा-ऊदल, महाराजा छत्रसाल और महाकवि ईसुरी की पावन धरती। सदियों से यहाँ के लोकगीतों, राई नृत्य, आल्हा गायकी और फागों में जीवन के उल्लास और शौर्य का जीवंत वर्णन रहा है।
          </p>
          <p>
            आधुनिक डिजिटल युग में जब क्षेत्रीय लोककलाओं को बड़े मुख्यधारा के प्लेटफॉर्मों पर उचित स्थान नहीं मिल पाता था, तब <strong>BundeliTube</strong> की नींव रखी गई। हमारा उद्देश्य हर बुंदेली लोक कलाकार, गायक, वादक और कहानीकार को एक समर्पित मंच देना और उन्हें उनकी कला का उचित पारिश्रमिक दिलाना है।
          </p>
        </section>

        <div class="feature-grid">
          <div class="feature-card">
            <span class="card-icon">💃</span>
            <h3>बुंदेली राई नृत्य एवं संगीत</h3>
            <p>ढोलक और मृदंग की थाप पर ईसुरी की अमर चौकड़ियों के साथ बुंदेलखंड का सबसे लोकप्रिय लोकनृत्य।</p>
          </div>
          <div class="feature-card">
            <span class="card-icon">⚔️</span>
            <h3>आल्हा-ऊदल महागाथा</h3>
            <p>जगनिक रचित वीर रस की अमर गाथा, जो 52 लड़ाइयों के रोमांचक इतिहास को जन-जन तक पहुँचाती है।</p>
          </div>
          <div class="feature-card">
            <span class="card-icon">🪕</span>
            <h3>फाग एवं चौगोला गायन</h3>
            <p>होली और बसंत ऋतु के उल्लास भरे पारंपरिक बुंदेली फाग और पारंपरिक टिमकी वादन।</p>
          </div>
          <div class="feature-card">
            <span class="card-icon">💰</span>
            <h3>50-50 क्रिएटर पार्टनरशिप</h3>
            <p>Google AdSense से होने वाले विज्ञापन राजस्व का सीधा 50% क्रिएटरों के बैंक खाते में पारदर्शी वितरण।</p>
          </div>
        </div>

        <section>
          <h2>हमारा क्रिएटर सशक्तिकरण मॉडल (Creator Empowerment)</h2>
          <p>
            BundeliTube केवल एक वीडियो मंच नहीं है, बल्कि एक आर्थिक आंदोलन है। ग्रामीण कलाकारों को अपनी कला प्रदर्शित करने के लिए किसी बड़े महानगर जाने की आवश्यकता नहीं है। वे सीधे अपने गाँव, खेत या घर से वीडियो अपलोड कर सकते हैं और सत्यापित होने पर Google विज्ञापनों से सम्मानजनक मासिक आय अर्जित कर सकते हैं।
          </p>
        </section>

        <section>
          <h2>संपर्क व सहभागिता</h2>
          <p>
            यदि आप एक बुंदेली कलाकार, निर्माता, शोधकर्ता या श्रोता हैं, तो हम आपका स्वागत करते हैं। हमसे सीधे संपर्क करें: <a href="mailto:${CONTACT_EMAIL}"><strong>${CONTACT_EMAIL}</strong></a>
          </p>
        </section>
      </article>
    `;
  } else if (type === 'contact') {
    bodyContent = `
      <article class="content-article">
        <div class="article-badge">सहायता एवं संपर्क केंद्र (Help & Support)</div>
        <h1>हमसे संपर्क करें (Contact Us)</h1>
        <p class="last-updated">BundeliTube सहायता डेस्क | 24/7 Creator & Viewer Support</p>

        <section>
          <p>
            BundeliTube से संबंधित किसी भी पूछताछ, क्रिएटर चैनल सत्यापन, विज्ञापन सहायता, कॉपीराइट शिकायत अथवा तकनीकी समस्या के समाधान हेतु हमारी टीम आपकी सहायता के लिए सदैव तत्पर है।
          </p>
        </section>

        <div class="contact-grid">
          <div class="contact-card">
            <div class="contact-icon">📧</div>
            <h3>आधिकारिक ईमेल (Official Email)</h3>
            <p>सामान्य पूछताछ, साझेदारी एवं सहायता:</p>
            <p><a href="mailto:${CONTACT_EMAIL}" class="contact-highlight">${CONTACT_EMAIL}</a></p>
          </div>

          <div class="contact-card">
            <div class="contact-icon">⚖️</div>
            <h3>कानूनी व शिकायत निवारण (Legal & Grievance)</h3>
            <p>सूचना प्रौद्योगिकी नियम 2021 के तहत शिकायत दर्ज करने हेतु:</p>
            <p><a href="mailto:${CONTACT_EMAIL}?subject=Legal%20Grievance%20Notice" class="contact-highlight">${CONTACT_EMAIL}</a></p>
          </div>

          <div class="contact-card">
            <div class="contact-icon">📍</div>
            <h3>क्षेत्रीय कार्यालय (Regional Office)</h3>
            <p>बुंदेलखंड संभाग (छतरपुर, टीकमगढ़, सागर, झाँसी, बांदा, ललितपुर), मध्य प्रदेश एवं उत्तर प्रदेश, भारत।</p>
          </div>

          <div class="contact-card">
            <div class="contact-icon">🌐</div>
            <h3>आधिकारिक वेबसाइट (Website)</h3>
            <p>वेब पोर्टल: <a href="https://${DOMAIN}" class="contact-highlight">https://${DOMAIN}</a></p>
          </div>
        </div>

        <section>
          <h2>प्रतिक्रिया समय (Response SLA)</h2>
          <p>
            सभी उपयोगकर्ता व प्रकाशक ईमेल का उत्तर <strong>24 से 48 व्यावसायिक घंटों</strong> के भीतर अनिवार्य रूप से दिया जाता है।
          </p>
        </section>
      </article>
    `;
  } else if (type === 'disclaimer') {
    bodyContent = `
      <article class="content-article">
        <div class="article-badge">कानूनी अस्वीकरण (Legal Notice)</div>
        <h1>अस्वीकरण (Disclaimer)</h1>
        <p class="last-updated">अंतिम अद्यतन: 23 सितम्बर 2026</p>

        <section>
          <h2>1. सामान्य जानकारी (General Information)</h2>
          <p>
            BundeliTube (${DOMAIN}) पर प्रस्तुत सामग्री केवल सांस्कृतिक संरक्षण, मनोरंजन और सूचनात्मक उद्देश्यों के लिए प्रदान की जाती है। हम इस वेबसाइट पर प्रस्तुत सामग्री की पूर्णता या सटीकता के संबंध में कोई स्पष्ट या निहित वारंटी नहीं देते हैं।
          </p>
        </section>

        <section>
          <h2>2. उपयोगकर्ता जनित सामग्री (User Generated Content)</h2>
          <p>
            BundeliTube सूचना प्रौद्योगिकी अधिनियम, 2000 की धारा 79 के तहत एक डिजिटल मध्यवर्ती (Intermediary) के रूप में कार्य करता है। वीडियो सामग्री विभिन्न स्वतंत्र रचनाकारों द्वारा अपलोड की जाती है। किसी भी वीडियो में व्यक्त विचार संबंधित क्रिएटर के व्यक्तिगत विचार हैं, जिनका BundeliTube प्रबंधन से सहमत होना आवश्यक नहीं है।
          </p>
        </section>

        <section>
          <h2>3. फेयर यूज़ एवं कॉपीराइट नोटिस (Fair Use & Copyright Notice)</h2>
          <p>
            यदि आपको लगता है कि किसी सामग्री से आपके कॉपीराइट का उल्लंघन हुआ है, तो कृपया तत्काल हमारे कानूनी प्रकोष्ठ से संपर्क करें: <a href="mailto:${CONTACT_EMAIL}"><strong>${CONTACT_EMAIL}</strong></a>। वैध शिकायत प्राप्त होने पर संबंधित सामग्री को त्वरित रूप से हटा दिया जाएगा।
          </p>
        </section>
      </article>
    `;
  } else if (type === 'creator-program') {
    bodyContent = `
      <article class="content-article">
        <div class="article-badge">पारदर्शी कमाई मॉडल (Transparent Monetization)</div>
        <h1>क्रिएटर 50-50 पार्टनर प्रोग्राम (Creator Monetization Policy)</h1>
        <p class="last-updated">बुंदेली कलाकारों के लिए भारत की सबसे पारदर्शी राजस्व वितरण प्रणाली</p>

        <section>
          <h2>1. 50-50 राजस्व विभाजन सिद्धांत (50/50 Revenue Split)</h2>
          <p>
            BundeliTube का मूल दर्शन कलाकारों को उनका सच्चा हक देना है। मंच पर प्रदर्शित होने वाले <strong>Google AdSense एवं AdMob विज्ञापनों</strong> से प्राप्त होने वाले शुद्ध राजस्व का <strong>50% हिस्सा सीधे संबंधित वीडियो क्रिएटर के वॉलेट में वितरित किया जाता है</strong>, जबकि शेष 50% सर्वर रखरखाव, बैंडविड्थ, स्ट्रीमिंग तकनीक और प्लेटफ़ॉर्म के विकास में उपयोग होता है।
          </p>
        </section>

        <div class="feature-grid">
          <div class="feature-card">
            <span class="card-icon">📊</span>
            <h3>लाइव इम्प्रेसन ट्रैकिंग</h3>
            <p>हर विज्ञापन दृश्य (Ad Impression) का रियल-टाइम रिकॉर्ड और पारदर्शी वॉलेट खाता-बही।</p>
          </div>
          <div class="feature-card">
            <span class="card-icon">🏦</span>
            <h3>सीधे बैंक ट्रांसफर व UPI</h3>
            <p>न्यूनतम निकासी सीमा पूर्ण होते ही राशि सीधे आपके बैंक खाते अथवा UPI में सुरक्षित ट्रांसफर।</p>
          </div>
          <div class="feature-card">
            <span class="card-icon">🛡️</span>
            <h3>सुरक्षित भुगतान गारंटी</h3>
            <p>एडमिन पेआउट डेस्क द्वारा 24-48 घंटों के भीतर बिना किसी मध्यस्थ शुल्क के भुगतान।</p>
          </div>
          <div class="feature-card">
            <span class="card-icon">⭐</span>
            <h3>सत्यापित क्रिएटर बैज</h3>
            <p>समीक्षा उपरांत वास्तविक लोक कलाकारों को सत्यापित ग्रीन टिक और प्राथमिकता सहयोग।</p>
          </div>
        </div>

        <section>
          <h2>2. मुद्रीकरण पात्रता मानदंड (Monetization Criteria)</h2>
          <ul>
            <li>चैनल का नाम, वास्तविक प्रोफ़ाइल विवरण एवं वैध मोबाइल नंबर।</li>
            <li>कम से कम 1 मूल बुंदेली वीडियो अथवा शॉर्ट्स सामग्री का सफल प्रकाशन।</li>
            <li>सामग्री किसी अन्य क्रिएटर की कॉपी अथवा पायरेटेड नहीं होनी चाहिए।</li>
            <li>सत्यापित बैंक खाता (खाता संख्या, IFSC कोड, धारक का नाम) अथवा UPI आईडी।</li>
          </ul>
        </section>
      </article>
    `;
  }

  return `<!doctype html>
<html lang="hi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${currentMeta.title}</title>
    <meta name="description" content="${currentMeta.description}" />
    <link rel="canonical" href="${currentMeta.canonical}" />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="${currentMeta.title}" />
    <meta property="og:description" content="${currentMeta.description}" />
    <meta property="og:url" content="${currentMeta.canonical}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${APP_NAME}" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <link rel="icon" type="image/png" sizes="192x192" href="/logo-app-192.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Yatra+One&display=swap" rel="stylesheet">
    
    <!-- Google AdMob / AdSense Web Script for Publisher ${PUBLISHER_ID} -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLISHER_ID}" crossorigin="anonymous"></script>

    <style>
      :root {
        --bg-main: #020617;
        --bg-card: #0f172a;
        --border-color: #1e293b;
        --text-primary: #f8fafc;
        --text-secondary: #94a3b8;
        --accent: #f59e0b;
        --accent-hover: #d97706;
        --emerald: #10b981;
      }
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body {
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        background-color: var(--bg-main);
        color: var(--text-primary);
        line-height: 1.7;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      a {
        color: var(--accent);
        text-decoration: none;
        transition: color 0.2s;
      }
      a:hover {
        color: var(--accent-hover);
        text-decoration: underline;
      }
      .container {
        width: 100%;
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 20px;
      }
      /* Header */
      .site-header {
        background-color: rgba(15, 23, 42, 0.9);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--border-color);
        position: sticky;
        top: 0;
        z-index: 50;
      }
      .header-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        flex-wrap: wrap;
        gap: 16px;
      }
      .brand-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #fff;
        text-decoration: none !important;
      }
      .logo-badge {
        font-size: 26px;
      }
      .brand-text strong {
        font-size: 20px;
        letter-spacing: -0.5px;
        color: var(--accent);
      }
      .brand-text .hindi-text {
        font-size: 14px;
        color: var(--text-secondary);
        margin-left: 4px;
      }
      .nav-links {
        display: flex;
        align-items: center;
        gap: 18px;
        flex-wrap: wrap;
      }
      .nav-link {
        font-size: 13.5px;
        font-weight: 600;
        color: var(--text-secondary);
        padding: 6px 10px;
        border-radius: 8px;
      }
      .nav-link:hover, .nav-link.active {
        color: #fff;
        background-color: rgba(255, 255, 255, 0.06);
        text-decoration: none;
      }
      .nav-link.active {
        color: var(--accent);
      }

      /* Main Article */
      main {
        flex: 1;
        padding: 40px 0 60px 0;
      }
      .content-article {
        background-color: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 24px;
        padding: 40px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      }
      .article-badge {
        display: inline-block;
        background-color: rgba(16, 185, 129, 0.1);
        color: var(--emerald);
        border: 1px solid rgba(16, 185, 129, 0.3);
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      h1 {
        font-size: 32px;
        font-weight: 800;
        letter-spacing: -0.5px;
        margin-bottom: 8px;
        color: #fff;
      }
      .last-updated {
        font-size: 13px;
        color: var(--text-secondary);
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid var(--border-color);
      }
      h2 {
        font-size: 22px;
        font-weight: 700;
        color: #f1f5f9;
        margin: 32px 0 14px 0;
      }
      h3 {
        font-size: 18px;
        font-weight: 600;
        color: #e2e8f0;
        margin: 20px 0 10px 0;
      }
      p {
        margin-bottom: 16px;
        color: #cbd5e1;
        font-size: 15.5px;
      }
      ul {
        margin: 12px 0 20px 24px;
        color: #cbd5e1;
      }
      li {
        margin-bottom: 8px;
      }
      code {
        background-color: #1e293b;
        color: var(--accent);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 14px;
      }

      /* Grids */
      .feature-grid, .contact-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
        margin: 28px 0;
      }
      .feature-card, .contact-card {
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid var(--border-color);
        padding: 24px;
        border-radius: 18px;
      }
      .card-icon, .contact-icon {
        font-size: 32px;
        display: block;
        margin-bottom: 12px;
      }
      .info-card {
        background: rgba(245, 158, 11, 0.05);
        border: 1px solid rgba(245, 158, 11, 0.2);
        padding: 24px;
        border-radius: 16px;
        margin-top: 16px;
      }
      .contact-highlight {
        font-weight: 700;
        color: var(--accent);
      }

      /* Footer */
      .site-footer {
        background-color: #030712;
        border-top: 1px solid var(--border-color);
        padding: 50px 0 30px 0;
        margin-top: auto;
      }
      .footer-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1.5fr;
        gap: 36px;
      }
      .footer-desc {
        font-size: 13.5px;
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: 16px;
      }
      .footer-meta {
        font-size: 12px;
        color: #64748b;
      }
      .footer-title {
        font-size: 15px;
        font-weight: 700;
        color: #f1f5f9;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .footer-links {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .footer-links li {
        margin-bottom: 10px;
      }
      .footer-links a {
        font-size: 13.5px;
        color: var(--text-secondary);
      }
      .footer-links a:hover {
        color: var(--accent);
      }
      .footer-contact {
        font-size: 13px;
        color: var(--text-secondary);
        line-height: 1.8;
      }

      @media (max-width: 860px) {
        .footer-grid {
          grid-template-columns: 1fr;
          gap: 30px;
        }
        .content-article {
          padding: 24px 18px;
        }
        h1 {
          font-size: 26px;
        }
      }
    </style>
  </head>
  <body>
    ${getHeaderHtml(type)}
    <main>
      <div class="container">
        ${bodyContent}
      </div>
    </main>
    ${getFooterHtml()}
  </body>
</html>`;
}
