import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './configs/mongodb.js';
import userRouter from './routes/userRoutes.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import cloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import { clerkWebhookHandler, stripeWebhooks } from './controllers/clerkWebhook.js';
import { adminJs, adminRouter as adminJsRouter } from './configs/adminjs.js';
import { protectAdmin } from './middlewares/authMiddleware.js';

// 🔹 Naye imports for seeding
import Course from './models/Course.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../client/.env') });
const app = express();

// --------------------
// 1️ Webhooks first (raw body)
// --------------------
app.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhookHandler);
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// --------------------
// 2️ CORS (single, correct config)
// --------------------
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "https://lms-1-ki76.onrender.com"
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// --------------------
// 3️ Other middleware
// --------------------
app.use(express.json());       // normal JSON parser
app.use(clerkMiddleware());    // Clerk auth middleware

// --------------------
// 4️Connect DB + Cloudinary
// --------------------
await connectDB();
// Cloudinary is configured on import

// --------------------
// 5️ Routes
// --------------------
app.use(adminJs.options.rootPath, protectAdmin, adminJsRouter);
app.get('/', (req, res) => {
  res.send('LMS API is running...');
});

app.use('/api/user', userRouter);
app.use('/api/educator', educatorRouter);
app.use('/api/admin', adminRouter);
app.use('/api/course', courseRouter);

// --------------------
// 6️Start Server
// --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
