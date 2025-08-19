"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../prisma"));
const prisma_2 = require("../../generated/prisma");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("../helpers/cloudinary"));
const isDebug = process.env.DEBUG === "true";
function logDebug(message, ...optionalParams) {
    if (isDebug) {
        console.log("[DEBUG]", message, ...optionalParams);
    }
}
// setup multer memory storage
const storage = multer_1.default.memoryStorage();
// export const upload = multer({ storage });
// setup cloudinary
cloudinary_1.default.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
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
    async getDetailCategory(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ message: "Email is required" });
                return;
            }
            // Cari user berdasarkan email dan ambil hanya category dari properties
            const user = await prisma_1.default.user.findUnique({
                where: { email },
                include: {
                    properties: {
                        select: {
                            category: true,
                        },
                    },
                },
            });
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            // Ambil hanya array kategori dari properties
            const categories = user.properties.map((property) => property.category);
            res.status(200).json({
                message: "Success",
                data: categories,
            });
            return;
        }
        catch (error) {
            console.error("Error getting property details:", error);
            res.status(500).json({ message: "Internal server error" });
            return;
        }
    }
    async getDetailRoom(req, res) {
        try {
            const { email } = req.body;
            // Validasi minimal
            if (!email) {
                res.status(400).json({ message: "Email is required" });
                return;
            }
            // Cari user berdasarkan email dan ambil properties beserta rooms
            const user = await prisma_1.default.user.findUnique({
                where: { email },
                include: {
                    properties: {
                        include: {
                            rooms: {
                                orderBy: {
                                    name: "asc", // bisa diganti "desc" untuk urutan menurun
                                },
                                include: {
                                    availabilities: true,
                                    peakRates: true,
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
            // Kumpulkan semua room dari setiap property user
            const rooms = user.properties.flatMap((property) => property.rooms);
            res.status(200).json({
                message: "Success",
                data: rooms,
            });
            return;
        }
        catch (error) {
            console.error("Error getting room details:", error);
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
    async getRoomTypes(req, res) {
        try {
            // Ambil semua value enum dari RoomType
            const roomTypes = Object.values(prisma_2.RoomType);
            res.status(200).json({
                message: "Success",
                data: roomTypes,
            });
            return;
        }
        catch (error) {
            console.error("Error fetching room types:", error);
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
    async updateDetailCategory(req, res) {
        try {
            const { email, categoryId } = req.body;
            // Validasi minimal
            if (!email || !categoryId) {
                res.status(400).json({ message: "Email and categoryId are required" });
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
                // Update hanya category
                resultProperty = await prisma_1.default.property.update({
                    where: { id: property.id },
                    data: {
                        category: {
                            connect: { id: categoryId },
                        },
                    },
                    include: { category: true }, // supaya respon bawa info category
                });
                console.log("Property category updated:", resultProperty);
            }
            else {
                // Jika property belum ada → buat baru minimal dengan category
                resultProperty = await prisma_1.default.property.create({
                    data: {
                        name: "New Property", // bisa diganti sesuai kebutuhan
                        tenant: {
                            connect: { id: user.id },
                        },
                        category: {
                            connect: { id: categoryId },
                        },
                    },
                    include: { category: true },
                });
                console.log("Property created with category:", resultProperty);
            }
            res.status(200).json({
                message: property
                    ? "Property category updated successfully"
                    : "Property created with category successfully",
                data: resultProperty.category, // hanya return category
            });
        }
        catch (error) {
            console.error("Error updating property category:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
    async addRoom(req, res) {
        try {
            const { email, name, description, price, number_of_rooms, type } = req.body;
            // cari user tenant berdasarkan email
            const user = await prisma_1.default.user.findUnique({
                where: { email },
                include: { properties: true },
            });
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            if (user.properties.length === 0) {
                res.status(400).json({ message: "No property found for this tenant" });
                return;
            }
            // ambil propertyId pertama milik user
            const propertyId = user.properties[0].id;
            if (!name || !price || !number_of_rooms) {
                res.status(400).json({ message: "Name, price, and number_of_rooms are required" });
                return;
            }
            // --- Upload semua file gambar ke Cloudinary ---
            let uploadedUrls = [];
            if (req.files && Array.isArray(req.files)) {
                for (const file of req.files) {
                    const b64 = Buffer.from(file.buffer).toString("base64");
                    const dataURI = `data:${file.mimetype};base64,${b64}`;
                    const uploadRes = await cloudinary_1.default.uploader.upload(dataURI, {
                        folder: "rooms",
                    });
                    uploadedUrls.push(uploadRes.secure_url);
                }
            }
            // --- Simpan ke DB ---
            const room = await prisma_1.default.room.create({
                data: {
                    name,
                    description,
                    price: parseFloat(price),
                    number_of_rooms: parseInt(number_of_rooms, 10),
                    type,
                    propertyId,
                    images: {
                        create: uploadedUrls.map((url) => ({ url })),
                    },
                },
                include: { images: true, property: true },
            });
            res.status(201).json({
                message: "Room created successfully",
                room,
            });
        }
        catch (error) {
            console.error("Error creating room:", error);
            res.status(500).json({ message: "Error creating room", error });
        }
    }
    ;
    async updateRoom(req, res) {
        const roomId = req.params.id;
        const { email, name, description, type, price, number_of_rooms, is_published, } = req.body;
        try {
            // Cek room exist
            const existingRoom = await prisma_1.default.room.findUnique({ where: { id: roomId } });
            if (!existingRoom)
                return res.status(404).json({ message: "Room not found" });
            // Update room data
            const updatedRoom = await prisma_1.default.room.update({
                where: { id: roomId },
                data: {
                    name,
                    description,
                    type,
                    price: Number(price),
                    number_of_rooms: Number(number_of_rooms),
                    is_published: is_published === "true",
                },
            });
            // Upload images ke Cloudinary
            let uploadedUrls = [];
            if (req.files && Array.isArray(req.files)) {
                for (const file of req.files) {
                    const b64 = Buffer.from(file.buffer).toString("base64");
                    const dataURI = `data:${file.mimetype};base64,${b64}`;
                    const uploadRes = await cloudinary_1.default.uploader.upload(dataURI, {
                        folder: "rooms",
                    });
                    uploadedUrls.push(uploadRes.secure_url);
                }
                // Hapus gambar lama dari DB (tidak hapus dari cloud, optional)
                await prisma_1.default.roomImage.deleteMany({ where: { roomId } });
                // Simpan gambar baru ke DB
                for (const url of uploadedUrls) {
                    await prisma_1.default.roomImage.create({
                        data: {
                            roomId,
                            url,
                        },
                    });
                }
            }
            res.status(200).json({
                message: "Room updated successfully",
                data: updatedRoom,
                images: uploadedUrls,
            });
            return;
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: "Failed to update room" });
            return;
        }
    }
    ;
}
exports.default = PropertyController;
