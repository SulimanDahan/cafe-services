import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import encryptPassword from "../src/helpers/encrypters";

async function check() {
    try {
        const users = await prisma.user.findMany();
        console.log('--- DATABASE USERS ---');
        users.forEach(u => {
            console.log(`ID: ${u.id} | Username: ${u.username} | IsAdmin: ${u.is_admin}`);
        });
        
        const admin = await prisma.user.findFirst({ where: { username: 'admin' } });
        if (admin) {
            const admin123Hash = encryptPassword('admin123');
            console.log('\n--- ADMIN PASSWORD CHECK ---');
            console.log('Target: admin123');
            console.log('Target Hash:', admin123Hash);
            console.log('Stored Hash:', admin.password);
            if (admin.password === admin123Hash) {
                console.log('>> MATCH SUCCESSFUL <<');
            } else {
                console.log('>> MATCH FAILED <<');
            }
        } else {
            console.log('\n[ERROR] Admin user not found in database.');
        }
    } catch (e) {
        console.error('Error querying database:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
