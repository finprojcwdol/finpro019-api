import { AuthType, Gender, OrderStatus, PrismaClient, RateType, Role } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // 1️⃣ Property Categories
  const propertyCategories = [
    {
      name: 'Hotel',
      description:
        'Accommodations for travelers often with restaurants, meeting rooms and other guest services',
    },
    {
      name: 'Guesthouse',
      description:
        'Private home with separate living facilities for host and guest',
    },
    {
      name: 'Bed and breakfast',
      description:
        'Private home offering overnight stays and breakfast',
    },
    {
      name: 'Homestay',
      description:
        'Private home with shared living facilities for host and guest',
    },
    {
      name: 'Hostel',
      description:
        'Budget accommodations with mostly dorm-style beds and social atmosphere',
    },
    {
      name: 'Condo hotel',
      description:
        'Independent apartments with some hotel facilities like a front desk',
    },
    {
      name: 'Capsule Hotel',
      description:
        'Extremely small units or capsules offering cheap and basic overnight accommodations',
    },
    {
      name: 'Country House',
      description:
        'Private home in the countryside with simple accommodations',
    },
  ];

  const createdCategories = await Promise.all(
    propertyCategories.map((cat) =>
      prisma.propertyCategory.create({ data: cat })
    )
  );

  const categoryHotel = createdCategories.find((cat) => cat.name === 'Hotel');
  if (!categoryHotel) throw new Error("Category 'Hotel' not found in seeding!");

  // 2️⃣ Users
  const tenant = await prisma.user.create({
    data: {
      username: "Dian CK",
      email: "dianck2002@gmail.com",
      password: "hashedpassword",
      role: Role.TENANT,
      gender: Gender.MALE,
      auth_type: AuthType.GOOGLE,
      isVerified: true,
    },
  });

  const user = await prisma.user.create({
    data: {
      username: "user01",
      email: "user01@example.com",
      password: "hashedpassword",
      role: Role.USER,
      gender: Gender.FEMALE,
      auth_type: AuthType.CREDENTIAL,
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
      number_of_rooms: 10,
    },
  });

  const room2 = await prisma.room.create({
    data: {
      name: "Suite Room",
      description: "Luxury suite with private pool",
      price: 1500000,
      propertyId: property.id,
      number_of_rooms: 5,
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
      type: RateType.PERCENTAGE,
      price: 20,
    },
  });

  // 7️⃣ Orders
  const order = await prisma.order.create({
    data: {
      propertyId: property.id,
      status: OrderStatus.CONFIRMED,
      startDate: new Date("2025-08-12"),
      endDate: new Date("2025-08-14"),
      totalAmount: 1500000,
      userId: user.id,
      items: {
        create: [
          { roomId: room1.id, price: 750000 },
          { roomId: room1.id, price: 750000 },
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

  // 1️⃣1️⃣ Room Facilities
  const facilities = [
    "Clothes rack",
    "Flat-screen TV",
    "Air conditioning",
    "Linens",
    "Desk",
    "Wake-up service",
    "Towels",
    "Wardrobe or closet",
    "Heating",
    "Fan",
    "Safe",
    "Towels/Sheets (extra fee)",
    "Entire unit located on ground floor",
  ];

  const createdFacilities = await prisma.roomFacilities.createMany({
    data: facilities.map((name) => ({ name })),
    skipDuplicates: true,
  });

  // ambil ulang semua fasilitas
  const allFacilities = await prisma.roomFacilities.findMany();

  // connect beberapa fasilitas ke room1 dan room2
  await prisma.room.update({
    where: { id: room1.id },
    data: {
      facilities: {
        connect: allFacilities
          .filter((f) =>
            ["Clothes rack", "Flat-screen TV", "Air conditioning", "Linens", "Desk"].includes(f.name)
          )
          .map((f) => ({ id: f.id })),
      },
    },
  });

  await prisma.room.update({
    where: { id: room2.id },
    data: {
      facilities: {
        connect: allFacilities
          .filter((f) =>
            ["Wake-up service", "Towels", "Wardrobe or closet", "Safe", "Fan"].includes(f.name)
          )
          .map((f) => ({ id: f.id })),
      },
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
