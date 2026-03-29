import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Community } from "@/lib/models/Community";
import { User } from "@/lib/models/User";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return NextResponse.json({ communities: [], users: [] });
    }

    await dbConnect();

    const communities = await Community.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } }
      ]
    }).limit(5).select("name _id members");

    // We can also search for users
    const users = await User.find({
      name: { $regex: q, $options: "i" }
    }).limit(4).select("name _id image");

    return NextResponse.json({ communities, users });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
