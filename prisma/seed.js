"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { PrismaClient, Role, Gender, AuthType, OrderStatus, RateType } from "@prisma/client";
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
async function main() {
    console.log("🌱 Starting seed...");
    // 1️⃣ Property Categories
    const categoryHotel = await prisma.propertyCategory.create({
        data: { name: "Hotel" },
    });
    const categoryVilla = await prisma.propertyCategory.create({
        data: { name: "Villa" },
    });
    // 2️⃣ Users
    const tenant = await prisma.user.create({
        data: {
            username: "Dian CK",
            email: "dianck2002@gmail.com",
            password: "hashedpassword", // sebaiknya hash sungguhan
            role: prisma_1.Role.TENANT,
            gender: prisma_1.Gender.MALE,
            auth_type: prisma_1.AuthType.GOOGLE,
            isVerified: true,
        },
    });
    const user = await prisma.user.create({
        data: {
            username: "user01",
            email: "user01@example.com",
            password: "hashedpassword",
            role: prisma_1.Role.USER,
            gender: prisma_1.Gender.FEMALE,
            auth_type: prisma_1.AuthType.CREDENTIAL,
            isVerified: true,
        },
    });
    // 3️⃣ Property
    const property = await prisma.property.create({
        data: {
            name: "Sunrise Hotel",
            description: "A beautiful hotel with sea view",
            location: "Bali",
            long: "115.216667",
            lot: "-8.65",
            picture: "https://example.com/image.jpg",
            categoryId: categoryHotel.id,
            country: "Indonesia",
            phone_country: "+62",
            phone_number: "81234567890",
            pic_first_name: "John",
            pic_last_name: "Doe",
            pic_email: "manager@sunrisehotel.com",
            pic_position: "Manager",
            pic_country_code: "+62",
            pic_phone_number: "81234567890",
            tenantId: tenant.id,
        },
    });
    // 4️⃣ Rooms
    const room1 = await prisma.room.create({
        data: {
            name: "Deluxe Room",
            description: "Spacious room with balcony",
            price: 750000,
            propertyId: property.id,
        },
    });
    const room2 = await prisma.room.create({
        data: {
            name: "Suite Room",
            description: "Luxury suite with private pool",
            price: 1500000,
            propertyId: property.id,
        },
    });
    // 5️⃣ Room Availability
    await prisma.roomAvailability.createMany({
        data: [
            {
                roomId: room1.id,
                date: new Date("2025-08-10"),
                isAvailable: true,
            },
            {
                roomId: room2.id,
                date: new Date("2025-08-10"),
                isAvailable: true,
            },
        ],
    });
    // 6️⃣ Peak Rates
    await prisma.peakRate.create({
        data: {
            roomId: room1.id,
            date: new Date("2025-08-15"),
            type: prisma_1.RateType.PERCENTAGE,
            price: 20, // berarti +20%
        },
    });
    // 7️⃣ Orders
    const order = await prisma.order.create({
        data: {
            propertyId: property.id,
            status: prisma_1.OrderStatus.CONFIRMED,
            startDate: new Date("2025-08-12"),
            endDate: new Date("2025-08-14"),
            totalAmount: 1500000,
            userId: user.id,
            items: {
                create: [
                    {
                        roomId: room1.id,
                        price: 750000,
                    },
                    {
                        roomId: room1.id,
                        price: 750000,
                    },
                ],
            },
        },
    });
    // 8️⃣ Reviews
    const review = await prisma.review.create({
        data: {
            propertyId: property.id,
            comment: "Great stay! Clean and comfortable.",
            userId: user.id,
        },
    });
    // 9️⃣ Review Reply
    await prisma.reviewReply.create({
        data: {
            reviewId: review.id,
            comment: "Thank you for your feedback!",
        },
    });
    // 🔟 Sales Report
    await prisma.salesReport.create({
        data: {
            tenantId: tenant.id,
            totalIncome: 5000000,
            fromDate: new Date("2025-07-01"),
            toDate: new Date("2025-07-31"),
        },
    });
    console.log("✅ Seed data created successfully!");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
