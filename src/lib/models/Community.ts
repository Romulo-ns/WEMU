import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITrack {
  spotifyId: string;
  name: string;
  artist: string;
  albumImageUrl: string;
  addedBy: Types.ObjectId;
  addedAt: Date;
}

export interface ICommunity extends Document {
  name: string;
  description: string;
  rules: string;
  creatorId: Types.ObjectId;
  members: Types.ObjectId[];
  tracks: ITrack[];
  createdAt: Date;
  updatedAt: Date;
}

const TrackSchema = new Schema<ITrack>({
  spotifyId: { type: String, required: true },
  name: { type: String, required: true },
  artist: { type: String, required: true },
  albumImageUrl: { type: String },
  addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  addedAt: { type: Date, default: Date.now }
});

const CommunitySchema = new Schema<ICommunity>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  rules: { type: String, default: "" },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  tracks: [TrackSchema]
}, {
  timestamps: true,
});

export const Community: Model<ICommunity> = mongoose.models.Community || mongoose.model<ICommunity>('Community', CommunitySchema);
