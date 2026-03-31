import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ICommunityMessage extends Document {
  communityId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityMessageSchema = new Schema<ICommunityMessage>(
  {
    communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 500 },
  },
  {
    timestamps: true,
  }
);

// Index to fetch messages by community and sorted by creation date quickly
CommunityMessageSchema.index({ communityId: 1, createdAt: -1 });

export const CommunityMessage: Model<ICommunityMessage> = 
  mongoose.models.CommunityMessage || mongoose.model<ICommunityMessage>('CommunityMessage', CommunityMessageSchema);
