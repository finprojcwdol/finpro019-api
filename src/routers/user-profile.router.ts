import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "../middlewares/auth";
import UserProfileController from "../controllers/user-profile.controller";
import PropertyController from "../controllers/property.controller";

const getProfileLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 menit
  max: Number(process.env.PROFILE_REQUEST_LIMITER) || 10,
  message: "Too many requests. Please try again later.",
});

export default class UserProfileRouter {
  private router: Router;
  private userProfileController: UserProfileController;
  private PropertyController: PropertyController;

  constructor() {
    this.router = Router();
    this.userProfileController = new UserProfileController();
    this.PropertyController = new PropertyController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.post("/get2", authenticateToken, this.PropertyController.getDetails);
    // this.router.post("/get1", authenticateToken, this.userProfileController.getProfile);
    this.router.post("/get", authenticateToken, this.userProfileController.getProfile);
    this.router.patch("/update", this.userProfileController.updateProfile);
    this.router.patch("/update-password", this.userProfileController.updatePassword);
    // this.router.post("/propdetails", authenticateToken, this.PropertyController.getDetails);
    // this.router.post("/propdetails", authenticateToken, this.userProfileController.getProfile);
  }

  public getRouter(): Router {
    return this.router;
  }
}
