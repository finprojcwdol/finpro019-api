import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import AuthRouter from './routers/auth.router';
import testRouter from './routers/test.route';
import UserProfileRouter from './routers/user-profile.router';
import PropertyRouter from './routers/property.router';

const PORT: number = Number(process.env.PORT) || 8000;
const app: Application = express();

// 🧠 Set trust proxy (penting untuk rate limit & IP detect di Vercel)
app.set('trust proxy', true);

// 🔍 Optional debug IP (remove in production)
// app.use((req, _res, next) => { console.log(`[IP]`, req.ip); next(); });

// 📦 Middlewares
app.use(cors());
app.use(express.json());

// ✅ Healthcheck endpoint
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to My API...!' });
});

// 🛣️ API routes
const authRouter = new AuthRouter();
app.use('/api/auth', authRouter.getRouter());


// const userProfileRouter = new UserProfileRouter();
// app.use("/api/user-profile", userProfileRouter.getRouter()); 


const propertyProfileRouter = new PropertyRouter();
app.use("/api/property", propertyProfileRouter.getRouter()); 


app.use('/api', testRouter);

// 🛑 Fallback for unknown routes
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ❌ Global error handler
app.use((err: any, _req: Request, res: Response) => {
  console.error('❌ Unexpected Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err?.message || err });
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
