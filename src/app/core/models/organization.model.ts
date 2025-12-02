import type { Sport } from './sport-config.model';

/**
 * Organization entity representing a sports league organization
 */
export interface Organization {
  id: string;
  name: string;
  slug: string; // URL-friendly identifier: "liga-quito-norte"
  description?: string;
  logo?: string;
  coverImage?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country: string;
  website?: string;
  socialLinks?: OrganizationSocialLinks;
  settings?: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface OrganizationSocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
}

export interface OrganizationSettings {
  defaultSport: Sport;
  timezone: string;
  locale: string;
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * DTO for creating a new organization with its first admin
 */
export interface CreateOrganizationDto {
  name: string;
  contactEmail: string;
  country: string;
  city?: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
}

/**
 * DTO for updating an organization
 */
export interface UpdateOrganizationDto {
  name?: string;
  description?: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  website?: string;
  socialLinks?: OrganizationSocialLinks;
  settings?: Partial<OrganizationSettings>;
}

/**
 * Organization with additional computed fields
 */
export interface OrganizationWithStats extends Organization {
  championshipsCount: number;
  adminsCount: number;
  activeChampionshipsCount: number;
}

