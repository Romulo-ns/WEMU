"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProfileEditModal from "@/components/ProfileEditModal";
import ProfileCommunities from "@/components/ProfileCommunities";

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  image: string;
  bio: string;
  tags: string[];
  spotifyId: string | null;
  googleId: string | null;
  createdAt: string;
}

interface SpotifyStats {
  topArtists: any[];
  topTracks: any[];
}

interface CommunityItem {
  _id: string;
  name: string;
  description: string;
  members?: string[];
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [communitiesCreated, setCommunitiesCreated] = useState<CommunityItem[]>([]);
  const [communitiesJoined, setCommunitiesJoined] = useState<CommunityItem[]>([]);
  const [spotifyStats, setSpotifyStats] = useState<SpotifyStats>({ topArtists: [], topTracks: [] });
  const [allowedTags, setAllowedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProfile(data.user);
      setCommunitiesCreated(data.communitiesCreated);
      setCommunitiesJoined(data.communitiesJoined);
      setSpotifyStats(data.spotifyStats);
      setAllowedTags(data.allowedTags);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router, fetchProfile]);

  const handleSave = async (data: { bio: string; tags: string[]; image: string }) => {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to save");
    }

    const result = await res.json();
    setProfile((prev) => (prev ? { ...prev, ...result.user } : prev));
    
    // Update the session so the Navbar shows the new image/name
    await update({
      image: result.user.image,
      name: result.user.name,
    });

    setEditOpen(false);
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card p-8 md:p-12 mb-12 animate-pulse">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-40 h-40 rounded-full bg-white/10" />
            <div className="flex-1 space-y-4">
              <div className="h-10 bg-white/10 rounded-xl w-64" />
              <div className="h-5 bg-white/10 rounded-lg w-48" />
              <div className="h-4 bg-white/10 rounded-lg w-80" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      {/* Hero Card */}
      <div className="glass-card p-8 md:p-12 mb-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/20 rounded-full blur-[100px]" />

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          {/* Avatar */}
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="w-40 h-40 rounded-full border-4 border-wemu-primary/50 object-cover shadow-lg shadow-purple-500/20"
            />
          ) : (
            <div className="w-40 h-40 rounded-full bg-wemu-primary/20 border-4 border-wemu-primary/50 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-6xl font-bold">{profile.name?.charAt(0)}</span>
            </div>
          )}

          {/* Info */}
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-5xl font-extrabold tracking-tight">{profile.name}</h1>
              <button
                onClick={() => setEditOpen(true)}
                className="self-center md:self-auto px-4 py-1.5 rounded-full text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-all flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </button>
            </div>

            <p className="text-gray-400 text-lg mb-3">{profile.email}</p>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-200 text-base mb-4 max-w-xl leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Tags */}
            {profile.tags && profile.tags.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-5">
                {profile.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <span
                className={`px-5 py-2 rounded-full text-sm font-semibold border ${profile.spotifyId
                    ? "bg-spotify-green/10 text-spotify-green border-spotify-green/30"
                    : "bg-white/10 text-white border-white/5"
                  }`}
              >
                {profile.spotifyId ? "🎧 Spotify Connected" : "✉️ Standard User"}
              </span>
              <span className="bg-white/10 px-5 py-2 rounded-full text-sm font-semibold border border-white/5">
                Member since{" "}
                {profile.createdAt ? new Date(profile.createdAt).getFullYear() : "2026"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Communities Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-8">
          <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h2 className="text-3xl font-bold">
            <span className="text-gradient">Communities</span>
          </h2>
        </div>
        <ProfileCommunities
          communitiesCreated={communitiesCreated}
          communitiesJoined={communitiesJoined}
        />
      </div>

      {/* Spotify Stats Section */}
      {profile.spotifyId ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Top Artists */}
          <div className="glass-card p-8 sm:p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span className="text-gradient">Top Artists</span>
              </h2>
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 px-4 py-1.5 rounded-full border border-pink-500/20">Recently Played</span>
            </div>

            {spotifyStats.topArtists?.length > 0 ? (
              <div className="space-y-4">
                {spotifyStats.topArtists.map((artist: any, i: number) => (
                  <div key={artist.id} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 group cursor-pointer border border-transparent hover:border-white/10">
                    <span className="text-2xl font-black text-gray-600 group-hover:text-purple-500 transition-colors w-6 text-right">{i + 1}</span>
                    <img src={artist.images?.[0]?.url || 'https://via.placeholder.com/150'} alt={artist.name} className="w-16 h-16 rounded-full object-cover shadow-md group-hover:scale-110 transition-transform duration-500" />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">{artist.name}</h3>
                      <p className="text-sm text-gray-400 capitalize mt-1">{artist.genres?.slice(0, 2).join(" • ") || "Artist"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl">
                <p className="text-gray-500 italic font-medium">No Spotify data available yet.</p>
              </div>
            )}
          </div>

          {/* Top Tracks */}
          <div className="glass-card p-8 sm:p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span className="text-gradient">Top Tracks</span>
              </h2>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-4 py-1.5 rounded-full border border-purple-500/20">On Repeat</span>
            </div>

            {spotifyStats.topTracks?.length > 0 ? (
              <div className="space-y-4">
                {spotifyStats.topTracks.map((track: any, i: number) => (
                  <div key={track.id} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 group cursor-pointer border border-transparent hover:border-white/10">
                    <span className="text-2xl font-black text-gray-600 group-hover:text-pink-500 transition-colors w-6 text-right">{i + 1}</span>
                    <img src={track.album?.images?.[0]?.url || 'https://via.placeholder.com/150'} alt={track.name} className="w-16 h-16 rounded-xl object-cover shadow-md group-hover:rotate-3 transition-transform duration-300" />
                    <div className="flex-1 overflow-hidden">
                      <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors truncate">{track.name}</h3>
                      <p className="text-sm text-gray-400 truncate mt-1">{track.artists?.map((a: any) => a.name).join(", ") || "Unknown Artist"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl">
                <p className="text-gray-500 italic font-medium">Keep listening to generate stats!</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card p-16 text-center shadow-xl mb-12">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">No Spotify Stats</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect your Spotify account to see your personal listening history!
          </p>
          <button className="btn-spotify inline-flex font-bold text-lg px-8 py-4">
            Connect Spotify Now
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <ProfileEditModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        currentBio={profile.bio}
        currentTags={profile.tags}
        currentImage={profile.image}
        allowedTags={allowedTags}
      />
    </div>
  );
}
