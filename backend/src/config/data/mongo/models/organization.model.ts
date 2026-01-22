import { Schema, model, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  settings?: {
    defaultSport: 'football' | 'basketball' | 'volleyball';
    timezone: string;
    locale: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    logo: String,
    coverImage: String,
    contactEmail: { type: String, required: true },
    contactPhone: String,
    address: String,
    city: String,
    country: { type: String, required: true },
    website: String,
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
    },
    settings: {
      defaultSport: { type: String, enum: ['football', 'basketball', 'volleyball'] },
      timezone: String,
      locale: String,
      primaryColor: String,
      secondaryColor: String,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

OrganizationSchema.index({ slug: 1 });

export const OrganizationModel = model<IOrganization>('Organization', OrganizationSchema);
