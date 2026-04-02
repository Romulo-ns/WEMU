"use client";

import Link from "next/link";

interface CommunityItem {
  _id: string;
  name: string;
  description: string;
  members?: string[];
  createdAt: string;
}

interface ProfileCommunitiesProps {
  communitiesCreated: CommunityItem[];
  communitiesJoined: CommunityItem[];
}

function CommunityCard({ community, badge }: { community: CommunityItem; badge?: string }) {
  return (
    <Link
      href={`/communities/${community._id}`}
      className="glass-card p-5 hover:bg-white/[0.07] transition-all duration-300 group border border-transparent hover:border-purple-500/20 block"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors truncate text-base">
            {community.name}
          </h4>
          <p className="text-sm text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
            {community.description}
          </p>
        </div>
        {badge && (
          <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {community.members?.length || 0} members
        </span>
      </div>
    </Link>
  );
}

export default function ProfileCommunities({
  communitiesCreated,
  communitiesJoined,
}: ProfileCommunitiesProps) {
  const hasNone = communitiesCreated.length === 0 && communitiesJoined.length === 0;

  if (hasNone) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
          <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-300 mb-2">No Communities Yet</h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
          Join or create a community to share music with others!
        </p>
        <Link href="/communities" className="btn-primary text-sm inline-flex">
          Explore Communities
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Communities Created */}
      {communitiesCreated.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <h3 className="text-2xl font-bold">
              <span className="text-gradient">Created</span>
            </h3>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              {communitiesCreated.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communitiesCreated.map((c) => (
              <CommunityCard key={c._id} community={c} badge="Creator" />
            ))}
          </div>
        </div>
      )}

      {/* Communities Joined */}
      {communitiesJoined.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <h3 className="text-2xl font-bold">
              <span className="text-gradient">Joined</span>
            </h3>
            <span className="text-xs font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
              {communitiesJoined.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communitiesJoined.map((c) => (
              <CommunityCard key={c._id} community={c} badge="Member" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
