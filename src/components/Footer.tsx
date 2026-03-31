import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full mt-auto py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-white/[0.02] backdrop-blur-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-gray-300">
        {/* Brand & Socials Section */}
        <div className="space-y-6">
          <Link href="/" className="text-3xl font-extrabold tracking-tighter text-gradient selection:bg-transparent">
            WEMU
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
            Connecting music lovers worldwide. Discover tracks, share playlists, and explore your musical retrospective with a unique community.
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="p-2.5 rounded-full glass hover:text-purple-400 transition-all duration-300 transform hover:scale-110" title="Spotify">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.001 10.62 18.661 12.9c.42.18.6.78.3 1.14zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.261 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.42z"/>
              </svg>
            </a>
            <a href="#" className="p-2.5 rounded-full glass hover:text-pink-400 transition-all duration-300 transform hover:scale-110" title="Twitter / X">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Platform Column */}
        <div className="flex flex-col gap-6">
          <h4 className="text-white font-bold tracking-tight uppercase text-xs">Platform</h4>
          <ul className="flex flex-col gap-4 text-sm font-medium">
            <li><Link href="/" className="hover:text-purple-400 transition-colors">Feed</Link></li>
            <li><Link href="/communities" className="hover:text-purple-400 transition-colors">Communities</Link></li>
            <li><Link href="/friends" className="hover:text-purple-400 transition-colors">Network</Link></li>
          </ul>
        </div>

        {/* Legal Column */}
        <div className="flex flex-col gap-6">
          <h4 className="text-white font-bold tracking-tight uppercase text-xs">Support & Legal</h4>
          <ul className="flex flex-col gap-4 text-sm font-medium">
            <li><Link href="#" className="hover:text-pink-400 transition-colors">Community Rules</Link></li>
            <li><Link href="#" className="hover:text-pink-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-pink-400 transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
        <p>&copy; {new Date().getFullYear()} WEMU. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-6">
          <span>BUILT FOR MUSIC LOVERS</span>
          <span className="text-white/20">|</span>
          <span className="text-gradient">DESIGNED BY ROMULO</span>
        </div>
      </div>
    </footer>
  );
}
