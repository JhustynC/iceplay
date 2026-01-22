import { Schema, model, Document } from 'mongoose';

export interface IPlayer extends Document {
  teamId: Schema.Types.ObjectId;
  championshipId: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  fullName: string;
  nickname?: string;
  number: number;
  position: string;
  secondaryPosition?: string;
  document?: string;
  birthDate?: Date;
  age?: number;
  nationality?: string;
  height?: number;
  weight?: number;
  photo?: string;
  status: 'active' | 'injured' | 'suspended' | 'inactive';
  suspensionEndDate?: Date;
  suspensionReason?: string;
  stats: {
    matchesPlayed: number;
    minutesPlayed: number;
    goals?: number;
    assists?: number;
    yellowCards?: number;
    redCards?: number;
    ownGoals?: number;
    penaltiesScored?: number;
    penaltiesMissed?: number;
    points?: number;
    freeThrows?: number;
    twoPointers?: number;
    threePointers?: number;
    rebounds?: number;
    steals?: number;
    blocks?: number;
    turnovers?: number;
    fouls?: number;
    aces?: number;
    blockPoints?: number;
    kills?: number;
    digs?: number;
    errors?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new Schema<IPlayer>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    championshipId: { type: Schema.Types.ObjectId, ref: 'Championship', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fullName: { type: String, required: true },
    nickname: String,
    number: { type: Number, required: true },
    position: { type: String, required: true },
    secondaryPosition: String,
    document: String,
    birthDate: Date,
    age: Number,
    nationality: String,
    height: Number,
    weight: Number,
    photo: String,
    status: {
      type: String,
      enum: ['active', 'injured', 'suspended', 'inactive'],
      default: 'active',
    },
    suspensionEndDate: Date,
    suspensionReason: String,
    stats: {
      matchesPlayed: { type: Number, default: 0 },
      minutesPlayed: { type: Number, default: 0 },
      goals: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      yellowCards: { type: Number, default: 0 },
      redCards: { type: Number, default: 0 },
      ownGoals: { type: Number, default: 0 },
      penaltiesScored: { type: Number, default: 0 },
      penaltiesMissed: { type: Number, default: 0 },
      points: { type: Number, default: 0 },
      freeThrows: { type: Number, default: 0 },
      twoPointers: { type: Number, default: 0 },
      threePointers: { type: Number, default: 0 },
      rebounds: { type: Number, default: 0 },
      steals: { type: Number, default: 0 },
      blocks: { type: Number, default: 0 },
      turnovers: { type: Number, default: 0 },
      fouls: { type: Number, default: 0 },
      aces: { type: Number, default: 0 },
      blockPoints: { type: Number, default: 0 },
      kills: { type: Number, default: 0 },
      digs: { type: Number, default: 0 },
      errors: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

PlayerSchema.index({ teamId: 1 });
PlayerSchema.index({ championshipId: 1 });
PlayerSchema.index({ document: 1 });

export const PlayerModel = model<IPlayer>('Player', PlayerSchema);
