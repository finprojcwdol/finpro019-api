import { Request, Response } from "express";
import prisma from "../prisma";
import { RoomType } from "../../generated/prisma";
import multer from "multer";
import cloudinary from "../helpers/cloudinary";

const isDebug = process.env.DEBUG === "true";
function logDebug(message: string, ...optionalParams: any[]) {
  if (isDebug) {
    console.log("[DEBUG]", message, ...optionalParams);
  }
}

// setup multer memory storage
const storage = multer.memoryStorage();
// export const upload = multer({ storage });

// setup cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default class PropertyController {
  async getDetails(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      // Cari user berdasarkan email
      const user = await prisma.user.findUnique({
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
        return ;
      }

      logDebug("User found with properties:", user);

      res.status(200).json({
        message: "Success",
        data: user.properties,
      });
      return;

    } catch (error: any) {
      console.error("Error getting property details:", error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  }


  async getDetailCategory(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      // Cari user berdasarkan email dan ambil hanya category dari properties
      const user = await prisma.user.findUnique({
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

    } catch (error: any) {
      console.error("Error getting property details:", error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  }

  async getDetailRoom(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Validasi minimal
      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      // Cari user berdasarkan email dan ambil properties beserta rooms
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          properties: {
            include: {
              rooms: {
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
    } catch (error: any) {
      console.error("Error getting room details:", error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  }



  // ✅ Fungsi untuk mengambil semua kategori properti
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.propertyCategory.findMany();

      res.status(200).json({
        message: "Success",
        data: categories,
      });
      return;
    } catch (error: any) {
      console.error("Error fetching property categories:", error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  }

  async getRoomFacilities(req: Request, res: Response) {
    try {
      const RoomFacilities = await prisma.roomFacilities.findMany();

      res.status(200).json({
        message: "Success",
        data: RoomFacilities,
      });
      return;
    } catch (error: any) {
      console.error("Error fetching room facilities:", error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  }  


  async getRoomTypes(req: Request, res: Response) {
    try {
      // Ambil semua value enum dari RoomType
      const roomTypes = Object.values(RoomType);

      res.status(200).json({
        message: "Success",
        data: roomTypes,
      });
      return;
    } catch (error: any) {
      console.error("Error fetching room types:", error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  }  

  // ✅ Fungsi untuk update atau buat properti berdasarkan email
  async updateDetails(req: Request, res: Response) {
    try {
      const {
        email,
        name,
        categoryId,
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
      } = req.body;

      console.log("Body: ", req.body);
      
      // Validasi minimal
      if (!email || !name || !categoryId) {
        res
          .status(400)
          .json({ message: "Email, name, and categoryId are required" });
        return;
      }

      // Cari user berdasarkan email
      const user = await prisma.user.findUnique({
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
        resultProperty = await prisma.property.update({
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
      } else {
        // Create properti baru
        resultProperty = await prisma.property.create({
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
    } catch (error: any) {
      console.error("Error updating/creating property details:", error);
      res.status(500).json({ message: "Internal server error" });
    }

  }



  async updateDetailCategory(req: Request, res: Response) {
    try {
      const { email, categoryId } = req.body;

      // Validasi minimal
      if (!email || !categoryId) {
        res.status(400).json({ message: "Email and categoryId are required" });
        return;
      }

      // Cari user berdasarkan email
      const user = await prisma.user.findUnique({
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
        resultProperty = await prisma.property.update({
          where: { id: property.id },
          data: {
            category: {
              connect: { id: categoryId },
            },
          },
          include: { category: true }, // supaya respon bawa info category
        });

        console.log("Property category updated:", resultProperty);
      } else {
        // Jika property belum ada → buat baru minimal dengan category
        resultProperty = await prisma.property.create({
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
    } catch (error: any) {
      console.error("Error updating property category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }


  async addRoom(req: Request, res: Response) {
    try {
      const { email, name, description, price, number_of_rooms, type } = req.body;

      // cari user tenant berdasarkan email
      const user = await prisma.user.findUnique({
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
      let uploadedUrls: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files as Express.Multer.File[]) {
          const b64 = Buffer.from(file.buffer).toString("base64");
          const dataURI = `data:${file.mimetype};base64,${b64}`;
          const uploadRes = await cloudinary.uploader.upload(dataURI, {
            folder: "rooms",
          });
          uploadedUrls.push(uploadRes.secure_url);
        }
      }

      // --- Simpan ke DB ---
      const room = await prisma.room.create({
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
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(500).json({ message: "Error creating room", error });
    }
  };

//  async addRoom(req: Request, res: Response) {
//     try {

//       const { email, name, description, price, number_of_rooms, type, images } = req.body;

//         // Cari user tenant berdasarkan email
//         const user = await prisma.user.findUnique({
//           where: { email },
//           include: { properties: true }, // ambil semua properti yang dimiliki user ini
//         });

//         if (!user) {
//           res.status(404).json({ message: "User not found" });
//           return;
//         }

//         if (user.properties.length === 0) {
//           res.status(400).json({ message: "No property found for this tenant" });
//           return;
//         }

//         // Ambil propertyId (misalnya property pertama user ini)
//         const propertyId = user.properties[0].id;

//         // Buat room baru
//         const room = await prisma.room.create({
//           data: {
//             name,
//             description,
//             price,
//             number_of_rooms,
//             type,
//             propertyId,
//             images: {
//               create: images?.map((url: string) => ({ url })) || []
//             }
//           },
//           include: { images: true, property: true }
//         });

//         res.status(201).json({
//           message: "Room created successfully",
//           room,
//         });
        
//         return;


//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Error creating room", error });
//       return;
//     }
//   };

}
