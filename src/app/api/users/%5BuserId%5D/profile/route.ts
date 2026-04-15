import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models/User";
import { Community } from "@/lib/models/Community";
import { Friendship } from "@/lib/models/Friendship";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const session = await getServerSession(authOptions);

  await dbConnect();

  try {
    // 1. Fetch the user, EXCLUDING email and password
    const user = await User.findById(userId).select(
      "name image bio tags createdAt spotifyId googleId"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Fetch communities created by user
    const communitiesCreated = await Community.find({ creatorId: user._id })
      .select("name description members createdAt")
      .lean();

    // 3. Fetch communities joined (where user is a member but NOT the creator)
    const communitiesJoined = await Community.find({
      members: user._id,
      creatorId: { $ne: user._id },
    })
      .select("name description members createdAt")
      .lean();

    // 4. Check friendship status if requester is logged in
    let friendshipStatus: "none" | "pending_sent" | "pending_received" | "accepted" = "none";
    
    if (session?.user) {
      const currentUserId = (session.user as any).id;
      
      if (currentUserId === userId) {
        // Viewing own profile via public link
        friendshipStatus = "accepted"; // effectively
      } else {
        const friendship = await Friendship.findOne({
          $or: [
            { requester: currentUserId, recipient: userId },
            { requester: userId, recipient: currentUserId },
          ],
        });

        if (friendship) {
          if (friendship.status === "accepted") {
            friendshipStatus = "accepted";
          } else {
            friendshipStatus = friendship.requester.toString() === currentUserId 
              ? "pending_sent" 
              : "pending_received";
          }
        }
      }
    }

    return NextResponse.json({
      user,
      communitiesCreated,
      communitiesJoined,
      friendshipStatus,
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
