import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import multer from "multer";

dotenv.config();

const app = express();
const PORT = 3000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Range, X-Requested-With");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ==================== API ROUTES ====================

import { 
  getCreatorsAdStats, 
  executeAdRevenueDistribution, 
  toggleWithdrawalWindow, 
  getDistributionHistory,
  startFirestoreDistributionListener
} from "./server/externalAdminService.js";
import { getExternalAdminPortalHtml } from "./server/externalAdminPortalHtml.js";

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    platform: "BundeliTube Cloud Platform",
    timestamp: new Date().toISOString()
  });
});

// 1. External Admin API: Get all creators & their ad impressions
app.get("/api/external-admin/creators-stats", async (_req: Request, res: Response) => {
  try {
    const creators = await getCreatorsAdStats();
    res.json({
      success: true,
      totalCreators: creators.length,
      creators
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. External Admin API: Distribute Ad Revenue directly to all creators' wallets in Firebase
const handleDistribution = async (req: Request, res: Response) => {
  try {
    const { 
      ratePerAd, 
      totalBudget, 
      totalAds, 
      creatorSharePercentage, 
      note, 
      adminEmail, 
      calculationBasis,
      customCreatorAds 
    } = req.body;

    const result = await executeAdRevenueDistribution({
      ratePerAd: ratePerAd ? Number(ratePerAd) : undefined,
      totalBudget: totalBudget ? Number(totalBudget) : undefined,
      totalAds: totalAds ? Number(totalAds) : undefined,
      creatorSharePercentage: creatorSharePercentage ? Number(creatorSharePercentage) : 50,
      note: note || 'External Admin Website Automated Ad Revenue Distribution',
      adminEmail: adminEmail || 'admin@bundelitube.com',
      calculationBasis,
      customCreatorAds
    });

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

app.post("/api/external-admin/distribute-ad-revenue", handleDistribution);
app.post("/api/admin/distribute-ads", handleDistribution);

// 3. External Admin API: Lock / Unlock 1st to 5th withdrawal window
app.post("/api/external-admin/toggle-withdrawal-window", async (req: Request, res: Response) => {
  try {
    const { unlocked, adminNote } = req.body;
    const result = await toggleWithdrawalWindow(Boolean(unlocked), adminNote);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. External Admin API: History of past distributions
app.get("/api/external-admin/distribution-history", async (_req: Request, res: Response) => {
  try {
    const history = await getDistributionHistory();
    res.json({ success: true, history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. External Admin API: Integration Guide & Code documentation for external websites
app.get("/api/external-admin/integration-guide", (req: Request, res: Response) => {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = `${protocol}://${req.get("host")}`;

  res.json({
    platform: "BundeliTube External Admin API",
    note: "यह API आपकी अलग एडमिन वेबसाइट को सीधे Firebase से जोड़े बिना क्रिएटर्स के वॉलेट में पैसे जोड़ने की सुविधा देता है।",
    endpoints: {
      distributeAdRevenue: {
        method: "POST",
        url: `${host}/api/external-admin/distribute-ad-revenue`,
        description: "1 विज्ञापन की दर या कुल बजट डालकर सभी क्रिएटर्स के वॉलेट में पैसे जोड़ें",
        samplePayload: {
          ratePerAd: 0.50,
          creatorSharePercentage: 50,
          note: "मार्च 2026 विज्ञापन आय"
        }
      },
      getCreatorsStats: {
        method: "GET",
        url: `${host}/api/external-admin/creators-stats`,
        description: "सभी क्रिएटर्स, चैनल्स व उनके विज्ञापन इम्प्रेसन्स की सूची प्राप्त करें"
      },
      toggleWithdrawal: {
        method: "POST",
        url: `${host}/api/external-admin/toggle-withdrawal-window`,
        description: "1 से 5 तारीख की विड्रॉल विंडो को लॉक या अनलॉक करें",
        samplePayload: { unlocked: true, adminNote: "विंडो खुली है" }
      },
      standalonePortalUrl: `${host}/external-admin-portal`
    }
  });
});

// 6. Standalone External Admin Portal (Can be opened directly or embedded via iframe in external website)
app.get("/external-admin-portal", (req: Request, res: Response) => {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = `${protocol}://${req.get("host")}`;
  const html = getExternalAdminPortalHtml(host);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

// Digital Asset Links for Android Play Store TWA (PWABuilder)
app.get("/.well-known/assetlinks.json", (_req: Request, res: Response) => {
  const assetlinksPath = path.join(process.cwd(), "public", ".well-known", "assetlinks.json");
  if (fs.existsSync(assetlinksPath)) {
    try {
      const content = fs.readFileSync(assetlinksPath, "utf-8");
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.send(content);
    } catch {
      // fallback
    }
  }
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.bundelitube.app",
        sha256_cert_fingerprints: [
          "14:6D:E9:7D:0C:6D:E1:9E:BE:E2:DF:D6:DF:8C:77:4A:2A:B2:D6:1B:6F:4D:42:0E:6D:68:57:3E:12:F1:C9:49"
        ]
      }
    }
  ]);
});

// Explicitly serve public static assets (manifest.json, icons, sw.js)
app.use(express.static(path.join(process.cwd(), "public")));

// Admin video moderation endpoint stubs
app.post("/api/admin/videos/approve", (req: Request, res: Response) => {
  const { videoId } = req.body;
  res.json({ success: true, videoId, status: "approved", approvedAt: new Date().toISOString() });
});

app.post("/api/admin/videos/reject", (req: Request, res: Response) => {
  const { videoId, reason } = req.body;
  res.json({ success: true, videoId, status: "rejected", reason, rejectedAt: new Date().toISOString() });
});

// ==================== VITE SERVER & STATIC SERVING ====================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🎬 BundeliTube Server running on http://0.0.0.0:${PORT}`);
    // Start real-time listener for external admin website ad distribution requests in Firebase
    startFirestoreDistributionListener();
  });
}

startServer();
