"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_router_1 = __importDefault(require("./routers/auth.router"));
const test_route_1 = __importDefault(require("./routers/test.route"));
const property_router_1 = __importDefault(require("./routers/property.router"));
const PORT = Number(process.env.PORT) || 8000;
const app = (0, express_1.default)();
// 🧠 Set trust proxy (penting untuk rate limit & IP detect di Vercel)
app.set('trust proxy', true);
// 🔍 Optional debug IP (remove in production)
// app.use((req, _res, next) => { console.log(`[IP]`, req.ip); next(); });
// 📦 Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ✅ Healthcheck endpoint
app.get('/api', (_req, res) => {
    res.status(200).json({ message: 'Welcome to My API...!' });
});
// 🛣️ API routes
const authRouter = new auth_router_1.default();
app.use('/api/auth', authRouter.getRouter());
// const userProfileRouter = new UserProfileRouter();
// app.use("/api/user-profile", userProfileRouter.getRouter()); 
const propertyProfileRouter = new property_router_1.default();
app.use("/api/property", propertyProfileRouter.getRouter());
app.use('/api', test_route_1.default);
// 🛑 Fallback for unknown routes
app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
// ❌ Global error handler
app.use((err, _req, res) => {
    console.error('❌ Unexpected Error:', err);
    res.status(500).json({ message: 'Internal server error', error: err?.message || err });
});
// 🚀 Start server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
