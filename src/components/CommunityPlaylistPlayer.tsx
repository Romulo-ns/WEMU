"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Track {
/* ... (lines 5-10) ... */
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
/* ... (lines 24-115) ... */
                <div className="hidden sm:flex flex-col items-end text-xs text-gray-500 gap-1 bg-black/20 p-2 rounded-lg">
                  <Link 
                    href={track.addedBy?._id ? `/profile/${track.addedBy._id}` : "#"} 
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 hover:text-pink-400 transition-colors"
                  >
                    {track.addedBy?.image ? (
                        <img src={track.addedBy.image} alt={track.addedBy.name} className="w-4 h-4 rounded-full"/>
                    ) : (
                        <div className="w-4 h-4 rounded-full bg-purple-500/50"></div>
                    )}
                    <span className="font-bold">{track.addedBy?.name || "Unknown"}</span>
                  </Link>
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
