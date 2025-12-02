export type AnnouncementType = 'info' | 'warning' | 'success' | 'error';
export type AnnouncementTarget = 'all' | 'organization' | 'championship';

/**
 * Announcement entity
 */
export interface Announcement {
  id: string;

  // Content
  title: string;
  content: string;
  type: AnnouncementType;

  // Scope
  target: AnnouncementTarget;
  organizationId?: string; // If target is 'organization' or 'championship'
  championshipId?: string; // If target is 'championship'

  // Visibility
  isPublic: boolean; // Visible to public users
  isPinned: boolean; // Pinned at top

  // Dates
  publishDate: Date;
  expirationDate?: Date;

  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * DTO for creating an announcement
 */
export interface CreateAnnouncementDto {
  title: string;
  content: string;
  type: AnnouncementType;
  target: AnnouncementTarget;
  organizationId?: string;
  championshipId?: string;
  isPublic: boolean;
  isPinned?: boolean;
  publishDate: Date;
  expirationDate?: Date;
}

/**
 * DTO for updating an announcement
 */
export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
  type?: AnnouncementType;
  isPublic?: boolean;
  isPinned?: boolean;
  expirationDate?: Date;
}

/**
 * Get announcement type configuration
 */
export function getAnnouncementTypeConfig(type: AnnouncementType): {
  icon: string;
  color: string;
  bgColor: string;
} {
  const configs: Record<AnnouncementType, { icon: string; color: string; bgColor: string }> = {
    info: {
      icon: 'info',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
    },
    warning: {
      icon: 'warning',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    success: {
      icon: 'check_circle',
      color: '#22c55e',
      bgColor: 'rgba(34, 197, 94, 0.1)',
    },
    error: {
      icon: 'error',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
    },
  };
  return configs[type];
}

