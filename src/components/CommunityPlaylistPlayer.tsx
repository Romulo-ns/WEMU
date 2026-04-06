"use client";

import React, { useState } from "react";

interface Track {
  _id?: string;
  spotifyId: string;
  name: string;
  artist: string;
  albumImageUrl: string;
  addedBy?: {
    _id: string;
    name: string;
    image?: string;
  };
  addedAt: Date | string;
}

interface CommunityPlaylistPlayerProps {
  tracks: Track[];
}

export default function CommunityPlaylistPlayer({ tracks }: CommunityPlaylistPlayerProps) {
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);

  const sortedTracks = [...tracks].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

  return (
    <div className="space-y-6">
      {/* Player Section */}
      {activeTrack && (
        <div className="glass-card p-4 md:p-6 border border-pink-500/30 shadow-2xl relative overflow-hidden animate-fade-in z-20">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 z-0"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/3 flex items-center gap-4">
              <div className="w-20 h-20 shrink-0 relative rounded-xl overflow-hidden shadow-lg border border-white/10">
                <img 
                  src={activeTrack.albumImageUrl || '/api/placeholder/400/400'} 
                  alt={activeTrack.name} 
                  className="w-full h-full object-cover animate-spin-slow"
                  style={{ animationDuration: '8s' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-4 h-4 bg-black rounded-full border border-gray-600"></div>
                </div>
              </div>
              <div className="flex-1 overflow-hidden h-full flex flex-col justify-center">
                <span className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-1 shadow-sm">Now Playing</span>
                <h3 className="text-xl font-extrabold text-white truncate shadow-sm">{activeTrack.name}</h3>
                <p className="text-sm text-gray-300 truncate font-medium">{activeTrack.artist}</p>
              </div>
            </div>
            
            <div className="w-full md:w-2/3 h-[152px] bg-black/40 rounded-xl overflow-hidden shadow-inner border border-white/5 relative">
               {!activeTrack.spotifyId ? (
                 <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Track not playable
                 </div>
               ) : (
                 <iframe 
                   src={`https://open.spotify.com/embed/track/${activeTrack.spotifyId}?utm_source=generator&theme=0`} 
                   width="100%" 
                   height="152" 
                   frameBorder="0" 
                   allowFullScreen 
                   allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                   loading="lazy"
                   className="rounded-xl shadow-lg"
                 ></iframe>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Tracks List */}
      {sortedTracks.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
          <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <p className="text-gray-400 font-medium text-lg">The playlist is empty.</p>
          <p className="text-gray-500 text-sm">Use the search panel to add your favorites!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTracks.map((track) => {
            const isPlaying = activeTrack?._id ? activeTrack._id === track._id : activeTrack?.spotifyId === track.spotifyId;
            
            return (
              <div 
                key={track._id || track.spotifyId} 
                onClick={() => setActiveTrack(track)}
                className={`flex items-center gap-5 p-4 rounded-2xl transition-all group cursor-pointer border ${isPlaying ? 'bg-white/10 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)]' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'}`}
              >
                <div className="relative w-16 h-16 shrink-0 transition-transform duration-300">
                  <img src={track.albumImageUrl || '/api/placeholder/400/400'} alt={track.name} className={`w-full h-full rounded-xl shadow-lg object-cover ${isPlaying ? 'opacity-80 scale-105' : 'group-hover:scale-105'}`} />
                  <div className={`absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <svg className={`w-8 h-8 ${isPlaying ? 'text-pink-500' : 'text-white'}`} fill="currentColor" viewBox="0 0 24 24">
                      {isPlaying ? (
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /> // Pause icon
                      ) : (
                        <path d="M8 5v14l11-7z" /> // Play icon
                      )}
                    </svg>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className={`text-lg font-bold truncate transition-colors ${isPlaying ? 'text-pink-400' : 'text-white group-hover:text-pink-200'}`}>
                    {track.name}
                  </h3>
                  <p className={`text-sm truncate ${isPlaying ? 'text-pink-200/70' : 'text-gray-400'}`}>
                    {track.artist}
                  </p>
                </div>
                <div className="hidden sm:flex flex-col items-end text-xs text-gray-500 gap-1 bg-black/20 p-2 rounded-lg">
                  <span className="flex items-center gap-2">
                    {track.addedBy?.image ? (
                        <img src={track.addedBy.image} alt={track.addedBy.name} className="w-4 h-4 rounded-full"/>
                    ) : (
                        <div className="w-4 h-4 rounded-full bg-purple-500/50"></div>
                    )}
                    {track.addedBy?.name || "Unknown"}
                  </span>
                  <span className="font-mono">{new Date(track.addedAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
