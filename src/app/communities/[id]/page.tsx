import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Community } from "@/lib/models/Community";
import { User } from "@/lib/models/User";
import Link from "next/link";
import SpotifySearch from "@/components/SpotifySearch";
import ExportPlaylistButton from "@/components/ExportPlaylistButton";
import CommunityWall from "@/components/CommunityWall";
import CommunityPlaylistPlayer from "@/components/CommunityPlaylistPlayer";
import SpotifyLoginButton from "@/components/SpotifyLoginButton";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

export const revalidate = 0;

export default async function CommunityDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  await dbConnect();
  
  let community;
  try {
    community = await Community.findById(id)
      .populate('creatorId', 'name image')
      .populate('members', 'name image')
      .populate('tracks.addedBy', 'name image')
      .exec();
  } catch (e) {
    return notFound();
  }

  if (!community) return notFound();

  const isMember = !!(session?.user && community.members.some((m: any) => m._id.toString() === (session.user as any).id));
  const isAuthenticatedSpotify = !!(session as any)?.accessToken;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
      <div className="glass-card p-8 md:p-12 mb-10 relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div className="flex-1">
            <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">{community.name}</h1>
            <p className="text-gray-400">
              Created by <Link href={`/profile/${(community.creatorId as any)?._id}`} className="text-purple-400 hover:text-purple-300 font-bold underline transition-colors">{(community.creatorId as any)?.name || "Unknown"}</Link>
            </p>
          </div>
          
          {!isMember && session?.user ? (
            <form action={async () => {
              'use server';
              await dbConnect();
              const userId = (session.user as any).id;
              await Community.findByIdAndUpdate(id, { $addToSet: { members: userId } });
              revalidatePath(`/communities/${id}`);
            }}>
              <button type="submit" className="bg-white/10 hover:bg-white/20 font-bold px-8 py-3 rounded-full border border-white/10 transition-colors shadow-lg">
                Join Community
              </button>
            </form>
          ) : isMember && session?.user && (community.creatorId as any)?._id.toString() !== (session.user as any).id ? (
            <form action={async () => {
              'use server';
              await dbConnect();
              const userId = (session.user as any).id;
              await Community.findByIdAndUpdate(id, { $pull: { members: userId } });
              revalidatePath(`/communities/${id}`);
            }}>
              <button type="submit" className="bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-400 font-bold px-8 py-3 rounded-full border border-white/10 hover:border-red-500/30 transition-colors shadow-lg flex items-center gap-2 text-sm">
                Leave Community
              </button>
            </form>
          ) : null}
        </div>
        
        <div className="relative z-10">
          <p className="text-xl text-gray-300 mb-8 max-w-3xl leading-relaxed">{community.description}</p>
          <div className="flex gap-4 items-center flex-wrap">
             <span className="flex items-center gap-2 bg-white/5 border border-white/5 px-5 py-2 rounded-full text-gray-300 font-bold">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
               {community.members.length} Member{community.members.length !== 1 && 's'}
             </span>
             <span className="bg-white/5 border border-white/5 px-5 py-2 rounded-full text-gray-400 text-sm font-medium">
                Est. {new Date(community.createdAt).getFullYear()}
             </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 border border-white/10 shadow-xl">
            <h2 className="text-3xl font-bold mb-8 flex items-center justify-between">
              <span className="text-gradient">Shared Data Playlist</span>
              <div className="flex items-center gap-3">
                <span className="text-sm bg-purple-500/20 text-purple-300 border border-purple-500/30 px-4 py-1.5 rounded-full uppercase tracking-wider">{community.tracks.length} Tracks</span>
                {isAuthenticatedSpotify && isMember && (
                  <ExportPlaylistButton communityId={community._id.toString()} trackCount={community.tracks.length} />
                )}
              </div>
            </h2>
            
            <CommunityPlaylistPlayer tracks={community.tracks.map((t: any) => ({
              _id: t._id?.toString(),
              spotifyId: t.spotifyId,
              name: t.name,
              artist: t.artist,
              albumImageUrl: t.albumImageUrl,
              addedBy: t.addedBy ? {
                _id: t.addedBy._id?.toString(),
                name: t.addedBy.name,
                image: t.addedBy.image
              } : undefined,
              addedAt: t.addedAt.toISOString()
            }))} />
          </div>

          <CommunityWall communityId={community._id.toString()} isMember={isMember} />
        </div>

        <div className="space-y-8">
          <div className="glass-card p-6 md:p-8 border border-white/10 shadow-xl overflow-hidden relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[50px] -z-10"></div>
             <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.001 10.62 18.661 12.9c.42.18.6.78.3 1.14zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.261 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.42z"/>
                </svg>
                Add a Track
             </h2>
             {isAuthenticatedSpotify ? (
               <SpotifySearch communityId={community._id.toString()} accessToken={(session as any).accessToken} />
             ) : (
                <div className="p-6 text-center border border-white/10 rounded-2xl bg-black/20">
                  <p className="text-gray-400 mb-6 font-medium">You must be logged in with Spotify to add tracks directly to the community.</p>
                  <SpotifyLoginButton />
                </div>
             )}
          </div>

          <div className="glass-card p-6 md:p-8 border border-white/10 shadow-xl bg-white/5">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-pink-400">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               Rules & Info
            </h2>
            {community.rules ? (
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm p-5 bg-black/40 rounded-xl border border-white/5 custom-scrollbar max-h-64 overflow-y-auto font-medium">
                {community.rules}
              </div>
            ) : (
              <p className="text-gray-500 italic p-6 text-center bg-black/20 rounded-xl">No explicit rules have been set. Be nice!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
