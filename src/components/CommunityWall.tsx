"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Message {
  _id: string;
  content: string;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    image?: string;
  };
}

interface CommunityWallProps {
  communityId: string;
  isMember: boolean;
}

export default function CommunityWall({ communityId, isMember }: CommunityWallProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [communityId]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/communities/${communityId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || posting) return;

    setPosting(true);
    setError(null);

    try {
      const res = await fetch(`/api/communities/${communityId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (res.ok) {
        const newMessage = await res.json();
        setMessages((prev) => [newMessage, ...prev]);
        setNewContent("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to post message");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setPosting(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-white mb-8 flex items-center gap-3">
        <span className="text-gradient">Community Wall</span>
        <span className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-400 font-medium">Scraps</span>
      </h2>

      {/* Post Form - Only for members */}
      {isMember ? (
        <form onSubmit={handlePost} className="glass-card p-6 mb-8 border-purple-500/20">
          <label className="block text-sm font-bold text-purple-400 mb-3 uppercase tracking-wider">Leave a message</label>
          <div className="flex flex-col gap-4">
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="What's on your mind? Share something with the community..."
              className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none h-24"
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">
                {newContent.length}/500 characters
              </span>
              <button
                type="submit"
                disabled={posting || !newContent.trim()}
                className="btn-primary py-2 px-8 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {posting ? "Posting..." : "Post Message"}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs font-bold mt-2">{error}</p>}
          </div>
        </form>
      ) : (
        <div className="glass-card p-6 mb-8 text-center bg-purple-500/5 border-purple-500/20">
          <p className="text-gray-400 text-sm font-medium">
            You must be a member of this community to post on the mural.
          </p>
        </div>
      )}

      {/* Messages List */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 h-24 animate-pulse bg-white/5"></div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 px-8 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
            <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-400 font-bold">No messages yet.</p>
            <p className="text-gray-500 text-sm">Be the first to say something!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className="glass-card p-6 flex gap-4 hover:border-white/20 transition-all group">
              <div className="shrink-0">
                {msg.userId.image ? (
                  <img src={msg.userId.image} alt={msg.userId.name} className="w-12 h-12 rounded-full border-2 border-white/10" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-pink-500/20 border-2 border-white/10 flex items-center justify-center font-bold text-pink-400">
                    {msg.userId.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors uppercase text-sm tracking-wide">
                    {msg.userId.name}
                  </h4>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{formatTime(msg.createdAt)}</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
