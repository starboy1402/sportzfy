import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Sportzfy database...");

  // Clean existing data
  await prisma.joinRequest.deleteMany({});
  await prisma.matchPost.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.paymentAttempt.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.hold.deleteMany({});
  await prisma.blockedInterval.deleteMany({});
  await prisma.availabilityRule.deleteMany({});
  await prisma.turfImage.deleteMany({});
  await prisma.turf.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultHashedPassword = await bcrypt.hash("sportzfy123", 10);

  // 1. Create Users
  const player = await prisma.user.create({
    data: {
      email: "player@sportzfy.com",
      name: "Sakib Alif",
      phone: "+8801812345678",
      password: defaultHashedPassword,
      role: "CUSTOMER",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      profile: {
        create: {
          bio: "Weekend 7v7 midfielder & captain. Love fast-paced artificial grass games.",
          preferredFormat: "7v7",
          favoritePosition: "Midfielder",
          preferredCity: "Chattogram",
        },
      },
    },
  });

  const owner = await prisma.user.create({
    data: {
      email: "owner@sportzfy.com",
      name: "Tariqul Islam (Eco Sports)",
      phone: "+8801711223344",
      password: defaultHashedPassword,
      role: "OWNER",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@sportzfy.com",
      name: "Sportzfy Administrator",
      phone: "+8801999887766",
      password: defaultHashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✓ Created Users (Player, Owner, Admin)");

  // 2. Create Real Turfs across Chattogram and Dhaka
  const turfsData = [
    {
      ownerId: owner.id,
      name: "Eco Sports Halishahar Arena",
      slug: "eco-sports-halishahar",
      city: "Chattogram",
      area: "Halishahar",
      address: "Road 3, Block G, Halishahar Housing Estate, Chattogram",
      description: "Premier FIFA-grade artificial turf with high-intensity LED floodlights, spacious spectator seating, and clean dressing rooms. Perfect for 6v6 and 7v7 evening matches.",
      pitchFormats: "6v6, 7v7",
      basePricePerHour: 1400,
      rating: 4.9,
      reviewCount: 42,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: true,
      hasWater: true,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Pitch under night floodlights" },
          { url: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&auto=format&fit=crop&q=80", order: 2, caption: "Goalpost view & lush grass" },
        ],
      },
    },
    {
      ownerId: owner.id,
      name: "Apollo Turf Club Kazir Dewri",
      slug: "apollo-turf-kazir-dewri",
      city: "Chattogram",
      area: "Kazir Dewri",
      address: "Near Stadium Gate 2, Kazir Dewri, Chattogram",
      description: "Centrally located turf right next to MA Aziz Stadium. High-rebound imported turf, ideal for competitive 6v6 matches and quick corporate games.",
      pitchFormats: "6v6",
      basePricePerHour: 1200,
      rating: 4.7,
      reviewCount: 28,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: false,
      hasParking: true,
      hasWater: true,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Full field view" },
        ],
      },
    },
    {
      ownerId: owner.id,
      name: "Chandgaon Futsal & Turf Zone",
      slug: "chandgaon-futsal-zone",
      city: "Chattogram",
      area: "Chandgaon",
      address: "Behind Bahaddarhat Bus Terminal, Chandgaon R/A, Chattogram",
      description: "Dual-pitch sports complex with one enclosed 5v5 futsal court and one large 7v7 outdoor artificial field. Features backup generators so night games are never interrupted.",
      pitchFormats: "5v5, 7v7",
      basePricePerHour: 1300,
      rating: 4.8,
      reviewCount: 35,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: true,
      hasWater: true,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Side touchline view" },
        ],
      },
    },
    {
      ownerId: owner.id,
      name: "Khulshi Arena Sports Ground",
      slug: "khulshi-arena-sports",
      city: "Chattogram",
      area: "Khulshi",
      address: "Zakir Hossain Road, South Khulshi, Chattogram",
      description: "Boutique, quiet rooftop turf surrounded by scenic hill greenery. Great ventilation, premium synthetic grass, and cold energy drinks counter.",
      pitchFormats: "5v5, 6v6",
      basePricePerHour: 1500,
      rating: 4.9,
      reviewCount: 19,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: true,
      hasWater: true,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Dusk match atmosphere" },
        ],
      },
    },
    {
      ownerId: owner.id,
      name: "Dhanmondi Champions Turf",
      slug: "dhanmondi-champions-turf",
      city: "Dhaka",
      area: "Dhanmondi",
      address: "Satmasjid Road, Dhanmondi 9/A, Dhaka",
      description: "Popular central Dhaka rooftop pitch with stunning city views, shock-pad turf foundation for joint protection, and professional coaching gear.",
      pitchFormats: "5v5, 6v6",
      basePricePerHour: 1600,
      rating: 4.8,
      reviewCount: 56,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: true,
      hasWater: true,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Floodlights on" },
        ],
      },
    },
    {
      ownerId: owner.id,
      name: "Bashundhara Sports Hub",
      slug: "bashundhara-sports-hub",
      city: "Dhaka",
      area: "Bashundhara",
      address: "Block I, 300 Feet Road, Bashundhara R/A, Dhaka",
      description: "Huge tournament-ready multi-pitch complex accommodating simultaneous 7v7 matches with official electronic scoreboards and player dugouts.",
      pitchFormats: "7v7",
      basePricePerHour: 1800,
      rating: 5.0,
      reviewCount: 64,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: true,
      hasWater: true,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Main tournament pitch" },
        ],
      },
    },
  ];

  const createdTurfs = [];
  for (const t of turfsData) {
    const created = await prisma.turf.create({ data: t });
    createdTurfs.push(created);
  }
  console.log(`✓ Seeded ${createdTurfs.length} Turfs across Chattogram & Dhaka`);

  // 3. Create a sample verified review
  const firstTurf = createdTurfs[0];
  await prisma.review.create({
    data: {
      turfId: firstTurf.id,
      userId: player.id,
      rating: 5,
      comment: "Best turf in Halishahar! The new LED lights make night games incredible, and the ball roll is super consistent.",
    },
  });

  // 4. Create sample Community Matchmaking Post (Directly inspired by Facebook screenshots!)
  const matchDate = new Date();
  matchDate.setHours(20, 0, 0, 0); // 8:00 PM tonight

  await prisma.matchPost.create({
    data: {
      turfId: createdTurfs[2].id, // Chandgaon
      hostUserId: player.id,
      title: "Need 1 Solid Goalkeeper for 7v7 Match Tonight!",
      description: "We booked Chandgaon Turf for 8 PM - 9:30 PM tonight. Our regular GK got injured. Looking for a dependable shot-stopper. Friendly, competitive vibe!",
      sportFormat: "7v7",
      matchTime: matchDate,
      area: "Chandgaon, Chattogram",
      totalSpots: 14,
      openSpots: 1,
      costPerPlayer: 150,
      requiredRole: "Goalkeeper",
      status: "OPEN",
    },
  });

  await prisma.matchPost.create({
    data: {
      turfId: firstTurf.id, // Halishahar
      hostUserId: player.id,
      title: "Dominatrix FC vs Amateur Rival Challenge (7v7)",
      description: "Looking for a rival amateur team to play an intense 90-minute friendly match. 50/50 turf cost split.",
      sportFormat: "7v7",
      matchTime: new Date(Date.now() + 86400000), // Tomorrow night
      area: "Halishahar, Chattogram",
      totalSpots: 14,
      openSpots: 7,
      costPerPlayer: 200,
      requiredRole: "Any",
      status: "OPEN",
    },
  });

  console.log("✓ Seeded Open Matchmaking Posts & Reviews");
  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
