"use server";

import dbConnect from "@/lib/db";
import { Friendship } from "@/lib/models/Friendship";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id;
}

export async function addFriend(targetUserId: string) {
  const currentUserId = await getSessionUserId();
  if (!currentUserId) throw new Error("Unauthorized");
  if (currentUserId === targetUserId) throw new Error("Cannot add yourself");

  await dbConnect();

  // Check if a friendship or request already exists
  const existing = await Friendship.findOne({
    $or: [
      { requester: currentUserId, recipient: targetUserId },
      { requester: targetUserId, recipient: currentUserId }
    ]
  });

  if (existing) {
    throw new Error("Friendship or request already exists");
  }

  // Create new request (pending)
  await Friendship.create({
    requester: currentUserId,
    recipient: targetUserId,
    status: 'pending'
  });

  revalidatePath("/friends");
}

export async function acceptFriend(requesterId: string) {
  const currentUserId = await getSessionUserId();
  if (!currentUserId) throw new Error("Unauthorized");

  await dbConnect();

  // Find the exact pending request where we are the recipient
  const friendship = await Friendship.findOne({
    requester: requesterId,
    recipient: currentUserId,
    status: 'pending'
  });

  if (!friendship) {
    throw new Error("Friend request not found");
  }

  friendship.status = 'accepted';
  await friendship.save();

  revalidatePath("/friends");
}

export async function rejectFriend(requesterId: string) {
  const currentUserId = await getSessionUserId();
  if (!currentUserId) throw new Error("Unauthorized");

  await dbConnect();

  // Delete the pending request where we are the recipient
  await Friendship.deleteOne({
    requester: requesterId,
    recipient: currentUserId,
    status: 'pending'
  });

  revalidatePath("/friends");
}

export async function removeFriend(friendId: string) {
  const currentUserId = await getSessionUserId();
  if (!currentUserId) throw new Error("Unauthorized");

  await dbConnect();

  // Delete the accepted friendship
  await Friendship.deleteOne({
    $or: [
      { requester: currentUserId, recipient: friendId, status: 'accepted' },
      { requester: friendId, recipient: currentUserId, status: 'accepted' }
    ]
  });

  revalidatePath("/friends");
}

export async function cancelRequest(recipientId: string) {
  const currentUserId = await getSessionUserId();
  if (!currentUserId) throw new Error("Unauthorized");

  await dbConnect();

  // Delete the pending request where we are the requester
  await Friendship.deleteOne({
    requester: currentUserId,
    recipient: recipientId,
    status: 'pending'
  });

  revalidatePath("/friends");
}
