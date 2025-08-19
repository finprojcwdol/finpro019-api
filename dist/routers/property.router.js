"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = require("../middlewares/auth");
const property_controller_1 = __importDefault(require("../controllers/property.controller"));
const user_profile_controller_1 = __importDefault(require("../controllers/user-profile.controller"));
const upload_1 = __importDefault(require("../middlewares/upload"));
const getProfileLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 menit...
    max: Number(process.env.PROFILE_REQUEST_LIMITER) || 10,
    message: "Too many requests. Please try again later.",
});
class PropertyRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.PropertyController = new property_controller_1.default();
        this.userProfileController = new user_profile_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/details", auth_1.authenticateToken, this.PropertyController.getDetails);
        this.router.post("/detail-category", auth_1.authenticateToken, this.PropertyController.getDetailCategory);
        this.router.post("/detail-category-update", auth_1.authenticateToken, this.PropertyController.updateDetailCategory);
        this.router.post("/detail-room", auth_1.authenticateToken, this.PropertyController.getDetailRoom);
        this.router.post("/detail-update", auth_1.authenticateToken, this.PropertyController.updateDetails);
        // this.router.post("/add-room", authenticateToken, this.PropertyController.addRoom);
        // this.router.post("/property/room-add", authenticateToken, upload.array("images", 10),this.PropertyController.addRoom);    
        // this.router.post("/property/room-add", upload.array("images", 10),this.PropertyController.addRoom);    
        this.router.post("/room-add", auth_1.authenticateToken, upload_1.default.array("images", 10), (req, res) => this.PropertyController.addRoom(req, res));
        // Update room
        this.router.post("/room-update/:id", auth_1.authenticateToken, upload_1.default.array("images", 10), this.PropertyController.updateRoom.bind(this.PropertyController) // ✅ bind
        );
        this.router.get("/categories", auth_1.authenticateToken, this.PropertyController.getCategories);
        this.router.get("/room-facilities", auth_1.authenticateToken, this.PropertyController.getRoomFacilities);
        this.router.get("/room-types", auth_1.authenticateToken, this.PropertyController.getRoomTypes);
        this.router.post("/getusr", auth_1.authenticateToken, this.userProfileController.getProfile);
    }
    getRouter() {
        return this.router;
    }
}
exports.default = PropertyRouter;
