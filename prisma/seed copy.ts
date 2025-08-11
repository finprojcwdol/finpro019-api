import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Buat user tenant
  const tenant = await prisma.user.create({
    data: {
      username: 'tenantuser',
      email: 'tenant@example.com',
      password: 'hashedpassword123', // password sebaiknya sudah di-hash
      role: 'TENANT',
      auth_type: 'CREDENTIAL',
      gender: 'MALE',
      birthdate: new Date('1990-01-01'),
      mobile_number: '08123456789',
      residence: 'Jakarta',
      isVerified: true,
    },
  });

  // Buat kategori properti
  const category = await prisma.propertyCategory.create({
    data: {
      name: 'Villa',
    },
  });

  // Buat properti
  const property = await prisma.property.create({
    data: {
      name: 'Villa Asri',
      description: 'Villa dengan pemandangan alam yang asri.',
      location: 'Bali',
      long: '115.1889',
      lot: '-8.4095',
      tenantId: tenant.id,
      categoryId: category.id,
      picture: 'https://example.com/villa.jpg',
    },
  });

  // Buat 2 kamar
  const room1 = await prisma.room.create({
    data: {
      name: 'Kamar Utama',
      description: 'Kamar luas dengan tempat tidur king size.',
      price: 500000,
      propertyId: property.id,
    },
  });

  const room2 = await prisma.room.create({
    data: {
      name: 'Kamar Tamu',
      description: 'Kamar nyaman untuk tamu.',
      price: 300000,
      propertyId: property.id,
    },
  });

  // Buat user pelanggan
  const customer = await prisma.user.create({
    data: {
      username: 'johndoe',
      email: 'johndoe@example.com',
      password: 'hashedpassword456',
      role: 'USER',
      auth_type: 'CREDENTIAL',
      gender: 'MALE',
      birthdate: new Date('1995-05-20'),
      mobile_number: '08129876543',
      residence: 'Bandung',
    },
  });

  // Buat order oleh customer
  const order = await prisma.order.create({
    data: {
      userId: customer.id,
      propertyId: property.id,
      status: 'CONFIRMED',
      startDate: new Date('2025-08-10'),
      endDate: new Date('2025-08-15'),
      totalAmount: 800000,
      items: {
        create: [
          {
            roomId: room1.id,
            price: 500000,
          },
          {
            roomId: room2.id,
            price: 300000,
          },
        ],
      },
    },
  });

  // Tambahkan Review
  const review = await prisma.review.create({
    data: {
      userId: customer.id,
      propertyId: property.id,
      comment: 'Sangat nyaman dan bersih!',
    },
  });

  // Tambahkan Balasan Review
  await prisma.reviewReply.create({
    data: {
      reviewId: review.id,
      comment: 'Terima kasih atas ulasannya!',
    },
  });

  // Buat laporan penjualan
  await prisma.salesReport.create({
    data: {
      tenantId: tenant.id,
      totalIncome: 5000000,
      fromDate: new Date('2025-08-01'),
      toDate: new Date('2025-08-31'),
    },
  });

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
