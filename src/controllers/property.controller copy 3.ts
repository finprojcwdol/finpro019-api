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
      const { email, name, category_id } = req.body;


      if (!email || !name || !category_id) {
        res.status(400).json({ message: "Email, name, and category_id are required" });
        return;
      }



      // Cari user
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
        // Jika properti sudah ada → update
        resultProperty = await prisma.property.update({
          where: { id: property.id },
          data: {
            name,
            category: {
              connect: { id: category_id },
            },
          },
        });


        logDebug("Property updated:", resultProperty);
      } else {
        // Jika belum ada properti → buat baru
        resultProperty = await prisma.property.create({
          data: {
            name,
            description: "", // default kosong atau isi dari req.body jika ada
            location: "",     // default kosong atau isi dari req.body jika ada
            long: "",          // default 0 atau isi dari req.body jika ada
            lot: "",         // default 0 atau isi dari req.body jika ada
            tenant: {
              connect: { id: user.id },
            },
            category: {
              connect: { id: category_id },
            },
          },
        });


        logDebug("Property created:", resultProperty);
      }

      logDebug("Category ID:", category_id);

      res.status(200).json({
        message: property ? "Property updated successfully" : "Property created successfully",
        data: resultProperty,
      });

    } catch (error: any) {
      console.error("Error updating/creating property details:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }



}
