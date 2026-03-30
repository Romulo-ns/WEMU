"use client";

import { useState } from "react";

export default function ExportPlaylistButton({ communityId, trackCount }: { communityId: string, trackCount: number }) {
  const [loading, setLoading] = useState(false);
  const [successStatus, setSuccessStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (trackCount === 0) return null;

  const handleExport = async () => {
    setLoading(true);
    setSuccessStatus("idle");
    setMessage("");

    try {
      const res = await fetch(`/api/communities/${communityId}/export`, { method: "POST" });
      const data = await res.json();
      
      if (res.ok) {
        setSuccessStatus("success");
        setMessage("Playlist saved!");
        if (data.playlistUrl) {
           setTimeout(() => window.open(data.playlistUrl, "_blank"), 1000);
        }
      } else {
        setSuccessStatus("error");
        setMessage(data.message || "Failed to export");
      }
    } catch (err) {
      setSuccessStatus("error");
      setMessage("Network error");
    } finally {
      setLoading(false);
      setTimeout(() => { if(successStatus !== "success") setMessage("") }, 4000);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button 
        onClick={handleExport} 
        disabled={loading || successStatus === "success"}
        className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm transition-all shadow-lg border ${
          successStatus === "success" ? "bg-green-500/20 text-green-400 border-green-500/30 cursor-not-allowed" :
          successStatus === "error" ? "bg-red-500/20 text-red-400 border-red-500/30" :
          "btn-spotify"
        }`}
      >
        {loading ? (
           <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
        ) : (
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.001 10.62 18.661 12.9c.42.18.6.78.3 1.14zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.261 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.42z"/>
          </svg>
        )}
        {loading ? "Exporting..." : successStatus === "success" ? "Saved to Spotify!" : "Export Playlist"}
      </button>
      {message && <span className={`text-[10px] font-medium absolute -mt-4 ${successStatus === "success" ? "text-green-400" : "text-red-400"}`}>{message}</span>}
    </div>
  );
}
