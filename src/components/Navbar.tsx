"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ communities: any[], users: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
             const data = await res.json();
             setResults(data);
             setShowDropdown(true);
          }
        } catch (e) {
          console.error(e);
        } finally {
           setIsSearching(false);
        }
      } else {
        setResults(null);
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <nav className="fixed top-0 w-full z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center gap-8">
            <Link href="/" className="text-3xl font-extrabold tracking-tighter text-gradient selection:bg-transparent">
              WEMU
            </Link>
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/communities" className="text-sm font-bold text-gray-300 hover:text-pink-400 transition-colors">
                Communities
              </Link>
              {status === "authenticated" && (
                <Link href="/friends" className="text-sm font-bold text-gray-300 hover:text-purple-400 transition-colors">
                  Network
                </Link>
              )}
            </div>
          </div>
          
          <div className="hidden md:flex flex-1 mx-8">
            <div className="w-full max-w-md mx-auto relative z-50" ref={searchRef}>
              <div className="relative group">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => query.length >= 2 && setShowDropdown(true)}
                  placeholder="Search for music, users, communities..." 
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 px-6 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 group-hover:bg-white/10"
                />
                
                {isSearching ? (
                  <svg className="absolute right-4 top-3 h-5 w-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="absolute right-4 top-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>

              {showDropdown && results && (
                <div className="absolute top-12 left-0 w-full bg-[#1a1625] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in max-h-[400px] overflow-y-auto custom-scrollbar">
                  {results.communities.length === 0 && results.users.length === 0 ? (
                    <p className="text-gray-400 text-center text-sm py-4 font-medium">No results found.</p>
                  ) : (
                    <div className="space-y-6">
                      {results.communities.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 px-2">Communities</h3>
                          <div className="space-y-1">
                            {results.communities.map((c: any) => (
                              <Link 
                                href={`/communities/${c._id}`} 
                                key={c._id}
                                onClick={() => setShowDropdown(false)}
                                className="block p-2 hover:bg-white/10 rounded-xl transition-colors"
                              >
                                <div className="font-bold text-white text-sm truncate">{c.name}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{c.members?.length || 0} members</div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {results.users.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-3 px-2">Users</h3>
                          <div className="space-y-1">
                            {results.users.map((u: any) => (
                              <Link 
                                href="#"
                                key={u._id}
                                onClick={() => setShowDropdown(false)}
                                className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                              >
                                {u.image ? (
                                  <img src={u.image} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-xs font-bold">
                                    {u.name?.charAt(0) || "U"}
                                  </div>
                                )}
                                <span className="font-bold text-white text-sm truncate">{u.name}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <div className="h-10 w-24 bg-white/10 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-200 hidden sm:block">
                  Hello, {session.user?.name}
                </span>
                <Link href="/profile" className="hover:scale-105 transition-transform" title="My Profile">
                  {session.user?.image ? (
                    <img src={session.user.image} alt="Profile" className="h-10 w-10 rounded-full border-2 border-purple-500/50 shadow-sm" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-purple-500/20 border-2 border-purple-500/50 flex items-center justify-center shadow-sm">
                      <span className="font-bold text-white text-sm">{session.user?.name?.charAt(0) || "U"}</span>
                    </div>
                  )}
                </Link>
                <button 
                  onClick={() => signOut()}
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => signIn("spotify")} 
                className="btn-spotify flex items-center gap-2 text-sm"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                   <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.001 10.62 18.661 12.9c.42.18.6.78.3 1.14zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.261 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.42z"/>
                </svg>
                Sign in with Spotify
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
