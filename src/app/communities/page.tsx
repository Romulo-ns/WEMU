import Link from "next/link";
import dbConnect from "@/lib/db";
import { Community } from "@/lib/models/Community";
import { User } from "@/lib/models/User"; // Ensure it's imported to register the model for populate

export const revalidate = 0;

export default async function CommunitiesPage() {
  await dbConnect();
  // We ensure User is imported to avoid "Schema hasn't been registered" error during populate
  const communities = await Community.find({}).populate('creatorId', 'name image').sort({ createdAt: -1 });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
      <div className="absolute top-0 left-0 w-full h-64 bg-purple-600/10 blur-[100px] -z-10 pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6">
        <h1 className="text-5xl font-extrabold text-gradient drop-shadow-sm">Explore Communities</h1>
        <Link href="/communities/new" className="btn-primary shadow-purple-500/30 font-bold px-8">
          + Create Community
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {communities.map((c: any) => (
          <Link href={`/communities/${c._id}`} key={c._id} className="glass-card p-8 hover:-translate-y-2 hover:shadow-purple-500/20 transition-all duration-300 group cursor-pointer block border border-white/5 hover:border-white/20">
            <h2 className="text-2xl font-extrabold mb-3 group-hover:text-pink-400 transition-colors break-words">{c.name}</h2>
            <p className="text-gray-400 mb-6 line-clamp-3 leading-relaxed">{c.description}</p>
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="flex items-center gap-2 text-white/80 bg-white/5 px-3 py-1 rounded-full">
                 <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                 </svg>
                 {c.members?.length || 0} member{(c.members?.length || 0) !== 1 && 's'}
              </span>
              <div className="flex items-center gap-2">
                {c.creatorId?.image ? (
                  <img src={c.creatorId.image} alt={c.creatorId.name} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-xs">
                    {(c.creatorId?.name || "U").charAt(0)}
                  </div>
                )}
                <span className="text-gray-400 truncate max-w-[100px]">{c.creatorId?.name || "Unknown"}</span>
              </div>
            </div>
          </Link>
        ))}
        {communities.length === 0 && (
          <div className="col-span-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
            <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-2xl text-gray-400 mb-4 font-bold">No communities found.</p>
            <Link href="/communities/new" className="text-pink-400 hover:text-pink-300 font-semibold hover:underline text-lg">Be the first to create one!</Link>
          </div>
        )}
      </div>
    </div>
  );
}
