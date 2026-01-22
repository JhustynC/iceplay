import { Schema, model, Document } from 'mongoose';

export interface IChampionship extends Document {
  organizationId: Schema.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  sport: 'football' | 'basketball' | 'volleyball';
  format: 'league' | 'knockout' | 'group_stage' | 'mixed';
  season: string;
  status: 'draft' | 'registration' | 'active' | 'finished' | 'cancelled';
  logo?: string;
  coverImage?: string;
  settings: {
    pointsForWin: number;
    pointsForDraw: number;
    pointsForLoss: number;
    roundsCount: number;
    teamsPerGroup?: number;
    teamsAdvancePerGroup?: number;
    tiebreakers: string[];
    allowDraws: boolean;
    extraTimeAllowed: boolean;
    penaltyShootoutAllowed: boolean;
  };
  registrationStartDate?: Date;
  registrationEndDate?: Date;
  startDate: Date;
  endDate?: Date;
  totalTeams: number;
  totalMatches: number;
  matchesPlayed: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChampionshipSchema = new Schema<IChampionship>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: String,
    sport: {
      type: String,
      enum: ['football', 'basketball', 'volleyball'],
      required: true,
    },
    format: {
      type: String,
      enum: ['league', 'knockout', 'group_stage', 'mixed'],
      required: true,
    },
    season: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'registration', 'active', 'finished', 'cancelled'],
      default: 'draft',
    },
    logo: String,
    coverImage: String,
    settings: {
      pointsForWin: { type: Number, default: 3 },
      pointsForDraw: { type: Number, default: 1 },
      pointsForLoss: { type: Number, default: 0 },
      roundsCount: { type: Number, default: 2 },
      teamsPerGroup: Number,
      teamsAdvancePerGroup: Number,
      tiebreakers: [String],
      allowDraws: { type: Boolean, default: true },
      extraTimeAllowed: { type: Boolean, default: false },
      penaltyShootoutAllowed: { type: Boolean, default: false },
    },
    registrationStartDate: Date,
    registrationEndDate: Date,
    startDate: { type: Date, required: true },
    endDate: Date,
    totalTeams: { type: Number, default: 0 },
    totalMatches: { type: Number, default: 0 },
    matchesPlayed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ChampionshipSchema.index({ organizationId: 1, status: 1 });
ChampionshipSchema.index({ slug: 1, organizationId: 1 });

export const ChampionshipModel = model<IChampionship>('Championship', ChampionshipSchema);
