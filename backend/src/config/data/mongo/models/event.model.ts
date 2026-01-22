import { Schema, model, Document } from 'mongoose';

export interface IEvent extends Document {
  matchId: Schema.Types.ObjectId;
  championshipId: Schema.Types.ObjectId;
  type: string;
  playerId: Schema.Types.ObjectId;
  teamId: Schema.Types.ObjectId;
  relatedPlayerId?: Schema.Types.ObjectId;
  period: number;
  minute: number;
  extraMinute?: number;
  description?: string;
  createdBy: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    championshipId: { type: Schema.Types.ObjectId, ref: 'Championship', required: true },
    type: { type: String, required: true },
    playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    relatedPlayerId: { type: Schema.Types.ObjectId, ref: 'Player' },
    period: { type: Number, required: true },
    minute: { type: Number, required: true },
    extraMinute: Number,
    description: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

EventSchema.index({ matchId: 1 });
EventSchema.index({ playerId: 1 });
EventSchema.index({ type: 1 });

export const EventModel = model<IEvent>('Event', EventSchema);
