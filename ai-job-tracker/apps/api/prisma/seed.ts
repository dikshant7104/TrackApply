import { PrismaClient, UserRole, ApplicationStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await argon2.hash('Admin123!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isEmailVerified: true,
    },
  });

  // Create demo user
  const userPassword = await argon2.hash('Demo123!');
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: userPassword,
      firstName: 'Demo',
      lastName: 'User',
      role: UserRole.USER,
      isEmailVerified: true,
    },
  });

  // Create sample applications
  const sampleApps = [
    {
      company: 'Google',
      jobTitle: 'Senior Software Engineer',
      status: ApplicationStatus.INTERVIEW,
      salary: '$180,000 - $220,000',
      location: 'Mountain View, CA',
      jobUrl: 'https://careers.google.com',
      notes: 'Applied through referral from John',
      appliedAt: new Date('2024-01-15'),
      interviewAt: new Date('2024-02-01'),
    },
    {
      company: 'Stripe',
      jobTitle: 'Full Stack Engineer',
      status: ApplicationStatus.TECHNICAL_TEST,
      salary: '$160,000 - $200,000',
      location: 'Remote',
      jobUrl: 'https://stripe.com/jobs',
      notes: 'Great company culture',
      appliedAt: new Date('2024-01-20'),
    },
    {
      company: 'Vercel',
      jobTitle: 'Frontend Engineer',
      status: ApplicationStatus.APPLIED,
      salary: '$140,000 - $170,000',
      location: 'Remote',
      jobUrl: 'https://vercel.com/careers',
      appliedAt: new Date('2024-01-22'),
    },
    {
      company: 'Linear',
      jobTitle: 'Product Engineer',
      status: ApplicationStatus.OFFER,
      salary: '$150,000 - $190,000',
      location: 'San Francisco, CA',
      jobUrl: 'https://linear.app/careers',
      notes: 'Offer received! Negotiating salary.',
      appliedAt: new Date('2024-01-10'),
    },
    {
      company: 'Netflix',
      jobTitle: 'Senior Backend Engineer',
      status: ApplicationStatus.REJECTED,
      salary: '$200,000+',
      location: 'Los Angeles, CA',
      jobUrl: 'https://jobs.netflix.com',
      notes: 'Rejected after 3rd round technical interview',
      appliedAt: new Date('2024-01-05'),
    },
    {
      company: 'Anthropic',
      jobTitle: 'ML Engineer',
      status: ApplicationStatus.SAVED,
      salary: '$200,000 - $300,000',
      location: 'San Francisco, CA',
      jobUrl: 'https://anthropic.com/careers',
      notes: 'Need to tailor resume before applying',
    },
  ];

  for (const app of sampleApps) {
    await prisma.jobApplication.create({
      data: {
        ...app,
        userId: demoUser.id,
      },
    });
  }

  console.log('✅ Seed complete!');
  console.log('👤 Admin:', admin.email);
  console.log('👤 Demo user:', demoUser.email, '/ Demo123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
