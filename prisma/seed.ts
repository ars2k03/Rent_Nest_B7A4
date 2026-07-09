import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for seeding");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.rentalRequest.deleteMany();
  await prisma.property.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  const landlordPassword = await bcrypt.hash("Landlord@12345", 10);
  const tenantPassword = await bcrypt.hash("Tenant@12345", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Platform Admin",
      email: "admin@rentnest.com",
      password: adminPassword,
      role: "ADMIN",
      phone: "+8801000000001",
    },
  });

  const landlord = await prisma.user.create({
    data: {
      name: "John Landlord",
      email: "landlord@rentnest.com",
      password: landlordPassword,
      role: "LANDLORD",
      phone: "+8801000000002",
    },
  });

  const tenant = await prisma.user.create({
    data: {
      name: "Jane Tenant",
      email: "tenant@rentnest.com",
      password: tenantPassword,
      role: "TENANT",
      phone: "+8801000000003",
    },
  });

  const categories = await prisma.category.createMany({
    data: [
      { name: "Apartment", description: "Multi-unit residential buildings" },
      { name: "House", description: "Standalone family homes" },
      { name: "Studio", description: "Compact single-room units" },
    ],
  });

  const categoryList = await prisma.category.findMany();

  const apartmentCategory = categoryList.find((item) => item.name === "Apartment");
  const houseCategory = categoryList.find((item) => item.name === "House");

  if (!apartmentCategory || !houseCategory) {
    throw new Error("Failed to seed categories");
  }

  const properties = await prisma.property.createMany({
    data: [
      {
        title: "Modern Downtown Apartment",
        description: "A bright 2-bedroom apartment in the city center with great amenities.",
        location: "Dhaka, Bangladesh",
        price: 1200,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ["wifi", "parking", "gym"],
        landlordId: landlord.id,
        categoryId: apartmentCategory.id,
      },
      {
        title: "Cozy Suburban House",
        description: "Family-friendly house with garden and quiet neighborhood.",
        location: "Chittagong, Bangladesh",
        price: 900,
        bedrooms: 3,
        bathrooms: 2,
        amenities: ["garden", "parking"],
        landlordId: landlord.id,
        categoryId: houseCategory.id,
      },
    ],
  });

  const propertyList = await prisma.property.findMany();
  const downtownApartment = propertyList[0];

  if (!downtownApartment) {
    throw new Error("Failed to seed properties");
  }

  const approvedRental = await prisma.rentalRequest.create({
    data: {
      tenantId: tenant.id,
      propertyId: downtownApartment.id,
      moveInDate: new Date("2026-08-01"),
      message: "Looking forward to moving in.",
      status: "COMPLETED",
    },
  });

  await prisma.review.create({
    data: {
      tenantId: tenant.id,
      propertyId: downtownApartment.id,
      rating: 5,
      comment: "Great location and responsive landlord.",
    },
  });

  const activeRental = await prisma.rentalRequest.create({
    data: {
      tenantId: tenant.id,
      propertyId: propertyList[1]?.id || downtownApartment.id,
      moveInDate: new Date("2026-09-01"),
      status: "ACTIVE",
    },
  });

  await prisma.payment.create({
    data: {
      amount: downtownApartment.price,
      method: "card",
      transactionId: "seed-stripe-payment-001",
      provider: "STRIPE",
      status: "COMPLETED",
      paidAt: new Date(),
      rentalRequestId: activeRental.id,
    },
  });

  console.log("Seed completed successfully");
  console.log({
    admin: { email: admin.email, password: "Admin@12345" },
    landlord: { email: landlord.email, password: "Landlord@12345" },
    tenant: { email: tenant.email, password: "Tenant@12345" },
    categoriesCreated: categories.count,
    propertiesCreated: properties.count,
    sampleRentalId: approvedRental.id,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
