import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models/User";

async function getTopArtists(accessToken: string) {
  const res = await fetch("https://api.spotify.com/v1/me/top/artists?limit=4", {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}

async function getTopTracks(accessToken: string) {
  const res = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=4", {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  await dbConnect();
  const dbUser = await User.findOne({ email: session.user.email });
  
  const accessToken = (session as any).accessToken;
  let topArtists = null;
  let topTracks = null;

  if (accessToken && dbUser?.spotifyId) {
    topArtists = await getTopArtists(accessToken);
    topTracks = await getTopTracks(accessToken);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="glass-card p-8 md:p-12 mb-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/20 rounded-full blur-[100px]"></div>
        
        {dbUser?.image ? (
          <img src={dbUser.image} alt={dbUser.name} className="w-40 h-40 rounded-full border-4 border-wemu-primary/50 object-cover z-10 shadow-lg shadow-purple-500/20" />
        ) : (
          <div className="w-40 h-40 rounded-full bg-wemu-primary/20 border-4 border-wemu-primary/50 flex items-center justify-center z-10 shadow-lg shadow-purple-500/20">
            <span className="text-6xl font-bold">{dbUser?.name?.charAt(0)}</span>
          </div>
        )}
        
        <div className="z-10 text-center md:text-left flex-1">
          <h1 className="text-5xl font-extrabold tracking-tight mb-3">{dbUser?.name}</h1>
          <p className="text-gray-400 text-lg mb-6">{dbUser?.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <span className={`px-5 py-2 rounded-full text-sm font-semibold border ${dbUser?.spotifyId ? 'bg-spotify-green/10 text-spotify-green border-spotify-green/30' : 'bg-white/10 text-white border-white/5'}`}>
              {dbUser?.spotifyId ? "🎧 Spotify Connected" : "✉️ Standard User"}
            </span>
            <span className="bg-white/10 px-5 py-2 rounded-full text-sm font-semibold border border-white/5">
              Member since {dbUser?.createdAt ? new Date(dbUser.createdAt).getFullYear() : "2026"}
            </span>
          </div>
        </div>
      </div>

      {!dbUser?.spotifyId ? (
        <div className="glass-card p-16 text-center shadow-xl">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
            <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">No Spotify Data Available</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            You logged in with Email and Password. Connect your Spotify account to see your personal listening retrospective, automatically generated from your live Spotify history!
          </p>
          <button className="btn-spotify inline-flex font-bold text-lg px-8 py-4">
            Connect Spotify Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-8 sm:p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span className="text-gradient">Top Artists</span>
              </h2>
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 px-4 py-1.5 rounded-full border border-pink-500/20">Recently Played</span>
            </div>
            
            {topArtists?.items?.length > 0 ? (
              <div className="space-y-4">
                {topArtists.items.map((artist: any, i: number) => (
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
                <p className="text-gray-500 italic font-medium">Not enough data on Spotify yet.</p>
              </div>
            )}
          </div>

          <div className="glass-card p-8 sm:p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span className="text-gradient">Top Tracks</span>
              </h2>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-4 py-1.5 rounded-full border border-purple-500/20">On Repeat</span>
            </div>
            
            {topTracks?.items?.length > 0 ? (
              <div className="space-y-4">
                {topTracks.items.map((track: any, i: number) => (
                  <div key={track.id} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 group cursor-pointer border border-transparent hover:border-white/10">
                     <span className="text-2xl font-black text-gray-600 group-hover:text-pink-500 transition-colors w-6 text-right">{i + 1}</span>
                    <img src={track.album?.images?.[0]?.url || 'https://via.placeholder.com/150'} alt={track.name} className="w-16 h-16 rounded-xl object-cover shadow-md group-hover:rotate-3 transition-transform duration-300" />
                    <div className="flex-1 overflow-hidden">
                      <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors truncate">{track.name}</h3>
                      <p className="text-sm text-gray-400 truncate mt-1">{track.artists?.map((a:any) => a.name).join(", ") || "Unknown Artist"}</p>
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
      )}
    </div>
  );
}
