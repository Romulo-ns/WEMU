"use client";

import { useState } from "react";
import Link from "next/link";
import { AddFriendButton, AcceptFriendButton, RejectFriendButton, RemoveFriendButton, CancelRequestButton } from "@/components/FriendButtons";

type NetworkUser = {
  _id: string;
  name: string;
  image?: string;
  bio?: string;
  latestCommunity?: { _id: string; name: string } | null;
};

export default function FriendsTabs({
  friends,
  incomingRequests,
  outgoingRequests,
  discover,
}: {
  friends: NetworkUser[];
  incomingRequests: NetworkUser[];
  outgoingRequests: NetworkUser[];
  discover: NetworkUser[];
}) {
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "discover">("friends");

  const totalRequests = incomingRequests.length;

  const renderUserCard = (user: NetworkUser, actionType: "add" | "accept-reject" | "remove" | "cancel") => (
    <div key={user._id} className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:-translate-y-2 transition-transform duration-300 border border-white/5 hover:border-white/20">
      {user.image ? (
        <img src={user.image} alt={user.name} className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-pink-500/30" />
      ) : (
        <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center text-3xl font-bold border-2 border-purple-500/30">
          {user.name.charAt(0)}
        </div>
      )}
      
      <div className="flex-1 w-full">
        <h3 className="text-xl font-bold text-white max-w-full truncate">{user.name}</h3>
        <p className="text-sm text-gray-400 mt-1 line-clamp-2 min-h-[40px] px-2">{user.bio || "No bio available."}</p>
      </div>

      {/* Action Buttons */}
      <div className="w-full mt-2">
        {actionType === "add" && <AddFriendButton targetId={user._id} />}
        {actionType === "remove" && <RemoveFriendButton friendId={user._id} />}
        {actionType === "cancel" && <CancelRequestButton recipientId={user._id} />}
        {actionType === "accept-reject" && (
          <div className="flex gap-2">
            <AcceptFriendButton requesterId={user._id} />
            <RejectFriendButton requesterId={user._id} />
          </div>
        )}
      </div>

      <div className="w-full pt-4 border-t border-white/10 mt-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-pink-400 block mb-2">Latest Activity</span>
        {user.latestCommunity ? (
          <Link href={`/communities/${user.latestCommunity._id}`} className="inline-block bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-medium transition-colors w-full truncate border border-white/5">
            🎵 {user.latestCommunity.name}
          </Link>
        ) : (
          <span className="inline-block bg-black/20 px-4 py-2 rounded-xl text-sm text-gray-500 font-medium w-full truncate border border-transparent">
            💤 No recent activity
          </span>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Tabs Header */}
      <div className="flex justify-center mb-12">
        <div className="glass flex p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("friends")}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === "friends" ? "bg-white/20 text-white shadow-md" : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            My Friends ({friends.length})
          </button>
          
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "requests" ? "bg-white/20 text-white shadow-md" : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            Requests 
            {totalRequests > 0 && (
              <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">{totalRequests}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("discover")}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === "discover" ? "bg-white/20 text-white shadow-md" : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            Discover
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        
        {/* Friends Tab */}
        {activeTab === "friends" && (
          friends.length === 0 ? (
            <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
              <p className="text-xl text-gray-400 mb-4 font-bold">You haven't added any friends yet.</p>
              <button onClick={() => setActiveTab("discover")} className="text-purple-400 hover:text-purple-300 font-bold underline">Discover People</button>
            </div>
          ) : (
            friends.map(user => renderUserCard(user, "remove"))
          )
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <>
            {incomingRequests.length > 0 && (
              <div className="col-span-full mb-2">
                <h3 className="text-xl font-bold text-white mb-2">Incoming Requests</h3>
                <hr className="border-white/10" />
              </div>
            )}
            {incomingRequests.map(user => renderUserCard(user, "accept-reject"))}
            
            {outgoingRequests.length > 0 && (
              <div className="col-span-full mb-2 mt-4">
                <h3 className="text-xl font-bold text-gray-400 mb-2">Sent Requests</h3>
                <hr className="border-white/10" />
              </div>
            )}
            {outgoingRequests.map(user => renderUserCard(user, "cancel"))}
            
            {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
              <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                <p className="text-xl text-gray-400 font-bold">No pending requests.</p>
              </div>
            )}
          </>
        )}

        {/* Discover Tab */}
        {activeTab === "discover" && (
          discover.length === 0 ? (
            <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
              <p className="text-xl text-gray-400 font-bold">No new people to discover right now.</p>
            </div>
          ) : (
            discover.map(user => renderUserCard(user, "add"))
          )
        )}
      </div>
    </>
  );
}
