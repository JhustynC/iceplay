import { Schema, model, Document } from 'mongoose';

export interface IMatch extends Document {
  championshipId: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  homeTeamId: Schema.Types.ObjectId;
  awayTeamId: Schema.Types.ObjectId;
  homeScore: number;
  awayScore: number;
  status:
    | 'scheduled'
    | 'warmup'
    | 'live'
    | 'halftime'
    | 'break'
    | 'overtime'
    | 'penalties'
    | 'finished'
    | 'suspended'
    | 'postponed'
    | 'cancelled';
  round: number;
  matchday: number;
  group?: string;
  stage?: string;
  scheduledDate: Date;
  scheduledTime: string;
  actualStartTime?: Date;
  actualEndTime?: Date;
  venue?: string;
  city?: string;
  referee?: string;
  assistantReferee1?: string;
  assistantReferee2?: string;
  currentPeriod: number;
  elapsedSeconds: number;
  isClockRunning: boolean;
  periodScores: {
    period: number;
    homeScore: number;
    awayScore: number;
  }[];
  homeSets?: number;
  awaySets?: number;
  notes?: string;
  isHighlighted: boolean;
  streamUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    championshipId: { type: Schema.Types.ObjectId, ref: 'Championship', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    homeTeamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    awayTeamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    homeScore: { type: Number, default: 0 },
    awayScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        'scheduled',
        'warmup',
        'live',
        'halftime',
        'break',
        'overtime',
        'penalties',
        'finished',
        'suspended',
        'postponed',
        'cancelled',
      ],
      default: 'scheduled',
    },
    round: { type: Number, required: true },
    matchday: { type: Number, required: true },
    group: String,
    stage: String,
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, required: true },
    actualStartTime: Date,
    actualEndTime: Date,
    venue: String,
    city: String,
    referee: String,
    assistantReferee1: String,
    assistantReferee2: String,
    currentPeriod: { type: Number, default: 0 },
    elapsedSeconds: { type: Number, default: 0 },
    isClockRunning: { type: Boolean, default: false },
    periodScores: [
      {
        period: Number,
        homeScore: Number,
        awayScore: Number,
      },
    ],
    homeSets: Number,
    awaySets: Number,
    notes: String,
    isHighlighted: { type: Boolean, default: false },
    streamUrl: String,
  },
  { timestamps: true }
);

MatchSchema.index({ championshipId: 1, status: 1 });
MatchSchema.index({ scheduledDate: 1 });
MatchSchema.index({ homeTeamId: 1, awayTeamId: 1 });

export const MatchModel = model<IMatch>('Match', MatchSchema);
