"use client";

import { signIn } from "next-auth/react";

export default function SpotifyLoginButton() {
  return (
    <button 
      onClick={() => signIn("spotify")} 
      className="btn-spotify px-6 py-2 text-sm w-full justify-center"
    >
      Link Spotify
    </button>
  );
}
