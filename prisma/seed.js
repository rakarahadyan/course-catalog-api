const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  
  const admin = await prisma.users.upsert({
    where: { email: 'admin@course.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@course.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });
  console.log('Admin created:', admin.email);

  const webDev = await prisma.topics.create({
    data: {
      name: 'Web Development',
      description: 'Learn web development technologies'
    }
  });
  
  const mobileDev = await prisma.topics.create({
    data: {
      name: 'Mobile Development',
      description: 'Learn mobile app development'
    }
  });
  
  const dataScience = await prisma.topics.create({
    data: {
      name: 'Data Science',
      description: 'Learn data science and analytics'
    }
  });
  console.log('Topics created');

  await prisma.languages.createMany({
    data: [
      { name: 'Indonesian' },
      { name: 'English' },
      { name: 'Japanese' }
    ]
  });
  console.log('Languages created');

  await prisma.courses.create({
    data: {
      topic_id: webDev.id,
      language_id: 1,
      created_by_id: admin.id,
      title: 'Belajar Node.js dari Nol',
      description: 'Kursus lengkap untuk mempelajari Node.js dari dasar hingga mahir.',
      short_description: 'Kursus Node.js lengkap untuk pemula',
      price: 299000,
      discount_rate: 20,
      thumbnail_url: 'https://example.com/nodejs-thumbnail.jpg',
      level: 'BEGINNER'
    }
  });

  await prisma.courses.create({
    data: {
      topic_id: webDev.id,
      language_id: 2,
      created_by_id: admin.id,
      title: 'Advanced React Patterns',
      description: 'Deep dive into advanced React patterns.',
      short_description: 'Advanced React course',
      price: 499000,
      discount_rate: 10,
      thumbnail_url: 'https://example.com/react-advanced.jpg',
      level: 'ADVANCE'
    }
  });

  await prisma.courses.create({
    data: {
      topic_id: mobileDev.id,
      language_id: 1,
      created_by_id: admin.id,
      title: 'Flutter untuk Pemula',
      description: 'Pelajari cara membuat aplikasi mobile cross-platform menggunakan Flutter.',
      short_description: 'Kursus Flutter dasar',
      price: 349000,
      discount_rate: 15,
      thumbnail_url: 'https://example.com/flutter.jpg',
      level: 'ALL_LEVEL'
    }
  });
  console.log('Courses created');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });