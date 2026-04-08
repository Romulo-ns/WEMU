import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Community } from "@/lib/models/Community";
import { User } from "@/lib/models/User";

// GET all communities
export async function GET() {
  try {
    await dbConnect();
    // Populate creator details
    const communities = await Community.find({}).populate('creatorId', 'name image').sort({ createdAt: -1 });
    return NextResponse.json(communities, { status: 200 });
  } catch (error) {
    console.error("Fetch communities error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// POST create a community
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Please log in" }, { status: 401 });
    }

    const { name, description, rules } = await req.json();
    if (!name || !description) {
      return NextResponse.json({ message: "Name and description are required" }, { status: 400 });
    }

    await dbConnect();
    
    // Check uniqueness
    const existing = await Community.findOne({ name });
    if (existing) {
      return NextResponse.json({ message: "Community name already taken" }, { status: 409 });
    }

    const userId = (session.user as any).id;

    // Check if user actually exists in the database
    const userExists = await User.findById(userId);
    if (!userExists) {
      return NextResponse.json({ message: "User session is invalid or user was deleted" }, { status: 401 });
    }

    const newCommunity = await Community.create({
      name,
      description,
      rules: rules || "",
      creatorId: userId,
      members: [userId], // Creator is automatically a member
      tracks: []
    });

    return NextResponse.json(newCommunity, { status: 201 });
  } catch (error) {
    console.error("Create community error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
