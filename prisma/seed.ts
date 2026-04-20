import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

const prisma = new PrismaClient();

function hashPassword(pw: string) {
  // Placeholder: en Fase 2 usar bcrypt/argon2. Seed solo para bootstrap.
  return crypto.createHash("sha256").update(pw).digest("hex");
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "agenda.monatatt@gmail.com";
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD ?? "cambiame123";

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, password: hashPassword(adminPassword) }
  });

  await prisma.paymentSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      holderName: "Mona Tatt SpA",
      rut: "77.123.456-7",
      bank: "Banco de Chile",
      accountType: "Cuenta Corriente",
      accountNumber: "0012345678",
      contactEmail: adminEmail,
      depositMode: "PERCENTAGE",
      depositPercent: 30
    }
  });

  // Hour matrix demo
  const matrix = [
    { widthMin: 0, widthMax: 5, heightMin: 0, heightMax: 5, hours: 1 },
    { widthMin: 0, widthMax: 8, heightMin: 0, heightMax: 8, hours: 1.5 },
    { widthMin: 0, widthMax: 12, heightMin: 0, heightMax: 12, hours: 2 },
    { widthMin: 0, widthMax: 15, heightMin: 0, heightMax: 20, hours: 3 },
    { widthMin: 0, widthMax: 20, heightMin: 0, heightMax: 25, hours: 4 }
  ];
  await prisma.hourMatrix.deleteMany();
  await prisma.hourMatrix.createMany({ data: matrix });

  // Price table demo
  const prices = [
    { widthCm: 5, heightCm: 5, color: "negro", price: 50_000 },
    { widthCm: 8, heightCm: 8, color: "negro", price: 80_000 },
    { widthCm: 10, heightCm: 10, color: "negro", price: 110_000 },
    { widthCm: 12, heightCm: 15, color: "negro", price: 160_000 },
    { widthCm: 15, heightCm: 20, color: "negro", price: 220_000 },
    { widthCm: 10, heightCm: 10, color: "rojo", price: 130_000 },
    { widthCm: 10, heightCm: 10, color: "blanco", price: 140_000 }
  ];
  await prisma.priceTable.deleteMany();
  await prisma.priceTable.createMany({ data: prices });

  // Sample clients + bookings
  const c1 = await prisma.client.create({
    data: {
      name: "Javiera Rojas",
      email: "javi@example.com",
      age: 27,
      phone: "+56 9 1234 5678",
      gender: "femenino"
    }
  });

  await prisma.booking.create({
    data: {
      clientId: c1.id,
      date: new Date(Date.now() + 2 * 86400000),
      startTime: "11:00",
      endTime: "13:00",
      totalHours: 2,
      totalPrice: 110_000,
      depositAmount: 33_000,
      status: "CONFIRMED",
      depositPaid: true,
      confirmedAt: new Date(),
      confirmedByAdmin: true,
      tattoos: {
        create: {
          description: "Rama de olivo fineline en antebrazo.",
          style: "lineal",
          widthCm: 10,
          heightCm: 10,
          bodyPart: "antebrazo",
          color: "negro",
          price: 110_000,
          referenceImages: []
        }
      }
    }
  });

  console.log("✔ Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
