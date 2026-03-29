import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Community } from "@/lib/models/Community";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: communityId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    const { spotifyId, name, artist, albumImageUrl } = body;

    if (!spotifyId || !name || !artist) {
      return NextResponse.json({ message: "Missing track details" }, { status: 400 });
    }

    await dbConnect();
    const community = await Community.findById(communityId);
    if (!community) {
      return NextResponse.json({ message: "Community not found" }, { status: 404 });
    }

    // Auto-join the user if they add a track
    if (!community.members.includes(userId)) {
      community.members.push(userId);
    }

    // Prevent duplicate tracks in the same community
    const trackExists = community.tracks.some((t: any) => t.spotifyId === spotifyId);
    if (trackExists) {
        return NextResponse.json({ message: "Already in playlist" }, { status: 409 });
    }

    community.tracks.push({
      spotifyId,
      name,
      artist,
      albumImageUrl: albumImageUrl || "",
      addedBy: userId,
      addedAt: new Date()
    } as any);

    await community.save();

    return NextResponse.json({ message: "Track added successfully" }, { status: 200 });
  } catch (error) {
    console.error("Add track error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
