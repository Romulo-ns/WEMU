import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Community } from "@/lib/models/Community";
import { User } from "@/lib/models/User";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const accessToken = (session as any)?.accessToken;

    if (!session || !accessToken) {
      return NextResponse.json({ message: "Spotify not connected or unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById((session.user as any).id);
    if (!user || !user.spotifyId) {
       return NextResponse.json({ message: "Spotify ID not found in database" }, { status: 400 });
    }

    const community = await Community.findById(id);
    if (!community || community.tracks.length === 0) {
      return NextResponse.json({ message: "Community not found or has no tracks" }, { status: 404 });
    }

    // 1. Create Playlist on Spotify
    const createPlaylistRes = await fetch(`https://api.spotify.com/v1/users/${user.spotifyId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `WEMU: ${community.name}`,
        description: `Exported from WEMU Community. A collection of ${community.tracks.length} tracks.`,
        public: false
      })
    });

    if (!createPlaylistRes.ok) {
      console.error("Spotify create playlist error:", await createPlaylistRes.text());
      return NextResponse.json({ message: "Failed to create Spotify playlist. Is your token valid?" }, { status: 502 });
    }

    const playlist = await createPlaylistRes.json();

    // 2. Add Tracks (Up to Spotify's limit of 100 per request. For MVP we slice at 100)
    const trackUris = community.tracks.slice(0, 100).map((t: any) => `spotify:track:${t.spotifyId}`);

    const addTracksRes = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uris: trackUris })
    });

    if (!addTracksRes.ok) {
       return NextResponse.json({ message: "Playlist created, but failed to add tracks" }, { status: 502 });
    }

    return NextResponse.json({ message: "Success", playlistUrl: playlist.external_urls.spotify }, { status: 200 });

  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
