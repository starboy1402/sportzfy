import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateDynamicSlotPrice } from "@/lib/pricing";

// Haversine Great-Circle Distance Formula in Kilometers
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityParam = searchParams.get("city");
    const formatParam = searchParams.get("format");
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");

    // Default reference anchors
    let userLat = latParam ? parseFloat(latParam) : null;
    let userLng = lngParam ? parseFloat(lngParam) : null;

    if (!userLat || !userLng || isNaN(userLat) || isNaN(userLng)) {
      if (cityParam === "Dhaka") {
        userLat = 23.7937; // Banani / Gulshan
        userLng = 90.4043;
      } else if (cityParam === "Sylhet") {
        userLat = 24.8949; // Zindabazar
        userLng = 91.8687;
      } else {
        userLat = 22.3592; // GEC Circle, Chattogram
        userLng = 91.8217;
      }
    }

    // Build base turf query filter
    const whereClause: any = {
      status: "APPROVED",
    };

    if (cityParam && cityParam !== "All") {
      whereClause.city = { equals: cityParam, mode: "insensitive" };
    }

    if (formatParam && formatParam !== "All") {
      whereClause.pitchFormats = { contains: formatParam, mode: "insensitive" };
    }

    // Fetch turfs
    const allTurfs = await prisma.turf.findMany({
      where: whereClause,
      include: {
        images: {
          select: { url: true },
          take: 1,
        },
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
    });

    const now = new Date();

    // Attach dynamic pricing quote and GPS distance to each turf
    const enhancedTurfs = allTurfs.map((turf) => {
      const distance =
        turf.latitude && turf.longitude
          ? haversineDistanceKm(userLat!, userLng!, turf.latitude, turf.longitude)
          : 5.0;

      const dynamicQuote = calculateDynamicSlotPrice(turf.basePricePerHour, now, {
        venueRating: turf.rating,
      });

      return {
        id: turf.id,
        name: turf.name,
        slug: turf.slug,
        city: turf.city,
        area: turf.area,
        address: turf.address,
        coverImage: turf.coverImage,
        pitchFormats: turf.pitchFormats,
        basePricePerHour: turf.basePricePerHour,
        currentDynamicPrice: dynamicQuote.finalPrice,
        priceMultiplier: dynamicQuote.multiplier,
        pricingBadge: dynamicQuote.badgeText,
        rating: turf.rating,
        reviewCount: turf.reviewCount || turf._count.reviews,
        totalBookings: turf._count.bookings,
        distanceKm: distance,
        distanceLabel: `${distance} km away`,
        hasFloodlights: turf.hasFloodlights,
        hasParking: turf.hasParking,
        hasChangingRoom: turf.hasChangingRoom,
        hasWashroom: turf.hasWashroom,
        hasWater: turf.hasWater,
      };
    });

    // 1. Shelf: Near You (Sorted by Haversine Distance)
    const nearYouTurfs = [...enhancedTurfs]
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 8);

    // 2. Shelf: Best Deals & Off-Peak Savers (Sorted by basePricePerHour & multiplier ASC)
    const bestDealsTurfs = [...enhancedTurfs]
      .sort((a, b) => a.currentDynamicPrice - b.currentDynamicPrice)
      .slice(0, 8);

    // 3. Shelf: Community Favorites (Rating >= 4.7, Sorted by Rating & Bookings)
    const communityFavoritesTurfs = [...enhancedTurfs]
      .sort((a, b) => b.rating - a.rating || b.totalBookings - a.totalBookings)
      .slice(0, 8);

    // 4. Shelf: Top Picks For You (Verified pitches with full amenities)
    const topPicksTurfs = [...enhancedTurfs]
      .filter((t) => t.hasFloodlights && t.hasParking)
      .sort((a, b) => b.totalBookings - a.totalBookings || b.rating - a.rating)
      .slice(0, 8);

    // 5. Shelf: Squads Needing Players (Open Matchmaking Posts)
    const matchWhere: any = {
      status: "OPEN",
      openSpots: { gt: 0 },
      matchTime: { gte: now },
    };

    if (cityParam && cityParam !== "All") {
      matchWhere.turf = { city: { equals: cityParam, mode: "insensitive" } };
    }

    const openMatches = await prisma.matchPost.findMany({
      where: matchWhere,
      include: {
        turf: {
          select: {
            name: true,
            slug: true,
            area: true,
            city: true,
            coverImage: true,
            basePricePerHour: true,
          },
        },
        hostUser: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { matchTime: "asc" },
      take: 6,
    });

    return NextResponse.json({
      success: true,
      meta: {
        referenceCoords: { lat: userLat, lng: userLng },
        totalVenuesFound: enhancedTurfs.length,
      },
      shelves: [
        {
          id: "near_you",
          title: "Near You",
          subtitle: "Pitches closest to your current location (GPS Haversine)",
          icon: "MapPin",
          turfs: nearYouTurfs,
        },
        {
          id: "best_deals",
          title: "Best Deals & Off-Peak Savers",
          subtitle: "Quality pitches with competitive pricing and off-peak discounts",
          icon: "Tag",
          turfs: bestDealsTurfs,
        },
        {
          id: "community_favorites",
          title: "Community Favorites",
          subtitle: "Top rated pitches by local amateur football squads",
          icon: "Star",
          turfs: communityFavoritesTurfs,
        },
        {
          id: "top_picks",
          title: "Top Picks For You",
          subtitle: "Verified pitches equipped with floodlights and dedicated parking",
          icon: "Sparkles",
          turfs: topPicksTurfs,
        },
      ],
      squadsShelf: {
        id: "squads_needing_players",
        title: "Squads Needing Players",
        subtitle: "Upcoming match sessions missing players — reserve your spot now",
        icon: "Users",
        matches: openMatches.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          sportFormat: m.sportFormat,
          matchTime: m.matchTime.toISOString(),
          area: m.area,
          totalSpots: m.totalSpots,
          openSpots: m.openSpots,
          costPerPlayer: m.costPerPlayer,
          turf: m.turf,
          hostName: m.hostUser?.name || "Match Captain",
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching discovery shelves:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to load discovery shelves." } },
      { status: 500 }
    );
  }
}
