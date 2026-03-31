import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { CommunityMessage } from "@/lib/models/CommunityMessage";
import { Community } from "@/lib/models/Community";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const messages = await CommunityMessage.find({ communityId: id })
      .populate("userId", "name image")
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    await dbConnect();

    // Check if the community exists and the user is a member
    const community = await Community.findById(id);
    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    const userId = (session.user as any).id;
    const isMember = community.members.some(
      (memberId: any) => memberId.toString() === userId
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "Only community members can post on the wall" },
        { status: 403 }
      );
    }

    const newMessage = await CommunityMessage.create({
      communityId: id,
      userId: userId,
      content: content.trim(),
    });

    // Populate user info for the response
    const populatedMessage = await CommunityMessage.findById(newMessage._id).populate(
      "userId",
      "name image"
    );

    return NextResponse.json(populatedMessage, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
