import { Router } from "express";
import rateLimit from "express-rate-limit";
import UserProfileController from "../controllers/user-profile.controller";
import { authenticateToken } from "../middlewares/auth";
import PropertyController from "../controllers/property.controller";
// import UserProfileController from "../controllers/user-profile";

const getProfileLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 menit
  max: Number(process.env.PROFILE_REQUEST_LIMITER) || 10,
  message: "Too many requests. Please try again later.",
});

export default class PropertyRouter {
  private router: Router;
  private PropertyController: PropertyController;

  constructor() {
    this.router = Router();
    this.PropertyController = new PropertyController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/details", authenticateToken, this.PropertyController.getDetails);
    this.router.post("/detail-update", authenticateToken, this.PropertyController.updateDetails);
    this.router.get("/categories", authenticateToken, this.PropertyController.getCategories);
  }

  public getRouter(): Router {
    return this.router;
  }
}
