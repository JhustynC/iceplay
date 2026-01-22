import { Schema, model, Document } from 'mongoose';

export interface ITeam extends Document {
  championshipId: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  name: string;
  shortName: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  primaryColor: string;
  secondaryColor: string;
  foundedYear?: number;
  homeVenue?: string;
  city?: string;
  managerName?: string;
  managerPhone?: string;
  managerEmail?: string;
  isActive: boolean;
  hasActiveMatches: boolean;
  playersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    championshipId: { type: Schema.Types.ObjectId, ref: 'Championship', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    slug: { type: String, required: true },
    logo: String,
    coverImage: String,
    primaryColor: { type: String, required: true },
    secondaryColor: { type: String, required: true },
    foundedYear: Number,
    homeVenue: String,
    city: String,
    managerName: String,
    managerPhone: String,
    managerEmail: String,
    isActive: { type: Boolean, default: true },
    hasActiveMatches: { type: Boolean, default: false },
    playersCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TeamSchema.index({ championshipId: 1 });
TeamSchema.index({ organizationId: 1 });
TeamSchema.index({ slug: 1 });

export const TeamModel = model<ITeam>('Team', TeamSchema);
