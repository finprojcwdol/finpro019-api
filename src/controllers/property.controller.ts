import { Request, Response } from "express";
import prisma from "../prisma";

const isDebug = process.env.DEBUG === "true";
function logDebug(message: string, ...optionalParams: any[]) {
  if (isDebug) {
    console.log("[DEBUG]", message, ...optionalParams);
  }
}

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


  // async updateDetails(req: Request, res: Response) {
  //   try {

  //     console.log("Body: ", req.body);

  //     const { email, name, categoryId } = req.body;

  //     console.log("Email: ", email);
  //     console.log("name: ", name);
  //     console.log("category_id: ", categoryId);

  //     if (!email || !name || !categoryId) {
  //       res.status(400).json({ message: "Email, name, and category_id are required" });
  //       return;
  //     }



  //     // Cari user
  //     const user = await prisma.user.findUnique({
  //       where: { email },
  //       include: { properties: true },
  //     });

  //     if (!user) {
  //       res.status(404).json({ message: "User not found" });
  //       return;
  //     }

  //     const property = user.properties[0];
  //     let resultProperty;

  //     if (property) {
  //       // Jika properti sudah ada → update
  //       resultProperty = await prisma.property.update({
  //         where: { id: property.id },
  //         data: {
  //           name,
  //           category: {
  //             connect: { id: categoryId },
  //           },
  //         },
  //       });


  //       logDebug("Property updated:", resultProperty);
  //     } else {
  //       // Jika belum ada properti → buat baru
  //       resultProperty = await prisma.property.create({
  //         data: {
  //           name,
  //           description: "", // default kosong atau isi dari req.body jika ada
  //           location: "",     // default kosong atau isi dari req.body jika ada
  //           long: "",          // default 0 atau isi dari req.body jika ada
  //           lot: "",         // default 0 atau isi dari req.body jika ada
  //           tenant: {
  //             connect: { id: user.id },
  //           },
  //           category: {
  //             connect: { id: categoryId },
  //           },
  //         },
  //       });


  //       logDebug("Property created:", resultProperty);
  //     }

  //     logDebug("Category ID:", categoryId);

  //     res.status(200).json({
  //       message: property ? "Property updated successfully" : "Property created successfully",
  //       data: resultProperty,
  //     });

  //   } catch (error: any) {
  //     console.error("Error updating/creating property details:", error);
  //     res.status(500).json({ message: "Internal server error" });
  //   }
  // }



}
