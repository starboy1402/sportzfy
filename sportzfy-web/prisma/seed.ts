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

  console.log("✓ Created Users (player@sportzfy.com, adiba@cuet.com, owner@sportzfy.com, admin@sportzfy.com)");

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

  // 3. Generate 5,000+ Historical Bookings across 60 Days
  console.log("⚡ Generating 5,000+ realistic historical bookings across 60 days...");
  const bookingsToInsert: {
    referenceCode: string;
    turfId: string;
    userId: string;
    startTime: Date;
    endTime: Date;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    transactionId: string;
    createdAt: Date;
    updatedAt: Date;
  }[] = [];

  const now = new Date();
  const playerIds = [player.id, adiba.id];

  // Loop over 60 days back (from day 60 ago to day 1 ago)
  for (let dayOffset = 60; dayOffset >= 1; dayOffset--) {
    const targetDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    // Bangladesh Standard Time (+6 hours)
    const bstTargetDate = new Date(targetDate.getTime() + 6 * 60 * 60 * 1000);
    const dayOfWeek = bstTargetDate.getUTCDay(); // 0 = Sun, 5 = Fri, 6 = Sat
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

    // Simulate weather: 10% chance of rain on that day
    const isRainyDay = (dayOffset % 9 === 0);

    // Operating hours: 16 (4 PM) through 23 (11 PM) -> 8 slots
    const operatingHours = [16, 17, 18, 19, 20, 21, 22, 23];

    for (let turfIdx = 0; turfIdx < createdTurfs.length; turfIdx++) {
      const turf = createdTurfs[turfIdx];
      const isHighRated = turf.rating >= 4.8;

      for (const bstHour of operatingHours) {
        const isPrimeHour = bstHour >= 20 && bstHour <= 22;

        // Base booking likelihood:
        // Weekends: 85%
        // Weekday Prime (8-11 PM): 80%
        // Weekday Regular: 45%
        let bookingProb = isWeekend ? 0.85 : (isPrimeHour ? 0.80 : 0.45);
        if (isHighRated) bookingProb += 0.08;
        if (isRainyDay) bookingProb -= 0.25;

        // Seed determinism check
        const pseudoRand = ((dayOffset * 31 + turfIdx * 17 + bstHour * 7) % 100) / 100;
        if (pseudoRand < bookingProb) {
          // Construct UTC timestamp corresponding to bstHour on targetDate
          const slotStart = new Date(targetDate);
          // bstHour in UTC is (bstHour - 6)
          slotStart.setUTCHours(bstHour - 6, 0, 0, 0);
          const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

          // Pricing calculation
          let finalPrice = turf.basePricePerHour;
          if (isWeekend || isPrimeHour) {
            finalPrice += 150;
          } else if (isRainyDay) {
            finalPrice -= 150;
          }

          const userId = playerIds[(dayOffset + turfIdx + bstHour) % playerIds.length];
          const hashSuffix = ((dayOffset * 7919 + turfIdx * 3571 + bstHour * 23) % 65536)
            .toString(16)
            .toUpperCase()
            .padStart(4, "0");
          const refCode = `SPZ-26-${(turfIdx + 1).toString().padStart(2, "0")}-${dayOffset.toString().padStart(2, "0")}${bstHour}-${hashSuffix}`;
          const trxId = `TRX${(turfIdx + 1).toString().padStart(2, "0")}${dayOffset.toString().padStart(2, "0")}${bstHour}${hashSuffix}`;

          const bookingCreated = new Date(slotStart.getTime() - (1 + (dayOffset % 3)) * 86400000);

          bookingsToInsert.push({
            referenceCode: refCode,
            turfId: turf.id,
            userId,
            startTime: slotStart,
            endTime: slotEnd,
            totalAmount: finalPrice,
            status: "CONFIRMED",
            paymentMethod: "BKASH",
            transactionId: trxId,
            createdAt: bookingCreated,
            updatedAt: bookingCreated,
          });
        }
      }
    }
  }

  console.log(`Generated ${bookingsToInsert.length} synthetic bookings. Batch inserting in 1,000-record chunks...`);

  // Batch insertion in chunks of 1,000 to prevent Postgres parameter limit crashes
  const CHUNK_SIZE = 1000;
  for (let i = 0; i < bookingsToInsert.length; i += CHUNK_SIZE) {
    const chunk = bookingsToInsert.slice(i, i + CHUNK_SIZE);
    await prisma.booking.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    console.log(`  ✓ Inserted batch ${Math.floor(i / CHUNK_SIZE) + 1} (${chunk.length} bookings)`);
  }

  const totalBookings = await prisma.booking.count();
  console.log(`✓ Confirmed total bookings in database: ${totalBookings}`);

  // 4. Sample Verified Reviews
  await prisma.review.create({
    data: {
      turfId: createdTurfs[0].id, // Halishahar
      userId: player.id,
      rating: 5,
      comment: "Best turf in Halishahar! The new LED lights make night games incredible, and the ball roll is super consistent.",
    },
  });

  await prisma.review.create({
    data: {
      turfId: createdTurfs[10].id, // CUET
      userId: adiba.id,
      rating: 5,
      comment: "CUET sports ground is unbeatable for engineering derby matches! Great floodlights and friendly management.",
    },
  });

  await prisma.review.create({
    data: {
      turfId: createdTurfs[11].id, // Dhanmondi
      userId: player.id,
      rating: 5,
      comment: "Dhanmondi Champions has the best shock-absorption system in Dhaka. Perfect for 5v5 tournament finals.",
    },
  });

  // 5. Open Matchmaking Community Posts
  const tonight = new Date();
  tonight.setHours(20, 0, 0, 0);

  await prisma.matchPost.create({
    data: {
      turfId: createdTurfs[2].id, // Chandgaon
      hostUserId: player.id,
      title: "Need 1 Solid Goalkeeper for 7v7 Match Tonight!",
      description: "We booked Chandgaon Turf for 8 PM - 9:30 PM tonight. Our regular GK got injured. Looking for a dependable shot-stopper. Friendly, competitive vibe!",
      sportFormat: "7v7",
      matchTime: tonight,
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
      turfId: createdTurfs[0].id, // Halishahar
      hostUserId: adiba.id,
      title: "Dominatrix FC vs Amateur Rival Challenge (7v7)",
      description: "Looking for a rival amateur team to play an intense 90-minute friendly match. 50/50 turf cost split.",
      sportFormat: "7v7",
      matchTime: new Date(Date.now() + 86400000),
      area: "Halishahar, Chattogram",
      totalSpots: 14,
      openSpots: 7,
      costPerPlayer: 200,
      requiredRole: "Any",
      status: "OPEN",
    },
  });

  await prisma.matchPost.create({
    data: {
      turfId: createdTurfs[9].id, // Patenga
      hostUserId: player.id,
      title: "Weekend Seaside Box Cricket Match (6v6)",
      description: "Casual tape-ball cricket box match under evening floodlights by the sea. Looking for 3 enthusiastic batsmen/bowlers.",
      sportFormat: "Cricket Box",
      matchTime: new Date(Date.now() + 2 * 86400000),
      area: "Patenga, Chattogram",
      totalSpots: 12,
      openSpots: 3,
      costPerPlayer: 100,
      requiredRole: "All-rounder",
      status: "OPEN",
    },
  });

  console.log("✓ Seeded Open Matchmaking Posts & Reviews");
  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
