import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If user exists and has a password, it's a duplicate
      if (existingUser.password) {
        return NextResponse.json(
          { message: "User already exists with this email" },
          { status: 400 }
        );
      }
      
      // If user exists but NO password, it means they logged in via OAuth (Google/Spotify)
      // We can either prompt them to login via OAuth or allow them to set a password
      // For security, it's better to prevent creating a password-based account if an OAuth account exists with the same email
      return NextResponse.json(
        { message: "This email is linked to a social login. Please sign in with Google or Spotify." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "User registered successfully", userId: newUser._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
