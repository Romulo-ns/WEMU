import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Community } from "@/lib/models/Community";
import { User } from "@/lib/models/User";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    const accessToken = (session as any)?.accessToken;

    if (!session || !accessToken) {
      return NextResponse.json(
        { message: "Spotify not connected or unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById((session.user as any).id);
    if (!user || !user.spotifyId) {
      return NextResponse.json(
        { message: "Spotify ID not found in database" },
        { status: 400 }
      );
    }

    const community = await Community.findById(id);
    if (!community || !community.tracks || community.tracks.length === 0) {
      return NextResponse.json(
        { message: "Community not found or has no tracks" },
        { status: 404 }
      );
    }

    const trackUris = community.tracks
      .slice(0, 100)
      .map((t: any) => t?.spotifyId)
      .filter(Boolean)
      .map((spotifyId: string) => `spotify:track:${spotifyId}`);

    if (trackUris.length === 0) {
      return NextResponse.json(
        { message: "No valid Spotify track URIs found" },
        { status: 400 }
      );
    }

    const createPlaylistRes = await fetch("https://api.spotify.com/v1/me/playlists", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `WEMU: ${community.name}`,
        description: `Exported from WEMU Community. A collection of ${community.tracks.length} tracks.`,
        public: false,
      }),
      cache: "no-store",
    });

    const createText = await createPlaylistRes.text();

    if (!createPlaylistRes.ok) {
      console.error("CREATE PLAYLIST ERROR:", createText);
      return NextResponse.json(
        {
          message: "Failed to create playlist",
          spotifyError: createText,
        },
        { status: 502 }
      );
    }

    const playlist = JSON.parse(createText);

    const addTracksRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlist.id}/items`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: trackUris,
        }),
        cache: "no-store",
      }
    );

    const addText = await addTracksRes.text();

    if (!addTracksRes.ok) {
      console.error("ADD TRACKS ERROR:", addText);
      return NextResponse.json(
        {
          message: "Playlist created, but failed to add tracks",
          playlistId: playlist.id,
          spotifyError: addText,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        message: "Success",
        playlistUrl: playlist.external_urls?.spotify,
        playlistId: playlist.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("EXPORT ERROR:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}