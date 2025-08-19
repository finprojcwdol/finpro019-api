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
    async getRoomFacilities(req, res) {
        try {
            const RoomFacilities = await prisma_1.default.roomFacilities.findMany();
            res.status(200).json({
                message: "Success",
                data: RoomFacilities,
            });
            return;
        }
        catch (error) {
            console.error("Error fetching room facilities:", error);
            res.status(500).json({ message: "Internal server error" });
            return;
        }
    }
    // ✅ Fungsi untuk update atau buat properti berdasarkan email
    async updateDetails(req, res) {
        try {
            const { email, name, categoryId, country, location, phone_country, phone_number, pic_first_name, pic_last_name, pic_email, pic_position, pic_country_code, pic_phone_number, } = req.body;
            console.log("Body: ", req.body);
            // Validasi minimal
            if (!email || !name || !categoryId) {
                res
                    .status(400)
                    .json({ message: "Email, name, and categoryId are required" });
                return;
            }
            // Cari user berdasarkan email
            const user = await prisma_1.default.user.findUnique({
                where: { email },
                include: { properties: true },
            });
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            const property = user.properties[0];
            let resultProperty;
            if (property) {
                // Update properti
                resultProperty = await prisma_1.default.property.update({
                    where: { id: property.id },
                    data: {
                        name,
                        country,
                        location,
                        phone_country,
                        phone_number,
                        pic_first_name,
                        pic_last_name,
                        pic_email,
                        pic_position,
                        pic_country_code,
                        pic_phone_number,
                        category: {
                            connect: { id: categoryId },
                        },
                    },
                });
                console.log("Property updated:", resultProperty);
            }
            else {
                // Create properti baru
                resultProperty = await prisma_1.default.property.create({
                    data: {
                        name,
                        country: country || "",
                        location: location || "",
                        phone_country: phone_country || "",
                        phone_number: phone_number || "",
                        pic_first_name: pic_first_name || "",
                        pic_last_name: pic_last_name || "",
                        pic_email: pic_email || "",
                        pic_position: pic_position || "",
                        pic_country_code: pic_country_code || "",
                        pic_phone_number: pic_phone_number || "",
                        tenant: {
                            connect: { id: user.id },
                        },
                        category: {
                            connect: { id: categoryId },
                        },
                    },
                });
                console.log("Property created:", resultProperty);
            }
            res.status(200).json({
                message: property
                    ? "Property updated successfully"
                    : "Property created successfully",
                data: resultProperty,
            });
        }
        catch (error) {
            console.error("Error updating/creating property details:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
exports.default = PropertyController;
