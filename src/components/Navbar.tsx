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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <>
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-8">
              <Link href="/" className="text-3xl font-extrabold tracking-tighter text-gradient selection:bg-transparent transition-all hover:scale-105">
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
            
            <div className="hidden md:flex flex-1 mx-8 text-center">
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
                  <div className="absolute top-12 left-0 w-full bg-[#1a1625] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in max-h-[400px] overflow-y-auto custom-scrollbar text-left">
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

            <div className="flex items-center gap-2 sm:gap-4">
              {status === "loading" ? (
                <div className="h-10 w-24 bg-white/10 rounded-full animate-pulse focus:outline-none"></div>
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
                    className="text-sm text-gray-300 hover:text-white transition-colors hidden lg:block font-bold"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link 
                  href="/auth/signin" 
                  className="btn-primary text-sm hidden sm:flex"
                >
                  Log In
                </Link>
              )}

              {/* Hamburger Button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-300 hover:text-white focus:outline-none"
                aria-label="Toggle menu"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Side Drawer */}
      <div 
        className={`fixed inset-0 z-[100] lg:hidden transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        {/* Backdrop overlay */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={() => setIsMenuOpen(false)}
        ></div>
        
        {/* Drawer content */}
        <nav 
          className={`absolute top-0 right-0 h-full w-4/5 max-w-sm bg-[#0a0a0f]/95 border-l border-white/10 shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? "translate-x-0" : "translate-x-full"} overflow-y-auto`}
        >
          <div className="flex flex-col h-full p-8 text-left">
            <div className="flex justify-between items-center mb-12">
               <span className="text-2xl font-black text-gradient">WEMU</span>
               <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </button>
            </div>

            <div className="flex flex-col gap-8 flex-grow">
               <Link 
                 href="/communities" 
                 onClick={() => setIsMenuOpen(false)}
                 className="text-2xl font-bold text-gray-200 hover:text-pink-400 transition-colors flex items-center gap-4"
               >
                 <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                 </svg>
                 Communities
               </Link>
               
               {status === "authenticated" && (
                 <Link 
                   href="/friends" 
                   onClick={() => setIsMenuOpen(false)}
                   className="text-2xl font-bold text-gray-200 hover:text-purple-400 transition-colors flex items-center gap-4"
                 >
                   <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                   </svg>
                   Network
                 </Link>
               )}

                <div className="md:hidden pt-4 mt-4 border-t border-white/5 relative z-50">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Quick Search</p>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => query.length >= 2 && setShowDropdown(true)}
                      placeholder="Search..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
                    />
                    {isSearching ? (
                      <svg className="absolute right-4 top-3.5 h-5 w-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>
                  {showDropdown && results && (
                    <div className="absolute top-20 left-0 w-full bg-[#1a1625] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in max-h-[300px] overflow-y-auto">
                      {results.communities.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">Communities</h3>
                          {results.communities.slice(0, 3).map((c: any) => (
                            <Link key={c._id} href={`/communities/${c._id}`} onClick={() => {setIsMenuOpen(false); setShowDropdown(false);}} className="block py-2 text-sm text-gray-300 hover:text-white">{c.name}</Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
            </div>

            <div className="mt-auto pt-8 border-t border-white/10">
               {session ? (
                 <div className="flex flex-col gap-6">
                    <Link 
                      href="/profile" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-4 group"
                    >
                      {session.user?.image ? (
                        <img src={session.user.image} alt="Profile" className="h-14 w-14 rounded-full border-2 border-purple-500/50" />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-purple-500/20 flex items-center justify-center text-xl font-bold border-2 border-purple-500/50">
                          {session.user?.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                         <p className="text-sm text-gray-400 font-medium">Signed in as</p>
                         <p className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors">{session.user?.name}</p>
                      </div>
                    </Link>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        signOut();
                      }}
                      className="w-full py-4 rounded-2xl bg-white/5 text-red-400 font-bold hover:bg-white/10 transition-colors border border-white/5 active:scale-95"
                    >
                      Sign Out
                    </button>
                 </div>
               ) : (
                 <Link 
                   href="/auth/signin" 
                   onClick={() => setIsMenuOpen(false)}
                   className="btn-primary w-full py-4 justify-center text-lg"
                 >
                   Log In
                 </Link>
               )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
