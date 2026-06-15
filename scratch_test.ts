import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
    console.log("Fetching rooms...");
    const rooms = await prisma.room.findMany();
    console.log("Rooms count:", rooms.length);
    console.log(JSON.stringify(rooms, null, 2));

    console.log("\nFetching reservations...");
    const reservations = await prisma.reservation.findMany();
    console.log("Reservations count:", reservations.length);
    console.log(JSON.stringify(reservations, null, 2));

    console.log("\nFetching settings...");
    const settings = await prisma.settings.findFirst();
    console.log("Settings:", JSON.stringify(settings, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
