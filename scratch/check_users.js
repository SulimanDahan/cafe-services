const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const encryptPassword = require('./src/helpers/encrypters');

async function check() {
    try {
        const users = await prisma.user.findMany();
        console.log('Users in database:', users.map(u => ({ id: u.id, username: u.username, is_admin: u.is_admin })));
        
        const admin = await prisma.user.findFirst({ where: { username: 'admin' } });
        if (admin) {
            console.log('Admin user found.');
            // Check if password matches admin123
            const admin123Hash = encryptPassword('admin123');
            console.log('admin123 hash:', admin123Hash);
            console.log('Stored hash:', admin.password);
            if (admin.password === admin123Hash) {
                console.log('Password matches admin123!');
            } else {
                console.log('Password DOES NOT match admin123.');
            }
        } else {
            console.log('Admin user NOT found.');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
