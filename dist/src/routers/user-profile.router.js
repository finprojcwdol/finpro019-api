"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = require("../middlewares/auth");
const user_profile_controller_1 = __importDefault(require("../controllers/user-profile.controller"));
const property_controller_1 = __importDefault(require("../controllers/property.controller"));
const getProfileLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 menit
    max: Number(process.env.PROFILE_REQUEST_LIMITER) || 10,
    message: "Too many requests. Please try again later.",
});
class UserProfileRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.userProfileController = new user_profile_controller_1.default();
        this.PropertyController = new property_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // this.router.post("/get1", authenticateToken, this.PropertyController.getDetails);
        this.router.post("/get1", auth_1.authenticateToken, this.userProfileController.getProfile);
        // this.router.post("/get", authenticateToken, this.userProfileController.getProfile);
        this.router.patch("/update", this.userProfileController.updateProfile);
        this.router.patch("/update-password", this.userProfileController.updatePassword);
        // this.router.post("/propdetails", authenticateToken, this.PropertyController.getDetails);
        // this.router.post("/propdetails", authenticateToken, this.userProfileController.getProfile);
    }
    getRouter() {
        return this.router;
    }
}
exports.default = UserProfileRouter;
