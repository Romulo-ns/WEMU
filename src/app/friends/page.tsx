import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models/User";
import { Community } from "@/lib/models/Community";
import Link from "next/link";

export const revalidate = 0;

export default async function FriendsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  await dbConnect();
  
  // For this iteration, we treat all other registered users as the "Network/Friends"
  const currentUserEmail = session.user.email;
  const users = await User.find({ email: { $ne: currentUserEmail } }).limit(20);

  // Find their latest communities
  const usersWithActivity = await Promise.all(users.map(async (u) => {
    // Find communities this user is a member of
    const userCommunities = await Community.find({ members: u._id })
      .sort({ updatedAt: -1 })
      .limit(1)
      .select("name _id");
      
    return {
      _id: u._id.toString(),
      name: u.name,
      image: u.image,
      bio: u.bio,
      latestCommunity: userCommunities.length > 0 ? userCommunities[0] : null
    };
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in relative z-10">
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="mb-12">
        <h1 className="text-5xl font-extrabold text-gradient drop-shadow-sm mb-4">Your Network</h1>
        <p className="text-xl text-gray-400">Discover what your friends are listening to and which communities they hang out in.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {usersWithActivity.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
            <p className="text-xl text-gray-400 mb-4 font-bold">No other users found yet.</p>
            <p className="text-gray-500 text-sm">Be the first to invite your friends!</p>
          </div>
        ) : (
          usersWithActivity.map((friend) => (
            <div key={friend._id} className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:-translate-y-2 transition-transform duration-300 border border-white/5 hover:border-white/20">
              {friend.image ? (
                <img src={friend.image} alt={friend.name} className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-pink-500/30" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center text-3xl font-bold border-2 border-purple-500/30">
                  {friend.name.charAt(0)}
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-bold text-white max-w-full truncate">{friend.name}</h3>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2 min-h-[40px] px-2">{friend.bio || "No bio available."}</p>
              </div>

              <div className="w-full pt-4 border-t border-white/10 mt-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-400 block mb-2">Latest Activity</span>
                {friend.latestCommunity ? (
                  <Link href={`/communities/${friend.latestCommunity._id}`} className="inline-block bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-medium transition-colors w-full truncate border border-white/5">
                    🎵 {friend.latestCommunity.name}
                  </Link>
                ) : (
                  <span className="inline-block bg-black/20 px-4 py-2 rounded-xl text-sm text-gray-500 font-medium w-full truncate border border-transparent">
                    💤 No recent activity
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
