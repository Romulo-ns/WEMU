"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProfileCommunities from "@/components/ProfileCommunities";
import { 
  AddFriendButton, 
  AcceptFriendButton, 
  RejectFriendButton, 
  RemoveFriendButton, 
  CancelRequestButton 
} from "@/components/FriendButtons";

interface ProfileData {
  _id: string;
  name: string;
  image: string;
  bio: string;
  tags: string[];
  spotifyId: string | null;
  googleId: string | null;
  createdAt: string;
}

interface CommunityItem {
  _id: string;
  name: string;
  description: string;
  members?: string[];
  createdAt: string;
}

type FriendshipStatus = "none" | "pending_sent" | "pending_received" | "accepted";

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [communitiesCreated, setCommunitiesCreated] = useState<CommunityItem[]>([]);
  const [communitiesJoined, setCommunitiesJoined] = useState<CommunityItem[]>([]);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>("none");
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/${id}/profile`);
      if (!res.ok) {
        if (res.status === 404) {
          router.push("/404");
          return;
        }
        throw new Error("Failed to fetch profile");
      }
      const data = await res.json();
      
      setProfile(data.user);
      setCommunitiesCreated(data.communitiesCreated);
      setCommunitiesJoined(data.communitiesJoined);
      setFriendshipStatus(data.friendshipStatus);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    // If it's the user's own profile, redirect to the editable profile page
    if (session?.user && (session.user as any).id === id) {
      router.replace("/profile");
      return;
    }
    fetchProfile();
  }, [id, session, router, fetchProfile]);

  if (loading) {
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in relative z-10">
      {/* Background Decorations */}
      <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      {/* Hero Card */}
      <div className="glass-card p-8 md:p-12 mb-12 relative overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/20 rounded-full blur-[100px]" />

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          {/* Avatar */}
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="w-40 h-40 rounded-full border-4 border-wemu-primary/30 object-cover shadow-2xl shadow-purple-500/20"
            />
          ) : (
            <div className="w-40 h-40 rounded-full bg-wemu-primary/20 border-4 border-wemu-primary/30 flex items-center justify-center shadow-2xl shadow-purple-500/20">
              <span className="text-6xl font-bold text-white/50">{profile.name?.charAt(0)}</span>
            </div>
          )}

          {/* Info */}
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
              <div>
                <h1 className="text-5xl font-extrabold tracking-tight text-gradient py-1">{profile.name}</h1>
                <p className="text-gray-400 mt-1 font-medium italic">WEMU Explorer</p>
              </div>

              {/* Action Buttons */}
              {session?.user && (
                <div className="flex gap-3 min-w-[160px]">
                  {friendshipStatus === "none" && <AddFriendButton targetId={profile._id} />}
                  {friendshipStatus === "pending_sent" && <CancelRequestButton recipientId={profile._id} />}
                  {friendshipStatus === "pending_received" && (
                    <div className="flex gap-2">
                      <AcceptFriendButton requesterId={profile._id} />
                      <RejectFriendButton requesterId={profile._id} />
                    </div>
                  )}
                  {friendshipStatus === "accepted" && <RemoveFriendButton friendId={profile._id} />}
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mb-6">
                <p className="text-gray-200 text-lg max-w-xl leading-relaxed font-medium">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Tags */}
            {profile.tags && profile.tags.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                {profile.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <span
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
                  profile.spotifyId
                    ? "bg-spotify-green/10 text-spotify-green border-spotify-green/20 shadow-[0_0_15px_rgba(30,215,96,0.1)]"
                    : "bg-white/5 text-gray-400 border-white/10"
                }`}
              >
                {profile.spotifyId ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.001 10.62 18.661 12.9c.42.18.6.78.3 1.14zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.261 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.42z"/>
                    </svg>
                    Spotify Active
                  </>
                ) : (
                  "Standard Explorer"
                )}
              </span>
              <span className="bg-white/5 px-5 py-2.5 rounded-full text-xs font-bold border border-white/10 text-gray-300">
                Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : "Recently"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Communities Section */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight">Communities</h2>
            <p className="text-gray-500 font-medium">Shared music spaces where this user hangs out</p>
          </div>
        </div>
        <ProfileCommunities
          communitiesCreated={communitiesCreated}
          communitiesJoined={communitiesJoined}
        />
      </div>
    </div>
  );
}
