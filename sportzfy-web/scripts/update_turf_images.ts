import { prisma } from "../lib/db";

const turfImages: Record<string, string> = {
  "eco-sports-halishahar": "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80",
  "apollo-turf-kazir-dewri": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
  "chandgaon-futsal-zone": "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80",
  "khulshi-arena-sports": "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800&auto=format&fit=crop&q=80",
  "gec-circle-futsal": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80",
  "agrabad-commercial-arena": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
  "nasirabad-green-field": "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&auto=format&fit=crop&q=80",
  "bayezid-kickoff-turf": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80",
  "panchlaish-elite-turf": "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&auto=format&fit=crop&q=80",
  "patenga-coastal-turf": "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=800&auto=format&fit=crop&q=80",
  "cuet-campus-gate-turf": "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&auto=format&fit=crop&q=80",
  "dhanmondi-champions-turf": "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&auto=format&fit=crop&q=80",
  "bashundhara-sports-hub": "https://images.unsplash.com/photo-1524015368236-bbf6f72545b6?w=800&auto=format&fit=crop&q=80",
  "uttara-sector-11-arena": "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&auto=format&fit=crop&q=80",
  "banani-skyline-rooftop": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
  "mirpur-stadium-turf": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80",
  "mohammadpur-green-pitch": "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80",
  "gulshan-lakeview-ground": "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=800&auto=format&fit=crop&q=80",
  "shahjalal-upashahar-turf": "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&auto=format&fit=crop&q=80",
  "zindabazar-premier-pitch": "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&auto=format&fit=crop&q=80",
};

async function main() {
  console.log("Updating all 20 turfs with unique, verified cover images...");
  for (const [slug, url] of Object.entries(turfImages)) {
    const res = await prisma.turf.updateMany({
      where: { slug },
      data: { coverImage: url },
    });
    console.log(`- ${slug}: ${res.count > 0 ? "OK" : "NOT_FOUND"}`);
  }
  console.log("Completed!");
}

main()
  .catch((e) => {
    console.error("Error updating turf images:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
