import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      
      {/* Background Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 space-y-8 max-w-4xl glass-card p-12 mt-4 sm:mt-12">
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-4 animate-fade-in drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          <span className="text-gradient">WEMU</span>
        </h1>
        <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-8">
          Connect Through <span className="text-purple-400">Music</span>
        </h2>
        
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          WEMU is the ultimate social network for music lovers. Share your favorite tracks, join niche communities, and discover new sounds with friends.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
          <Link href="/communities" className="btn-primary text-lg px-8 py-4">
            Explore Communities
          </Link>
          <button className="glass px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors text-lg text-white">
            Learn More
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <div className="glass-card p-8 hover:-translate-y-2 transition-transform duration-300">
          <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">Share Playlists</h3>
          <p className="text-gray-400">Collaborate with friends to build the perfect vibe for any mood or occasion.</p>
        </div>
        
        <div className="glass-card p-8 hover:-translate-y-2 transition-transform duration-300">
          <div className="h-12 w-12 rounded-full bg-pink-500/20 flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">Find Your Tribe</h3>
          <p className="text-gray-400">Join communities based on genres, artists, or decades and discuss what you love.</p>
        </div>

        <div className="glass-card p-8 hover:-translate-y-2 transition-transform duration-300">
          <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">Spotify Integration</h3>
          <p className="text-gray-400">Sync your listening history, top artists, and seamlessly push WEMU playlists to Spotify.</p>
        </div>
      </div>
    </div>
  );
}
