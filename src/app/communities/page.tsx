import Link from "next/link";
import dbConnect from "@/lib/db";
import { Community } from "@/lib/models/Community";
import { User } from "@/lib/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import CommunitiesTabs from "@/components/CommunitiesTabs";

export const revalidate = 0;

export default async function CommunitiesPage() {
  const session = await getServerSession(authOptions);
  
  await dbConnect();
  // Ensure User is imported for populate
  await User.countDocuments(); 

  const communities = await Community.find({}).populate('creatorId', 'name image').sort({ createdAt: -1 });
  const userId = session?.user ? (session.user as any).id : null;

  const managed: any[] = [];
  const joined: any[] = [];
  const discover: any[] = [];

  communities.forEach((c: any) => {
    const creatorId = c.creatorId?._id?.toString() || c.creatorId?.toString();
    const isCreator = userId && creatorId === userId;
    const isMember = userId && c.members?.some((m: any) => m.toString() === userId);

    const doc = {
      _id: c._id.toString(),
      name: c.name,
      description: c.description,
      creatorId: c.creatorId ? {
        _id: c.creatorId._id.toString(),
        name: c.creatorId.name,
        image: c.creatorId.image
      } : undefined,
      members: c.members?.map((m: any) => m.toString()) || []
    };

    if (isCreator) {
      managed.push(doc);
    } else if (isMember) {
      joined.push(doc);
    } else {
      discover.push(doc);
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in relative z-10">
      {/* Background Decorations */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 text-center md:text-left">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black text-gradient tracking-tighter py-1">Communities</h1>
          <p className="text-gray-400 max-w-xl font-medium">Find your tribe, share your sound, and stay connected with like-minded music lovers.</p>
        </div>
        <Link 
          href="/communities/new" 
          className="btn-primary flex items-center gap-3 px-10 py-4 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-bold">Create New</span>
        </Link>
      </div>

      <CommunitiesTabs 
        managed={managed} 
        joined={joined} 
        discover={discover} 
      />
    </div>
  );
}
