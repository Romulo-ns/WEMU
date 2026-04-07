import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models/User";
import { Community } from "@/lib/models/Community";
import { Friendship } from "@/lib/models/Friendship";
import FriendsTabs from "./FriendsTabs";

export const revalidate = 0;

export default async function FriendsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  await dbConnect();
  
  const currentUserId = (session.user as any).id;

  // 1. Fetch all friendships relevant to the current user
  const relatedFriendships = await Friendship.find({
    $or: [{ requester: currentUserId }, { recipient: currentUserId }]
  });

  // 2. Categorize the user IDs
  const friendIds = new Set<string>();
  const incomingReqIds = new Set<string>();
  const outgoingReqIds = new Set<string>();

  relatedFriendships.forEach(f => {
    const isRequester = f.requester.toString() === currentUserId;
    const otherUserId = isRequester ? f.recipient.toString() : f.requester.toString();

    if (f.status === 'accepted') {
      friendIds.add(otherUserId);
    } else if (f.status === 'pending') {
      if (isRequester) {
        outgoingReqIds.add(otherUserId);
      } else {
        incomingReqIds.add(otherUserId);
      }
    }
  });

  const allNetworkIds = [...friendIds, ...incomingReqIds, ...outgoingReqIds];

  // 3. Find full user documents for these IDs
  const networkUsers = await User.find({ _id: { $in: allNetworkIds } });

  // 4. Find exactly 20 other users for the "Discover" section (excluding current user and already connected users)
  const discoverUsers = await User.find({
    _id: { $nin: [...allNetworkIds, currentUserId] }
  }).limit(20);

  // Helper function to map basic user doc to NetworkUser shape
  async function mapToNetworkUser(docs: any[]) {
    return Promise.all(docs.map(async (u) => {
      // Find latest community
      const latest = await Community.find({ members: u._id })
        .sort({ updatedAt: -1 })
        .limit(1)
        .select("name _id");
        
      return {
        _id: u._id.toString(),
        name: u.name,
        image: u.image,
        bio: u.bio,
        latestCommunity: latest.length > 0 ? { _id: latest[0]._id.toString(), name: latest[0].name } : null
      };
    }));
  }

  // 5. Build the four arrays
  const friendsArray = networkUsers.filter(u => friendIds.has(u._id.toString()));
  const incomingArray = networkUsers.filter(u => incomingReqIds.has(u._id.toString()));
  const outgoingArray = networkUsers.filter(u => outgoingReqIds.has(u._id.toString()));

  const mappedFriends = await mapToNetworkUser(friendsArray);
  const mappedIncoming = await mapToNetworkUser(incomingArray);
  const mappedOutgoing = await mapToNetworkUser(outgoingArray);
  const mappedDiscover = await mapToNetworkUser(discoverUsers);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in relative z-10 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="mb-16 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black text-gradient tracking-tighter py-1">Your Network</h1>
          <p className="text-gray-400 max-w-xl font-medium">Manage your connections, discover like-minded people, and stay tuned to the music they're exploring.</p>
        </div>
      </div>

      <FriendsTabs 
        friends={mappedFriends} 
        incomingRequests={mappedIncoming} 
        outgoingRequests={mappedOutgoing} 
        discover={mappedDiscover} 
      />
    </div>
  );
}
