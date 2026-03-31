"use client";

import { useTransition } from "react";
import { addFriend, acceptFriend, rejectFriend, removeFriend, cancelRequest } from "@/app/friends/actions";

export function AddFriendButton({ targetId }: { targetId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => addFriend(targetId))}
      disabled={isPending}
      className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center gap-2 w-full justify-center"
    >
      {isPending ? "Sending..." : "Add Friend"}
    </button>
  );
}

export function AcceptFriendButton({ requesterId }: { requesterId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => acceptFriend(requesterId))}
      disabled={isPending}
      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all disabled:opacity-50 w-full"
    >
      {isPending ? "Accepting..." : "Accept"}
    </button>
  );
}

export function RejectFriendButton({ requesterId }: { requesterId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => rejectFriend(requesterId))}
      disabled={isPending}
      className="bg-white/10 hover:bg-red-500 text-gray-300 hover:text-white font-bold py-2 px-4 rounded-xl text-sm transition-all disabled:opacity-50 w-full"
    >
      {isPending ? "Rejecting..." : "Reject"}
    </button>
  );
}

export function RemoveFriendButton({ friendId }: { friendId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => removeFriend(friendId))}
      disabled={isPending}
      className="bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 font-bold py-2 px-4 rounded-xl text-sm transition-all disabled:opacity-50 w-full"
    >
      {isPending ? "Removing..." : "Remove Friend"}
    </button>
  );
}

export function CancelRequestButton({ recipientId }: { recipientId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => cancelRequest(recipientId))}
      disabled={isPending}
      className="bg-white/10 hover:bg-white/20 text-gray-300 font-bold py-2 px-4 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 w-full"
    >
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {isPending ? "Canceling..." : "Pending"}
    </button>
  );
}
