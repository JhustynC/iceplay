import { Schema, model, Document } from 'mongoose';

export interface IStanding extends Document {
  championshipId: Schema.Types.ObjectId;
  teamId: Schema.Types.ObjectId;
  group?: string;
  position: number;
  previousPosition?: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
  setsWon?: number;
  setsLost?: number;
  setsDifference?: number;
  pointsRatio?: number;
  updatedAt: Date;
}

const StandingSchema = new Schema<IStanding>(
  {
    championshipId: { type: Schema.Types.ObjectId, ref: 'Championship', required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    group: String,
    position: { type: Number, default: 0 },
    previousPosition: Number,
    played: { type: Number, default: 0 },
    won: { type: Number, default: 0 },
    drawn: { type: Number, default: 0 },
    lost: { type: Number, default: 0 },
    goalsFor: { type: Number, default: 0 },
    goalsAgainst: { type: Number, default: 0 },
    goalDifference: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    form: [{ type: String, enum: ['W', 'D', 'L'] }],
    setsWon: Number,
    setsLost: Number,
    setsDifference: Number,
    pointsRatio: Number,
  },
  { timestamps: true }
);

StandingSchema.index({ championshipId: 1, position: 1 });
StandingSchema.index({ teamId: 1 });

export const StandingModel = model<IStanding>('Standing', StandingSchema);
