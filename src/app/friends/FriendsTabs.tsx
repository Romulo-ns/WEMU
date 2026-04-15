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
  const [searchQuery, setSearchQuery] = useState("");

  const totalRequests = incomingRequests.length;

  const getFilteredUsers = (users: NetworkUser[]) => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const currentList = activeTab === "friends" ? friends : activeTab === "requests" ? [...incomingRequests, ...outgoingRequests] : discover;
  const filteredUsers = getFilteredUsers(currentList);

  const renderUserCard = (user: NetworkUser, actionType: "add" | "accept-reject" | "remove" | "cancel") => (
    <div key={user._id} className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:-translate-y-2 transition-transform duration-300 border border-white/5 hover:border-white/20 animate-fade-in group">
      <Link href={`/profile/${user._id}`} className="relative block group-hover:scale-105 transition-transform duration-300">
        {user.image ? (
          <img src={user.image} alt={user.name} className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-pink-500/30 group-hover:border-pink-500" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center text-3xl font-bold border-2 border-purple-500/30 text-white">
            {user.name.charAt(0)}
          </div>
        )}
      </Link>
      
      <div className="flex-1 w-full">
        <Link href={`/profile/${user._id}`}>
          <h3 className="text-xl font-bold text-white max-w-full truncate group-hover:text-pink-400 transition-colors uppercase tracking-tight">{user.name}</h3>
        </Link>
        <p className="text-sm text-gray-400 mt-1 line-clamp-2 min-h-[40px] px-2">{user.bio || "No bio available."}</p>
      </div>

      <div className="w-full mt-2">
        {actionType === "add" && <AddFriendButton targetId={user._id} />}
        {actionType === "remove" && <RemoveFriendButton friendId={user._id} />}
        {actionType === "cancel" && <CancelRequestButton recipientId={user._id} />}
        {actionType === "accept-reject" && (
           incomingRequests.find(ir => ir._id === user._id) ? (
             <div className="flex gap-2">
               <AcceptFriendButton requesterId={user._id} />
               <RejectFriendButton requesterId={user._id} />
             </div>
           ) : (
             <CancelRequestButton recipientId={user._id} />
           )
        )}
      </div>

      <div className="w-full pt-4 border-t border-white/10 mt-auto">
        <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400 block mb-2 opacity-60">Latest Activity</span>
        {user.latestCommunity ? (
          <Link href={`/communities/${user.latestCommunity._id}`} className="inline-block bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-semibold transition-colors w-full truncate border border-white/5">
            🎵 {user.latestCommunity.name}
          </Link>
        ) : (
          <span className="inline-block bg-black/20 px-4 py-2 rounded-xl text-xs text-gray-500 font-medium w-full truncate border border-transparent">
            💤 Idle
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-500 group-focus-within:text-pink-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeTab === 'friends' ? 'your friends' : activeTab === 'requests' ? 'requests' : 'new people'}...`}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all duration-300 backdrop-blur-sm group-hover:bg-white/10"
        />
      </div>

      {/* Tabs Header */}
      <div className="flex flex-wrap justify-center gap-4">
        {[
          { id: "friends", label: "My Friends", count: friends.length, color: "text-purple-400" },
          { id: "requests", label: "Requests", count: totalRequests, color: "text-pink-400" },
          { id: "discover", label: "Discovery", count: discover.length, color: "text-blue-400" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-8 py-3 rounded-full font-bold transition-all duration-300 flex items-center gap-3 ${
              activeTab === tab.id 
                ? "bg-white/10 border-white/20 text-white shadow-xl scale-105" 
                : "bg-white/5 border-transparent text-gray-500 hover:text-white hover:bg-white/10"
            } border`}
          >
            <span className={activeTab === tab.id ? tab.color : ""}>{tab.label}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/10 text-white" : "bg-black/20 text-gray-600"}`}>
              {tab.id === 'requests' ? totalRequests : tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeTab === "friends" && (
          getFilteredUsers(friends).length === 0 ? (
            <div className="col-span-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
               <p className="text-xl text-gray-400 mb-4 font-bold">No friends found.</p>
               <button onClick={() => setActiveTab("discover")} className="text-purple-400 hover:text-purple-300 font-bold underline">Discover People</button>
            </div>
          ) : (
            getFilteredUsers(friends).map(user => renderUserCard(user, "remove"))
          )
        )}

        {activeTab === "requests" && (
          getFilteredUsers([...incomingRequests, ...outgoingRequests]).length === 0 ? (
            <div className="col-span-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
              <p className="text-xl text-gray-400 font-bold">No requests found.</p>
            </div>
          ) : (
            <>
              {getFilteredUsers(incomingRequests).map(user => renderUserCard(user, "accept-reject"))}
              {getFilteredUsers(outgoingRequests).map(user => renderUserCard(user, "cancel"))}
            </>
          )
        )}

        {activeTab === "discover" && (
          getFilteredUsers(discover).length === 0 ? (
            <div className="col-span-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
              <p className="text-xl text-gray-400 font-bold">No results matching your search.</p>
            </div>
          ) : (
            getFilteredUsers(discover).map(user => renderUserCard(user, "add"))
          )
        )}
      </div>
    </div>
  );
}
