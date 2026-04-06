"use client";

import { useState } from "react";
import Link from "next/link";

interface CommunityDoc {
  _id: string;
  name: string;
  description: string;
  creatorId?: {
    _id: string;
    name: string;
    image?: string;
  };
  members: string[];
}

interface CommunitiesTabsProps {
  managed: CommunityDoc[];
  joined: CommunityDoc[];
  discover: CommunityDoc[];
}

export default function CommunitiesTabs({ managed, joined, discover }: CommunitiesTabsProps) {
  const [activeTab, setActiveTab] = useState<'managed' | 'joined' | 'discover'>('discover');
  const [searchQuery, setSearchQuery] = useState("");

  const getFilteredList = (list: CommunityDoc[]) => {
    return list.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const activeList = activeTab === 'managed' ? managed : activeTab === 'joined' ? joined : discover;
  const filteredList = getFilteredList(activeList);

  const tabs = [
    { id: 'managed' as const, label: 'Owned', count: managed.length, color: 'text-purple-400' },
    { id: 'joined' as const, label: 'Joined', count: joined.length, color: 'text-pink-400' },
    { id: 'discover' as const, label: 'Discovery', count: discover.length, color: 'text-blue-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeTab === 'managed' ? 'your' : activeTab === 'joined' ? 'joined' : 'new'} communities...`}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 backdrop-blur-sm group-hover:bg-white/10"
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-3 rounded-full font-bold transition-all duration-300 flex items-center gap-3 ${
              activeTab === tab.id 
                ? "bg-white/10 border-white/20 text-white shadow-xl scale-105" 
                : "bg-white/5 border-transparent text-gray-500 hover:text-white hover:bg-white/10"
            } border`}
          >
            <span className={activeTab === tab.id ? tab.color : ""}>{tab.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/10 text-white" : "bg-black/20 text-gray-600"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredList.map((c) => (
          <Link 
            href={`/communities/${c._id}`} 
            key={c._id} 
            className="glass-card p-8 hover:-translate-y-2 hover:shadow-purple-500/20 transition-all duration-300 group cursor-pointer block border border-white/5 hover:border-white/20 animate-fade-in"
          >
            <h2 className="text-2xl font-extrabold mb-3 group-hover:text-pink-400 transition-colors break-words">{c.name}</h2>
            <p className="text-gray-400 mb-6 line-clamp-3 leading-relaxed text-sm">{c.description}</p>
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
              <span className="flex items-center gap-2 text-white/60 bg-white/5 px-3 py-1.5 rounded-full">
                 <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                 </svg>
                 {c.members?.length || 0} Members
              </span>
              <div className="flex items-center gap-2 text-gray-500">
                {c.creatorId?.image ? (
                  <img src={c.creatorId.image} alt={c.creatorId.name} className="w-6 h-6 rounded-full grayscale group-hover:grayscale-0 transition-all" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">
                    {(c.creatorId?.name || "U").charAt(0)}
                  </div>
                )}
                <span className="truncate max-w-[100px] group-hover:text-white transition-colors">{c.creatorId?.name || "Anonymous"}</span>
              </div>
            </div>
          </Link>
        ))}

        {filteredList.length === 0 && (
          <div className="col-span-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/5 animate-fade-in">
            <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-xl text-gray-400 mb-4 font-bold">No results for "{searchQuery}"</p>
            {activeTab === 'managed' ? (
              <Link href="/communities/new" className="text-pink-400 hover:text-pink-300 font-semibold hover:underline text-lg">Create community!</Link>
            ) : activeTab === 'discover' && searchQuery === "" ? (
              <p className="text-gray-500 lowercase">All communities have been discovered.</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
