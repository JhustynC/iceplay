import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin';
  organizationId?: Schema.Types.ObjectId;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ['super_admin', 'admin'], required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    avatar: String,
    phone: String,
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ organizationId: 1, role: 1 });

export const UserModel = model<IUser>('User', UserSchema);
