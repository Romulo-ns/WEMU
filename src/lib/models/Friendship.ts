import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IFriendship extends Document {
  requester: Types.ObjectId;
  recipient: Types.ObjectId;
  status: 'pending' | 'accepted';
  createdAt: Date;
  updatedAt: Date;
}

const FriendshipSchema = new Schema<IFriendship>(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate friendships between the same two users regardless of direction
FriendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export const Friendship: Model<IFriendship> = 
  mongoose.models.Friendship || mongoose.model<IFriendship>('Friendship', FriendshipSchema);
