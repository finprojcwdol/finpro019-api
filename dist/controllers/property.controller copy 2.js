"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../prisma"));
const isDebug = process.env.DEBUG === "true";
function logDebug(message, ...optionalParams) {
    if (isDebug) {
        console.log("[DEBUG]", message, ...optionalParams);
    }
}
class PropertyController {
    async getDetails(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ message: "Email is required" });
                return;
            }
            // Cari user berdasarkan email
            const user = await prisma_1.default.user.findUnique({
                where: { email },
                include: {
                    properties: {
                        include: {
                            category: true,
                            rooms: {
                                include: {
                                    availabilities: true,
                                    peakRates: true,
                                },
                            },
                            orders: true,
                            reviews: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            username: true,
                                        },
                                    },
                                    reply: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            logDebug("User found with properties:", user);
            res.status(200).json({
                message: "Success",
                data: user.properties,
            });
            return;
        }
        catch (error) {
            console.error("Error getting property details:", error);
            res.status(500).json({ message: "Internal server error" });
            return;
        }
    }
    // ✅ Fungsi untuk mengambil semua kategori properti
    async getCategories(req, res) {
        try {
            const categories = await prisma_1.default.propertyCategory.findMany();
            res.status(200).json({
                message: "Success",
                data: categories,
            });
            return;
        }
        catch (error) {
            console.error("Error fetching property categories:", error);
            res.status(500).json({ message: "Internal server error" });
            return;
        }
    }
}
exports.default = PropertyController;
