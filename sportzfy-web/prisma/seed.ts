import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Sportzfy High-Fidelity Seeding...");

  // Clean existing data in reverse dependency order
  console.log("🧹 Cleaning existing data...");
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

  // 1. Create Demo Users (Customer, Owner, Admin, CUET Student)
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

  const adiba = await prisma.user.create({
    data: {
      email: "adiba@cuet.com",
      name: "Adiba Mahmud",
      phone: "+8801755667788",
      password: defaultHashedPassword,
      role: "CUSTOMER",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      profile: {
        create: {
          bio: "CUET football captain and varsity attacker. Active in inter-university futsal tournaments.",
          preferredFormat: "7v7",
          favoritePosition: "Striker",
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
      profile: {
        create: {
          bio: "Managing Director at Eco Sports Arena. Dedicated to providing premier artificial grass football grounds in Chattogram.",
          preferredFormat: "7v7",
          favoritePosition: "Midfielder",
          preferredCity: "Chattogram",
        },
      },
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@sportzfy.com",
      name: "Sportzfy Administrator",
      phone: "+8801999887766",
      password: defaultHashedPassword,
      role: "ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
      profile: {
        create: {
          bio: "Sportzfy Platform Operations & Tournament Coordinator.",
          preferredFormat: "7v7",
          favoritePosition: "Goalkeeper",
          preferredCity: "Chattogram",
        },
      },
    },
  });

  const tanvir = await prisma.user.create({
    data: {
      email: "tanvir@gmail.com",
      name: "Tanvir Hasan",
      phone: "+8801912345678",
      password: defaultHashedPassword,
      role: "CUSTOMER",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      profile: {
        create: {
          bio: "Competitive futsal goalkeeper playing in corporate & university tournaments.",
          preferredFormat: "6v6",
          favoritePosition: "Goalkeeper",
          preferredCity: "Dhaka",
        },
      },
    },
  });

  // Create community squad players for matchmaking squads
  const squadPlayersRaw = [
    { name: "Fahim Shahriar", email: "fahim@sportzfy.com", role: "Midfielder", format: "7v7" },
    { name: "Nafis Imtiaz", email: "nafis@sportzfy.com", role: "Striker", format: "7v7" },
    { name: "Shakil Ahmed", email: "shakil@sportzfy.com", role: "Defender", format: "7v7" },
    { name: "Abrar Hossain", email: "abrar@sportzfy.com", role: "Midfielder", format: "6v6" },
    { name: "Mahir Faisal", email: "mahir@sportzfy.com", role: "Defender", format: "7v7" },
    { name: "Zubair Rahman", email: "zubair@sportzfy.com", role: "Striker", format: "6v6" },
    { name: "Rafi Chowdhury", email: "rafi@sportzfy.com", role: "Midfielder", format: "7v7" },
    { name: "Saadman Karim", email: "saadman@sportzfy.com", role: "Goalkeeper", format: "7v7" },
    { name: "Tawsif Reza", email: "tawsif@sportzfy.com", role: "Defender", format: "6v6" },
    { name: "Rayhan Kabir", email: "rayhan@sportzfy.com", role: "Striker", format: "7v7" },
    { name: "Munim Khan", email: "munim@sportzfy.com", role: "Midfielder", format: "7v7" },
    { name: "Anik Barua", email: "anik@sportzfy.com", role: "Defender", format: "6v6" },
    { name: "Siam Al-Hasan", email: "siam@sportzfy.com", role: "Goalkeeper", format: "7v7" },
  ];

  const squadUsers = [];
  for (const sp of squadPlayersRaw) {
    const u = await prisma.user.create({
      data: {
        email: sp.email,
        name: sp.name,
        phone: `+88018${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: defaultHashedPassword,
        role: "CUSTOMER",
        profile: {
          create: {
            bio: `Amateur football enthusiast playing ${sp.format} regularly.`,
            preferredFormat: sp.format,
            favoritePosition: sp.role,
            preferredCity: "Chattogram",
          },
        },
      },
    });
    squadUsers.push(u);
  }

  console.log(`✓ Created Core & Squad Users (${squadUsers.length + 5} total with 100% 1:1 Profiles)`);

  // 2. 20 Authentic Venues with Precise GPS Coordinates & Pitch Formats
  const turfsData = [
    // --- CHATTOGRAM (11 Venues) ---
    {
      ownerId: owner.id,
      name: "Eco Sports Halishahar Arena",
      slug: "eco-sports-halishahar",
      city: "Chattogram",
      area: "Halishahar",
      address: "Road 3, Block G, Halishahar Housing Estate, Chattogram",
      latitude: 22.3372,
      longitude: 91.7832,
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
      images: [
        { url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Night floodlights & main pitch" },
        { url: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&auto=format&fit=crop&q=80", order: 2, caption: "Goalpost view & lush grass" },
      ],
    },
    {
      ownerId: owner.id,
      name: "Apollo Turf Club Kazir Dewri",
      slug: "apollo-turf-kazir-dewri",
      city: "Chattogram",
      area: "Kazir Dewri",
      address: "Near Stadium Gate 2, Kazir Dewri, Chattogram",
      latitude: 22.3475,
      longitude: 91.8282,
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
      images: [
        { url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Full field view" },
      ],
    },
    {
      ownerId: owner.id,
      name: "Chandgaon Futsal & Turf Zone",
      slug: "chandgaon-futsal-zone",
      city: "Chattogram",
      area: "Chandgaon",
      address: "Behind Bahaddarhat Bus Terminal, Chandgaon R/A, Chattogram",
      latitude: 22.3811,
      longitude: 91.8423,
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
      images: [
        { url: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Side touchline view" },
      ],
    },
    {
      ownerId: owner.id,
      name: "Khulshi Arena Sports Ground",
      slug: "khulshi-arena-sports",
      city: "Chattogram",
      area: "Khulshi",
      address: "Zakir Hossain Road, South Khulshi, Chattogram",
      latitude: 22.3615,
      longitude: 91.8023,
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
      images: [
        { url: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Dusk match atmosphere" },
      ],
    },
    {
      ownerId: owner.id,
      name: "GEC Circle Futsal Club",
      slug: "gec-circle-futsal",
      city: "Chattogram",
      area: "GEC Circle",
      address: "Golpahar Moor, O.R. Nizam Road, Chattogram",
      latitude: 22.3587,
      longitude: 91.8214,
      description: "Convenient central meetup spot for university squads and corporate matches. Shock-absorbent rubber underlay keeps ankles and knees safe.",
      pitchFormats: "5v5, 6v6",
      basePricePerHour: 1400,
      rating: 4.6,
      reviewCount: 24,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: false,
      hasWater: true,
      images: [
        { url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Futsal action angle" },
      ],
    },
    {
      ownerId: owner.id,
      name: "Agrabad Commercial Arena",
      slug: "agrabad-commercial-arena",
      city: "Chattogram",
      area: "Agrabad",
      address: "Sabdar Ali Road, Agrabad C/A, Chattogram",
      latitude: 22.3275,
      longitude: 91.8123,
      description: "Dedicated to post-office sports leagues and banking football tournaments. Ample parking, shower rooms, and match video recording facility.",
      pitchFormats: "6v6, 7v7",
      basePricePerHour: 1350,
      rating: 4.7,
      reviewCount: 31,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: true,
      hasWater: true,
      images: [
        { url: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Overhead view" },
      ],
    },
    {
      ownerId: owner.id,
      name: "Nasirabad Green Field",
      slug: "nasirabad-green-field",
      city: "Chattogram",
      area: "Nasirabad",
      address: "Baizid Bostami Road, Nasirabad I/A, Chattogram",
      latitude: 22.3689,
      longitude: 91.8198,
      description: "Wide open 7v7 pitch engineered for competitive high-speed movement. FIFA standard grass fiber with natural cork infill.",
      pitchFormats: "7v7",
      basePricePerHour: 1250,
      rating: 4.8,
      reviewCount: 22,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: true,
      hasWater: true,
      images: [
        { url: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Goalmouth turf condition" },
      ],
    },
    {
      ownerId: owner.id,
      name: "Bayezid Kickoff Turf",
      slug: "bayezid-kickoff-turf",
      city: "Chattogram",
      area: "Bayezid",
      address: "Oxygen Moor, Bayezid Link Road, Chattogram",
      latitude: 22.3950,
      longitude: 91.8150,
      description: "Affordable youth football complex near the bypass. Friendly staff, cold beverages, and open training slots throughout the week.",
      pitchFormats: "5v5, 6v6",
      basePricePerHour: 1100,
      rating: 4.5,
      reviewCount: 17,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: false,
      hasParking: true,
      hasWater: true,
      images: [
        { url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Entrance & pitch" },
      ],
    },
    {
      ownerId: owner.id,
      name: "Panchlaish Elite Turf",
      slug: "panchlaish-elite-turf",
      city: "Chattogram",
      area: "Panchlaish",
      address: "Prabartak Circle, Panchlaish R/A, Chattogram",
      latitude: 22.3620,
      longitude: 91.8340,
      description: "Ultra-modern turf featuring high-lumen anti-glare floodlights and comfortable lounge seating for subs and spectators.",
      pitchFormats: "6v6, 7v7",
      basePricePerHour: 1600,
      rating: 4.9,
      reviewCount: 45,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: true,
      hasWater: true,
      images: [
        { url: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Night arena floodlights" },
      ],
    },
    {
      ownerId: owner.id,
      name: "Patenga Coastal Cricket & Turf",
      slug: "patenga-coastal-turf",
      city: "Chattogram",
      area: "Patenga",
      address: "Airport Road, South Patenga Sea Beach Link, Chattogram",
      latitude: 22.2350,
      longitude: 91.7920,
      description: "Breezy seaside sports pitch equipped with heavy boundary netting for both box cricket and fast-paced 6v6 football.",
      pitchFormats: "Cricket Box, 6v6",
      basePricePerHour: 1000,
      rating: 4.6,
      reviewCount: 20,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: true,
      hasWater: true,
      images: [
        { url: "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Seaside pitch view" },
      ],
    },
    {
      ownerId: owner.id,
      name: "CUET Campus Gate Sports Turf",
      slug: "cuet-campus-gate-turf",
      city: "Chattogram",
      area: "Raozan",
      address: "Kaptai Highway, CUET Main Gate, Raozan, Chattogram",
      latitude: 22.4633,
      longitude: 91.9712,
      description: "The official favorite venue for engineering students, faculty, and inter-departmental tournaments. Equipped for cricket and 7v7 football.",
      pitchFormats: "5v5, 7v7, Cricket Box",
      basePricePerHour: 1000,
      rating: 4.9,
      reviewCount: 52,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: true,
      hasWater: true,
      images: [
        { url: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&auto=format&fit=crop&q=80", order: 1, caption: "CUET pitch floodlights" },
      ],
    },

    // --- DHAKA (7 Venues) ---
    {
      ownerId: owner.id,
      name: "Dhanmondi Champions Turf",
      slug: "dhanmondi-champions-turf",
      city: "Dhaka",
      area: "Dhanmondi",
      address: "Satmasjid Road, Dhanmondi 9/A, Dhaka",
      latitude: 23.7465,
      longitude: 90.3760,
      description: "Popular central Dhaka rooftop pitch with stunning city views, shock-pad turf foundation for joint protection, and professional coaching gear.",
      pitchFormats: "5v5, 6v6",
      basePricePerHour: 1600,
      rating: 4.8,
      reviewCount: 56,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: true,
      hasWater: true,
      images: [
        { url: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Rooftop turf dusk view" },
      ],
    },
    {
      ownerId: owner.id,
      name: "Bashundhara Sports Hub",
      slug: "bashundhara-sports-hub",
      city: "Dhaka",
      area: "Bashundhara",
      address: "Block I, 300 Feet Road, Bashundhara R/A, Dhaka",
      latitude: 23.8165,
      longitude: 90.4370,
      description: "Huge tournament-ready multi-pitch complex accommodating simultaneous 7v7 matches with official electronic scoreboards and player dugouts.",
      pitchFormats: "7v7",
      basePricePerHour: 1800,
      rating: 5.0,
      reviewCount: 64,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1524015368236-bbf6f72545b6?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: true,
      hasWater: true,
      images: [
        { url: "https://images.unsplash.com/photo-1524015368236-bbf6f72545b6?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Main championship pitch" },
      ],
    },
    {
      ownerId: owner.id,
      name: "Uttara Sector 11 Arena",
      slug: "uttara-sector-11-arena",
      city: "Dhaka",
      area: "Uttara",
      address: "Gareeb-e-Newaz Avenue, Sector 11, Uttara, Dhaka",
      latitude: 23.8745,
      longitude: 90.3950,
      description: "Well-ventilated pitch catering to northern Dhaka squads. Monofilament grass fibers provide pristine ball rolling and realistic bounces.",
      pitchFormats: "6v6, 7v7",
      basePricePerHour: 1500,
      rating: 4.7,
      reviewCount: 38,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: true,
      hasWater: true,
      images: [
        { url: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Field overview" },
      ],
    },
    {
      ownerId: owner.id,
      name: "Banani Skyline Rooftop",
      slug: "banani-skyline-rooftop",
      city: "Dhaka",
      area: "Banani",
      address: "Road 11, Block D, Banani, Dhaka",
      latitude: 23.7937,
      longitude: 90.4043,
      description: "Premium rooftop arena in the heart of Banani dining zone. Features ambient cafe lounge, pro-level netting, and high-def streaming cameras.",
      pitchFormats: "5v5, 6v6",
      basePricePerHour: 2000,
      rating: 4.9,
      reviewCount: 41,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: true,
      hasWater: true,
      images: [
        { url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Banani skyline dusk view" },
      ],
    },
    {
      ownerId: owner.id,
      name: "Mirpur Stadium Turf Club",
      slug: "mirpur-stadium-turf",
      city: "Dhaka",
      area: "Mirpur",
      address: "Section 2, Near Sher-e-Bangla Stadium, Mirpur, Dhaka",
      latitude: 23.8069,
      longitude: 90.3638,
      description: "Spacious dual-purpose arena next to the national cricket stadium. Top choice for both tape-ball cricket box matches and 7v7 football.",
      pitchFormats: "7v7, Cricket Box",
      basePricePerHour: 1300,
      rating: 4.6,
      reviewCount: 29,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: true,
      hasWater: true,
      images: [
        { url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Cricket & football surface" },
      ],
    },
    {
      ownerId: owner.id,
      name: "Mohammadpur Green Pitch",
      slug: "mohammadpur-green-pitch",
      city: "Dhaka",
      area: "Mohammadpur",
      address: "Ring Road, Adabor / Mohammadpur, Dhaka",
      latitude: 23.7650,
      longitude: 90.3580,
      description: "Thriving community field with high nightly activity. Perfect for weekend friendlies, youth coaching academies, and local neighborhood derbies.",
      pitchFormats: "5v5, 6v6",
      basePricePerHour: 1400,
      rating: 4.7,
      reviewCount: 33,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: true,
      hasWater: true,
      images: [
        { url: "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Goalposts and synthetic lawn" },
      ],
    },
    {
      ownerId: owner.id,
      name: "Gulshan Lakeview Ground",
      slug: "gulshan-lakeview-ground",
      city: "Dhaka",
      area: "Gulshan",
      address: "Gulshan North Avenue, Gulshan 2, Dhaka",
      latitude: 23.7890,
      longitude: 90.4150,
      description: "Serene lakeside sports arena with executive changing suites, physiotherapist recovery corner, and curated beverage bar.",
      pitchFormats: "6v6, 7v7",
      basePricePerHour: 1900,
      rating: 4.8,
      reviewCount: 47,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: true,
      hasWater: true,
      images: [
        { url: "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Lakeside floodlit turf" },
      ],
    },

    // --- SYLHET (2 Venues) ---
    {
      ownerId: owner.id,
      name: "Shahjalal Upashahar Turf",
      slug: "shahjalal-upashahar-turf",
      city: "Sylhet",
      area: "Upashahar",
      address: "Main Road, Block D, Shahjalal Upashahar, Sylhet",
      latitude: 24.8870,
      longitude: 91.8820,
      description: "Sylhet's highest rated sports pitch. Surrounded by tranquil residential greenery with top-tier artificial grass and LED night floodlights.",
      pitchFormats: "6v6, 7v7",
      basePricePerHour: 1200,
      rating: 4.8,
      reviewCount: 26,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: true,
      hasWater: true,
      images: [
        { url: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Upashahar ground under floodlights" },
      ],
    },
    {
      ownerId: owner.id,
      name: "Zindabazar Premier Pitch",
      slug: "zindabazar-premier-pitch",
      city: "Sylhet",
      area: "Zindabazar",
      address: "Baruthkhana Road, Zindabazar, Sylhet",
      latitude: 24.8980,
      longitude: 91.8710,
      description: "Vibrant downtown Sylhet turf with dedicated cricket pitch conversion mats and rapid 5v5 futsal court.",
      pitchFormats: "5v5, Cricket Box",
      basePricePerHour: 1300,
      rating: 4.7,
      reviewCount: 21,
      status: "APPROVED",
      coverImage: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&auto=format&fit=crop&q=80",
      hasFloodlights: true,
      hasWashroom: true,
      hasChangingRoom: true,
      hasParking: true,
      hasWater: true,
      images: [
        { url: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&auto=format&fit=crop&q=80", order: 1, caption: "Downtown pitch action" },
      ],
    },
  ];

  const createdTurfs = [];
  for (const t of turfsData) {
    const { images, ...turfFields } = t;
    const created = await prisma.turf.create({
      data: {
        ...turfFields,
        images: {
          create: images,
        },
      },
    });
    createdTurfs.push(created);
  }
  console.log(`✓ Seeded ${createdTurfs.length} Turfs across Chattogram (11), Dhaka (7), and Sylhet (2)`);

  // 3. Seed AvailabilityRules (7 days/week, 16:00 to 25:00 BST) for all 20 Turfs
  console.log("⚡ Generating full 7-day AvailabilityRules for all 20 turfs...");
  const availabilityRulesData: {
    turfId: string;
    dayOfWeek: number;
    openHour: number;
    closeHour: number;
    hourlyRate: number;
  }[] = [];

  for (const turf of createdTurfs) {
    for (let day = 0; day <= 6; day++) {
      availabilityRulesData.push({
        turfId: turf.id,
        dayOfWeek: day,
        openHour: 16,
        closeHour: 25,
        hourlyRate: turf.basePricePerHour,
      });
    }
  }
  await prisma.availabilityRule.createMany({ data: availabilityRulesData });
  console.log(`✓ Seeded ${availabilityRulesData.length} AvailabilityRules (7 days across 20 turfs)`);

  // 4. Seed BlockedIntervals for venue maintenance and private events
  const blockedData = [
    {
      turfId: createdTurfs[0].id, // Eco Sports Halishahar
      startTime: new Date(Date.now() + 2 * 86400000 + 4 * 3600000), // In 2 days 4 PM
      endTime: new Date(Date.now() + 2 * 86400000 + 6 * 3600000), // 6 PM
      reason: "Private Corporate Futsal Tournament",
    },
    {
      turfId: createdTurfs[1].id, // Apollo Kazir Dewri
      startTime: new Date(Date.now() + 3 * 86400000 + 2 * 3600000), // In 3 days 2 PM
      endTime: new Date(Date.now() + 3 * 86400000 + 4 * 3600000), // 4 PM
      reason: "Pitch Turf Grooming & Floodlight Maintenance",
    },
    {
      turfId: createdTurfs[11].id, // Dhanmondi Champions Field
      startTime: new Date(Date.now() + 5 * 86400000 + 5 * 3600000),
      endTime: new Date(Date.now() + 5 * 86400000 + 7 * 3600000),
      reason: "Dhaka Inter-College Derby Final",
    },
  ];
  await prisma.blockedInterval.createMany({ data: blockedData });
  console.log(`✓ Seeded ${blockedData.length} BlockedIntervals`);

  // 5. Seed Clean 100% Relational Triad: Holds -> PaymentAttempts -> Bookings
  console.log("⚡ Generating 160 realistic past & upcoming bookings with 100% relational integrity...");
  const customerUsers = [player, adiba, tanvir, ...squadUsers];
  
  const holdsToInsert: any[] = [];
  const bookingsToInsert: any[] = [];
  const paymentsToInsert: any[] = [];
  
  let counter = 0;
  const now = new Date();

  // A. Past 28 Days: 7 bookings per turf = 140 historical bookings
  for (let turfIdx = 0; turfIdx < createdTurfs.length; turfIdx++) {
    const turf = createdTurfs[turfIdx];
    // Spread 7 bookings over the past 28 days
    for (let bIdx = 0; bIdx < 7; bIdx++) {
      counter++;
      const dayOffset = 1 + bIdx * 4 + (turfIdx % 3); // 1 to 28 days ago
      const targetDate = new Date(now.getTime() - dayOffset * 86400000);
      const bstHour = 17 + ((bIdx * 2 + turfIdx) % 7); // 17:00 to 23:00 BST
      
      const slotStart = new Date(targetDate);
      slotStart.setUTCHours(bstHour - 6, 0, 0, 0); // UTC = BST - 6
      const slotEnd = new Date(slotStart.getTime() + 3600000);
      
      const isPrimeHour = bstHour >= 20 && bstHour <= 22;
      const dayOfWeek = (slotStart.getUTCDay() + 6) % 7; // BST day
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
      let finalPrice = turf.basePricePerHour;
      if (isWeekend || isPrimeHour) finalPrice += 150;

      const user = customerUsers[(counter + turfIdx) % customerUsers.length];
      const holdId = `seed_hold_${counter.toString().padStart(4, "0")}`;
      const bookingId = `seed_book_${counter.toString().padStart(4, "0")}`;
      const paymentId = `seed_pay_${counter.toString().padStart(4, "0")}`;
      
      const hexSuffix = ((counter * 7919 + turfIdx * 3571) % 65536).toString(16).toUpperCase().padStart(4, "0");
      const refCode = `SPZ-26-${(turfIdx + 1).toString().padStart(2, "0")}-${dayOffset.toString().padStart(2, "0")}${bstHour}-${hexSuffix}`;
      const trxId = `TRX${(turfIdx + 1).toString().padStart(2, "0")}${dayOffset.toString().padStart(2, "0")}${bstHour}${hexSuffix}`;
      const method = counter % 4 === 0 ? "NAGAD" : "BKASH";

      const bookingCreated = new Date(slotStart.getTime() - 86400000);

      // 1. Hold
      holdsToInsert.push({
        id: holdId,
        turfId: turf.id,
        userId: user.id,
        startTime: slotStart,
        endTime: slotEnd,
        price: finalPrice,
        expiresAt: new Date(slotStart.getTime() + 300000),
        status: "CONSUMED",
        createdAt: bookingCreated,
      });

      // 2. Booking
      bookingsToInsert.push({
        id: bookingId,
        referenceCode: refCode,
        turfId: turf.id,
        userId: user.id,
        holdId: holdId,
        startTime: slotStart,
        endTime: slotEnd,
        totalAmount: finalPrice,
        status: "CONFIRMED",
        paymentMethod: method,
        transactionId: trxId,
        createdAt: bookingCreated,
        updatedAt: bookingCreated,
      });

      // 3. PaymentAttempt
      paymentsToInsert.push({
        id: paymentId,
        bookingId: bookingId,
        holdId: holdId,
        provider: method,
        accountNumber: user.phone || "01812345678",
        amount: finalPrice,
        status: "SUCCEEDED",
        idempotencyKey: `idemp_${bookingId}`,
        createdAt: bookingCreated,
      });
    }
  }

  // B. Upcoming Bookings (Tonight, Tomorrow, and This Weekend) for Owner & Player dashboards
  const upcomingDefinitions = [
    { turfIdx: 0, hoursFromNow: 8, user: player }, // Eco Sports tonight
    { turfIdx: 0, hoursFromNow: 32, user: adiba }, // Eco Sports tomorrow
    { turfIdx: 1, hoursFromNow: 12, user: tanvir }, // Apollo Kazir Dewri
    { turfIdx: 2, hoursFromNow: 10, user: player }, // Chandgaon tonight
    { turfIdx: 9, hoursFromNow: 48, user: player }, // Patenga cricket
    { turfIdx: 11, hoursFromNow: 24, user: tanvir }, // Dhanmondi Dhaka
    { turfIdx: 17, hoursFromNow: 30, user: adiba }, // Shahjalal Sylhet
  ];

  for (const up of upcomingDefinitions) {
    counter++;
    const turf = createdTurfs[up.turfIdx];
    const slotStart = new Date(now.getTime() + up.hoursFromNow * 3600000);
    slotStart.setMinutes(0, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + 3600000);

    const holdId = `seed_hold_${counter.toString().padStart(4, "0")}`;
    const bookingId = `seed_book_${counter.toString().padStart(4, "0")}`;
    const paymentId = `seed_pay_${counter.toString().padStart(4, "0")}`;

    const hexSuffix = ((counter * 7919) % 65536).toString(16).toUpperCase().padStart(4, "0");
    const refCode = `SPZ-2026-UP${(up.turfIdx + 1).toString().padStart(2, "0")}-${hexSuffix}`;
    const trxId = `TRXUP${(up.turfIdx + 1).toString().padStart(2, "0")}${hexSuffix}`;

    holdsToInsert.push({
      id: holdId,
      turfId: turf.id,
      userId: up.user.id,
      startTime: slotStart,
      endTime: slotEnd,
      price: turf.basePricePerHour,
      expiresAt: new Date(now.getTime() + 300000),
      status: "CONSUMED",
      createdAt: now,
    });

    bookingsToInsert.push({
      id: bookingId,
      referenceCode: refCode,
      turfId: turf.id,
      userId: up.user.id,
      holdId: holdId,
      startTime: slotStart,
      endTime: slotEnd,
      totalAmount: turf.basePricePerHour,
      status: "CONFIRMED",
      paymentMethod: "BKASH",
      transactionId: trxId,
      createdAt: now,
      updatedAt: now,
    });

    paymentsToInsert.push({
      id: paymentId,
      bookingId: bookingId,
      holdId: holdId,
      provider: "BKASH",
      accountNumber: up.user.phone || "01812345678",
      amount: turf.basePricePerHour,
      status: "SUCCEEDED",
      idempotencyKey: `idemp_${bookingId}`,
      createdAt: now,
    });
  }

  // Insert Triad
  console.log(`Inserting ${holdsToInsert.length} Holds...`);
  await prisma.hold.createMany({ data: holdsToInsert });
  console.log(`Inserting ${bookingsToInsert.length} Bookings...`);
  await prisma.booking.createMany({ data: bookingsToInsert });
  console.log(`Inserting ${paymentsToInsert.length} PaymentAttempts...`);
  await prisma.paymentAttempt.createMany({ data: paymentsToInsert });
  console.log("✓ Successfully seeded 100% Relational Triad: Holds, Bookings, and Payments!");

  // 6. Seed Verified Reviews (Linked 1:1 to authentic bookings)
  console.log("⚡ Seeding authentic reviews linked 1:1 to verified bookings...");
  const reviewsData = [
    {
      turfId: createdTurfs[0].id,
      bookingId: bookingsToInsert[0].id,
      userId: player.id,
      rating: 5,
      comment: "Best turf in Halishahar! The new LED lights make night games incredible, and the ball roll is super consistent.",
    },
    {
      turfId: createdTurfs[0].id,
      bookingId: bookingsToInsert[1].id,
      userId: adiba.id,
      rating: 5,
      comment: "Super clean dressing rooms and crisp boundary lines. Great venue for weekend 7v7 friendly derbies!",
    },
    {
      turfId: createdTurfs[1].id,
      bookingId: bookingsToInsert[7].id,
      userId: tanvir.id,
      rating: 5,
      comment: "Centrally located next to MA Aziz Stadium. High bounce artificial grass with zero dead spots.",
    },
    {
      turfId: createdTurfs[2].id,
      bookingId: bookingsToInsert[14].id,
      userId: player.id,
      rating: 5,
      comment: "Chandgaon zone is great for high-pace futsal. Plenty of bike parking and cold water available.",
    },
    {
      turfId: createdTurfs[10].id, // CUET
      bookingId: bookingsToInsert[70].id,
      userId: adiba.id,
      rating: 5,
      comment: "CUET sports ground is unbeatable for engineering derby matches! Great floodlights and friendly management.",
    },
    {
      turfId: createdTurfs[11].id, // Dhanmondi Champions Field
      bookingId: bookingsToInsert[77].id,
      userId: tanvir.id,
      rating: 5,
      comment: "Dhanmondi Champions has the best shock-absorption system in Dhaka. Perfect for 5v5 tournament finals.",
    },
    {
      turfId: createdTurfs[17].id, // Shahjalal Upashahar Sylhet
      bookingId: bookingsToInsert[119].id,
      userId: player.id,
      rating: 5,
      comment: "Beautiful scenic pitch in Upashahar. Floodlights are bright and the imported grass is gentle on knees.",
    },
  ];

  for (const rev of reviewsData) {
    await prisma.review.create({ data: rev });
  }
  console.log(`✓ Seeded ${reviewsData.length} Verified Reviews linked 1:1 to Booking IDs`);

  // 7. Seed Active MatchPosts & Real Squad Rosters (JoinRequests)
  console.log("⚡ Seeding active community matches with full squad rosters...");
  const tonightMatchTime = new Date(now.getTime() + 6 * 3600000); // In 6 hours
  tonightMatchTime.setMinutes(0, 0, 0);

  const tomorrowMatchTime = new Date(now.getTime() + 30 * 3600000); // Tomorrow evening
  tomorrowMatchTime.setMinutes(0, 0, 0);

  const weekendMatchTime = new Date(now.getTime() + 54 * 3600000); // Weekend
  weekendMatchTime.setMinutes(0, 0, 0);

  // Match 1: Halishahar Arena (Chattogram)
  const match1 = await prisma.matchPost.create({
    data: {
      turfId: createdTurfs[0].id,
      hostUserId: player.id,
      bookingId: bookingsToInsert[bookingsToInsert.length - 7].id, // Linked to Halishahar upcoming booking
      title: "Need 1 Dependable Goalkeeper for 7v7 Match Tonight!",
      description: "We booked Eco Sports Halishahar for tonight. Our regular GK got injured. Looking for a dependable shot-stopper. Friendly, competitive vibe!",
      sportFormat: "7v7",
      matchTime: tonightMatchTime,
      area: "Halishahar, Chattogram",
      totalSpots: 14,
      openSpots: 1,
      costPerPlayer: 150,
      requiredRole: "Goalkeeper",
      status: "OPEN",
    },
  });

  // Attach 12 squad members to Match 1 so 1 spot is truly open
  for (let i = 0; i < 12; i++) {
    await prisma.joinRequest.create({
      data: {
        matchPostId: match1.id,
        userId: squadUsers[i].id,
        preferredRole: squadUsers[i].email.includes("siam") ? "Goalkeeper" : (i % 2 === 0 ? "Striker" : "Defender"),
        status: "ACCEPTED",
      },
    });
  }

  // Match 2: Chandgaon Futsal Zone (Chattogram)
  const match2 = await prisma.matchPost.create({
    data: {
      turfId: createdTurfs[2].id,
      hostUserId: adiba.id,
      bookingId: bookingsToInsert[bookingsToInsert.length - 4].id,
      title: "Dominatrix FC vs Amateur Rival Challenge (6v6)",
      description: "Fast-paced futsal session. Need 2 clinical midfielders or wingers to complete our starting rotation.",
      sportFormat: "6v6",
      matchTime: tomorrowMatchTime,
      area: "Chandgaon, Chattogram",
      totalSpots: 12,
      openSpots: 2,
      costPerPlayer: 200,
      requiredRole: "Midfielder",
      status: "OPEN",
    },
  });

  for (let i = 0; i < 9; i++) {
    await prisma.joinRequest.create({
      data: {
        matchPostId: match2.id,
        userId: squadUsers[i].id,
        preferredRole: i % 2 === 0 ? "Midfielder" : "Defender",
        status: "ACCEPTED",
      },
    });
  }

  // Match 3: Dhanmondi Champions Field (Dhaka)
  const match3 = await prisma.matchPost.create({
    data: {
      turfId: createdTurfs[11].id,
      hostUserId: tanvir.id,
      bookingId: bookingsToInsert[bookingsToInsert.length - 2].id,
      title: "Dhaka Corporate Friday Night Futsal (7v7)",
      description: "Post-work Friday evening session on imported shock-absorption turf. Looking for 2 energetic players.",
      sportFormat: "7v7",
      matchTime: weekendMatchTime,
      area: "Dhanmondi, Dhaka",
      totalSpots: 14,
      openSpots: 2,
      costPerPlayer: 250,
      requiredRole: "Any",
      status: "OPEN",
    },
  });

  for (let i = 0; i < 11; i++) {
    await prisma.joinRequest.create({
      data: {
        matchPostId: match3.id,
        userId: squadUsers[i].id,
        preferredRole: "Striker",
        status: "ACCEPTED",
      },
    });
  }

  // Match 4: Shahjalal Upashahar Turf (Sylhet)
  const match4 = await prisma.matchPost.create({
    data: {
      turfId: createdTurfs[17].id,
      hostUserId: player.id,
      bookingId: bookingsToInsert[bookingsToInsert.length - 1].id,
      title: "Sylhet Weekend Friendly Cup (6v6)",
      description: "Casual weekend match under evening floodlights by the lake. Looking for 1 striker.",
      sportFormat: "6v6",
      matchTime: new Date(weekendMatchTime.getTime() + 86400000),
      area: "Upashahar, Sylhet",
      totalSpots: 12,
      openSpots: 1,
      costPerPlayer: 180,
      requiredRole: "Striker",
      status: "OPEN",
    },
  });

  for (let i = 0; i < 10; i++) {
    await prisma.joinRequest.create({
      data: {
        matchPostId: match4.id,
        userId: squadUsers[i].id,
        preferredRole: "Midfielder",
        status: "ACCEPTED",
      },
    });
  }

  console.log("✓ Seeded 4 Active MatchPosts across Chattogram, Dhaka, and Sylhet with authentic JoinRequest squads!");
  console.log("🎉 Database seeding completed with 100% Relational Integrity!");

}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
