"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCommunity() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, rules }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create community");
        setLoading(false);
      } else {
        router.push(`/communities/${data._id}`);
      }
    } catch (err) {
      setError("A network error occurred. Are you logged in?");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in relative z-10">
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-2">Start a New Sound</h1>
        <p className="text-lg text-gray-400">Create a space for people to share and discover music together.</p>
      </div>
      
      <div className="glass-card p-10 border border-white/10 shadow-2xl">
        {error && <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-center font-medium">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Community Name</label>
            <input
              type="text"
              required
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all font-medium"
              placeholder="e.g. 90s Synthwave Enjoyers"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Description</label>
            <textarea
              required
              maxLength={300}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none transition-all font-medium"
              placeholder="What is this community about? Explain the vibe."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Rules (Optional)</label>
            <textarea
              rows={4}
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none transition-all"
              placeholder="e.g. 1. Be respectful&#10;2. Only post synthwave tracks"
            />
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-end gap-4 border-t border-white/10">
            <button type="button" onClick={() => router.back()} className="px-8 py-4 rounded-xl font-bold bg-white/5 hover:bg-white/10 transition-colors text-white">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary px-8 py-4 rounded-xl font-bold disabled:opacity-50 flex justify-center">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : "Launch Community"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
