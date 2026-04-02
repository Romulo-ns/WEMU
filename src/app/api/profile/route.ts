import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models/User";
import { Community } from "@/lib/models/Community";

const ALLOWED_TAGS = [
  "rock", "pop", "hip-hop", "r&b", "jazz", "blues", "metal", "punk", "indie",
  "electronic", "edm", "house", "techno", "dubstep", "drum & bass",
  "classical", "country", "folk", "reggae", "latin", "k-pop", "j-pop",
  "soul", "funk", "gospel", "lo-fi", "ambient", "trap", "phonk", "mpb",
  "samba", "bossa nova", "pagode", "sertanejo", "forró", "kizomba", "afrobeat"
];

async function getSpotifyData(url: string, accessToken: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findOne({ email: session.user.email }).select(
    "name email image bio tags createdAt spotifyId googleId"
  );

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Fetch communities created by user
  const communitiesCreated = await Community.find({ creatorId: user._id })
    .select("name description members createdAt")
    .lean();

  // Fetch communities joined (where user is a member but NOT the creator)
  const communitiesJoined = await Community.find({
    members: user._id,
    creatorId: { $ne: user._id },
  })
    .select("name description members createdAt")
    .lean();

  // Fetch Spotify Stats if connected
  let topArtists = null;
  let topTracks = null;
  const accessToken = (session as any).accessToken;

  if (accessToken && user.spotifyId) {
    [topArtists, topTracks] = await Promise.all([
      getSpotifyData("https://api.spotify.com/v1/me/top/artists?limit=4", accessToken),
      getSpotifyData("https://api.spotify.com/v1/me/top/tracks?limit=4", accessToken),
    ]);
  }

  return NextResponse.json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image || "",
      bio: user.bio || "",
      tags: user.tags || [],
      spotifyId: user.spotifyId || null,
      googleId: user.googleId || null,
      createdAt: user.createdAt,
    },
    communitiesCreated,
    communitiesJoined,
    allowedTags: ALLOWED_TAGS,
    spotifyStats: {
      topArtists: topArtists?.items || [],
      topTracks: topTracks?.items || [],
    },
  });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { bio, tags, image } = body;

  // Validate bio
  if (bio !== undefined) {
    if (typeof bio !== "string") {
      return NextResponse.json({ error: "Bio must be a string" }, { status: 400 });
    }
    if (bio.trim().length > 160) {
      return NextResponse.json({ error: "Bio must be 160 characters or less" }, { status: 400 });
    }
  }

  // Validate tags
  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      return NextResponse.json({ error: "Tags must be an array" }, { status: 400 });
    }
    if (tags.length > 5) {
      return NextResponse.json({ error: "Maximum 5 tags allowed" }, { status: 400 });
    }

    const normalizedTags = tags.map((t: string) => t.toLowerCase().trim());
    const uniqueTags = [...new Set(normalizedTags)];

    if (uniqueTags.length !== normalizedTags.length) {
      return NextResponse.json({ error: "Duplicate tags are not allowed" }, { status: 400 });
    }

    const invalidTags = uniqueTags.filter((t) => !ALLOWED_TAGS.includes(t));
    if (invalidTags.length > 0) {
      return NextResponse.json(
        { error: `Invalid tags: ${invalidTags.join(", ")}` },
        { status: 400 }
      );
    }
  }

  // Validate image URL
  if (image !== undefined && image !== "") {
    if (typeof image !== "string") {
      return NextResponse.json({ error: "Image must be a string URL" }, { status: 400 });
    }
    // Accept Cloudinary URLs and common OAuth provider URLs
    const validUrlPattern = /^https:\/\/(res\.cloudinary\.com|lh3\.googleusercontent\.com|i\.scdn\.co|platform-lookaside\.fbsbx\.com|avatars\.githubusercontent\.com)\//;
    if (!validUrlPattern.test(image)) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }
  }

  await dbConnect();

  const updateData: Record<string, unknown> = {};
  if (bio !== undefined) updateData.bio = bio.trim();
  if (tags !== undefined) updateData.tags = tags.map((t: string) => t.toLowerCase().trim());
  if (image !== undefined) updateData.image = image;

  const updatedUser = await User.findOneAndUpdate(
    { email: session.user.email },
    { $set: updateData },
    { new: true, runValidators: true }
  ).select("name email image bio tags createdAt spotifyId googleId");

  if (!updatedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: updatedUser });
}
