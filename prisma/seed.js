import prisma from '../src/lib/prisma.js';

async function main() {
  console.log(' Starting database seeding...');

  // 1. Buat User Dummy Pertama
  const user = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedpassword123', // Nanti bisa diganti dengan bcrypt/argon2
      jobs: {
        create: [
          {
            company: 'PT Teknologi Bangsa',
            position: 'Backend Developer (Express.js)',
            status: 'APPLIED',
            location: 'Jakarta (Hybrid)',
            salary: 'Rp 10.000.000',
            notes: 'Melamar via LinkedIn pada tanggal 20 September.'
          },
          {
            company: 'Maju Digital Inc',
            position: 'Fullstack Engineer',
            status: 'INTERVIEW',
            location: 'Bandung (Remote)',
            salary: 'Rp 12.000.000',
            notes: 'Jadwal user interview hari Selasa jam 10.00 WIB.'
          }
        ]
      }
    }
  });

  console.log('Created User:', user.name, `(ID: ${user.id})`);
  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(' Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
  });