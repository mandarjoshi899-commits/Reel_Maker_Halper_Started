import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import multer from "multer";
import "dotenv/config";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const allowedOrigin = process.env.APP_ORIGIN;
const provider = process.env.AI_PROVIDER || "demo";

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin(origin, callback) {
    // Permit command-line health checks with no Origin; browsers must match allow-list.
    if (!origin || origin === allowedOrigin) return callback(null, true);
    return callback(new Error("Origin not allowed"));
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json({ limit: "32kb" }));
app.use("/api/", rateLimit({ windowMs: 60 * 1000, limit: 10, standardHeaders: "draft-7", legacyHeaders: false }));

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, cb) {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowed.has(file.mimetype)) return cb(new Error("Only JPG, PNG and WebP images are accepted."));
    cb(null, true);
  }
});

app.get("/health", (_req, res) => res.json({ ok: true, app: "Reel Maker Helper API", version: "3.0.0" }));

function validateCommon(req, res, next) {
  const duration = Number(req.body.duration);
  const aspectRatio = String(req.body.aspectRatio || "");
  if (![5, 10, 15, 30].includes(duration)) return res.status(400).json({ error: "Invalid duration." });
  if (!["9:16", "16:9", "1:1"].includes(aspectRatio)) return res.status(400).json({ error: "Invalid aspect ratio." });
  next();
}

app.post("/api/video/text", validateCommon, (req, res) => {
  const prompt = String(req.body.prompt || "").trim();
  if (prompt.length < 8 || prompt.length > 1800) return res.status(400).json({ error: "Prompt must be 8–1800 characters." });
  if (provider === "demo") return res.status(503).json({ error: "AI provider is not configured yet. Demo mode is active; no video was generated." });
  // Add the chosen provider's official server-side API integration here.
  // Keep provider keys in host environment variables, never in the browser or APK.
  return res.status(501).json({ error: "Provider adapter is not implemented. Configure an official provider integration first." });
});

app.post("/api/video/image", upload.single("image"), validateCommon, (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Please upload one supported image." });
  const motion = String(req.body.motion || "").trim();
  if (motion.length > 700) return res.status(400).json({ error: "Motion description is too long." });
  if (provider === "demo") return res.status(503).json({ error: "AI provider is not configured yet. Demo mode is active; no video was generated." });
  // Add the chosen provider's official server-side image-to-video API integration here.
  return res.status(501).json({ error: "Provider adapter is not implemented. Configure an official provider integration first." });
});

app.use((err, _req, res, _next) => {
  const status = err instanceof multer.MulterError ? 400 : 400;
  res.status(status).json({ error: err.message || "Request could not be processed." });
});

app.listen(PORT, () => {
  console.log(`Reel Maker Helper API listening on port ${PORT}`);
});
