"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SpotifySearch({ communityId, accessToken }: { communityId: string, accessToken: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingMessage, setAddingMessage] = useState("");
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) {
        if (res.status === 401) setError("Spotify token expired. Please re-login.");
        else setError("Failed to fetch from Spotify API.");
        setResults([]);
        return;
      }
      const data = await res.json();
      setResults(data.tracks?.items || []);
    } catch (err) {
      console.error(err);
      setError("Network error contacting Spotify.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrack = async (track: any) => {
    setAddingMessage(`Adding...`);
    try {
      const res = await fetch(`/api/communities/${communityId}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotifyId: track.id,
          name: track.name,
          artist: track.artists.map((a: any) => a.name).join(", "),
          albumImageUrl: track.album?.images?.[0]?.url || "",
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setAddingMessage("Added!");
        setQuery("");
        setResults([]);
        router.refresh();
      } else {
        setAddingMessage(data.message || "Failed.");
      }
    } catch (err) {
      setAddingMessage("Error.");
    }
    setTimeout(() => setAddingMessage(""), 3000);
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-col gap-3 mb-6">
        <div className="relative w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tracks, artists..."
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 shadow-inner font-medium text-sm"
          />
        </div>
        <button type="submit" disabled={loading || !query} className="btn-spotify px-6 py-3 justify-center rounded-xl w-full text-sm">
          {loading ? "Searching..." : "Search Spotify"}
        </button>
      </form>

      {error && <p className="text-red-400 text-xs font-medium text-center mb-4">{error}</p>}
      
      {addingMessage && (
        <div className="mb-4 text-sm w-full font-bold text-green-400 bg-green-500/10 p-3 rounded-xl border border-green-500/20 text-center animate-pulse">
          {addingMessage}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2 mt-4 bg-black/40 p-2 rounded-2xl border border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
          {results.map((track: any) => (
            <div key={track.id} className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group">
              <img src={track.album?.images?.[0]?.url} alt={track.name} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
              <div className="flex-1 overflow-hidden">
                <p className="font-bold text-sm text-white truncate">{track.name}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{track.artists.map((a:any) => a.name).join(", ")}</p>
              </div>
              <button 
                onClick={() => handleAddTrack(track)}
                className="p-2 text-green-500 hover:text-white hover:bg-green-500 rounded-full transition-all group-hover:scale-110 active:scale-95 border border-transparent hover:shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                title="Add to Playlist"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
