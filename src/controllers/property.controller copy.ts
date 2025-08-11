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
}



/*

curl -X POST http://localhost:3000/api/property/details \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer AsdQweZxc" \
  -d '{"email": "dianck2002@gmail.com"}'

curl -X POST http://localhost:8000/api/property/details \
  -H "Authorization: Bearer AsdQweZxc" \
  -H "Content-Type: application/json" \
  -d '{"email":"dianck2002@gmail.com"}'

curl -X POST http://localhost:8000/api/property/details \
  -H "Authorization: Bearer AsdQweZxc" \
  -H "Content-Type: application/json" \
  -d '{"email":"tenant@example.com"}'

curl -X POST http://localhost:8000/api/property/details \
  -H "Authorization: Bearer AsdQweZxc" \
  -H "Content-Type: application/json" \
  -d '{"email":"dianck2002@gmail.com"}'
*/