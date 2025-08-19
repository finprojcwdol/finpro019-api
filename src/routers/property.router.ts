import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "../middlewares/auth";
import PropertyController from "../controllers/property.controller";
import UserProfileController from "../controllers/user-profile.controller";
import upload from "../middlewares/upload";

const getProfileLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 menit...
  max: Number(process.env.PROFILE_REQUEST_LIMITER) || 10,
  message: "Too many requests. Please try again later.",
});

export default class PropertyRouter {
  private router: Router;
  private PropertyController: PropertyController;
  private userProfileController: UserProfileController;

  constructor() {
    this.router = Router();
    this.PropertyController = new PropertyController();
    this.userProfileController = new UserProfileController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/details", authenticateToken, this.PropertyController.getDetails);
    this.router.post("/detail-category", authenticateToken, this.PropertyController.getDetailCategory);
    this.router.post("/detail-category-update", authenticateToken, this.PropertyController.updateDetailCategory);
    this.router.post("/detail-room", authenticateToken, this.PropertyController.getDetailRoom);
    this.router.post("/detail-update", authenticateToken, this.PropertyController.updateDetails);
    // this.router.post("/add-room", authenticateToken, this.PropertyController.addRoom);
    // this.router.post("/property/room-add", authenticateToken, upload.array("images", 10),this.PropertyController.addRoom);    
    // this.router.post("/property/room-add", upload.array("images", 10),this.PropertyController.addRoom);    
    this.router.post(
      "/room-add",
      authenticateToken,
      upload.array("images", 10),
      (req, res) => this.PropertyController.addRoom(req, res)
    );

    // Update room
    this.router.post(
      "/room-update/:id",
      authenticateToken,
      upload.array("images", 10),
      this.PropertyController.updateRoom.bind(this.PropertyController) // ✅ bind
    );
  

    this.router.get("/categories", authenticateToken, this.PropertyController.getCategories);
    this.router.get("/room-facilities", authenticateToken, this.PropertyController.getRoomFacilities);
    this.router.get("/room-types", authenticateToken, this.PropertyController.getRoomTypes);
    this.router.post("/getusr", authenticateToken, this.userProfileController.getProfile);

  }

  public getRouter(): Router {
    return this.router;
  }
}
