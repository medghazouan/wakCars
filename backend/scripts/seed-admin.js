/**
 * Seed script — regenerate valid bcrypt hashes for all admin accounts.
 * Run:  node scripts/seed-admin.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const admins = [
  { id: 1, email: 'rachid@wakcars.ma', password: 'Admin@2026!' },
  { id: 2, email: 'nadia@wakcars.ma',  password: 'Staff@2026!' },
  { id: 3, email: 'omar@wakcars.ma',   password: 'Staff@2026!' },
];

async function main() {
  for (const admin of admins) {
    const hash = await bcrypt.hash(admin.password, 12);
    await prisma.admins.update({
      where: { id: admin.id },
      data: { password_hash: hash },
    });
    console.log(`Updated ${admin.email} (id=${admin.id}) with valid bcrypt hash`);
  }
  console.log('\nAll admin passwords updated successfully.');
  console.log('Login credentials:');
  console.log('  ADMIN  —  rachid@wakcars.ma  /  Admin@2026!');
  console.log('  STAFF  —  nadia@wakcars.ma   /  Staff@2026!');
  console.log('  STAFF  —  omar@wakcars.ma    /  Staff@2026!');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
