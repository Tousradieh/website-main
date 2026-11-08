export interface NavItem {
  label: string;
  href: string;
}

export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
}

/** How a gallery video is played: Aparat iframe vs a direct file URL. */
export type VideoType = 'aparat' | 'url';

/** Image path, or an explicit media object (videos / optional poster). */
export type GalleryItem =
  | string
  | { src: string; type: 'image' }
  | {
      src: string;
      type: 'video';
      videoType: VideoType;
      /** Poster frame for videos (thumbs + before play). */
      poster?: string;
    };

export interface Project {
  id: string;
  title: string;
  client: string;
  date: string;
  location: string;
  status: 'active' | 'completed';
  description: string;
  coverImage: string;
  gallery: GalleryItem[];
  tags: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: 'leadership' | 'engineers' | 'culture';
  bio: string;
  image: string;
  /** Parent member id in the org chart; `null` for the root. */
  reportsTo?: string | null;
}

export interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
}

/** Production unit kinds shown on the facilities page. */
export type FacilityType = 'quarry' | 'crusher' | 'asphalt' | 'batching';

export interface FacilityCategory {
  id: FacilityType;
  title: string;
  description: string;
  outputs: string[];
}

export interface ProductionSite {
  id: string;
  name: string;
  province: 'خراسان رضوی' | 'خراسان جنوبی';
  units: FacilityType[];
  capacity: string;
  note?: string;
}

export interface SupportCapability {
  id: string;
  title: string;
  description: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface OrganizationPillar {
  title: string;
  description: string;
}

export interface OrganizationInfo {
  history: string[];
  mission: string;
  missionPillars: OrganizationPillar[];
  vision: string;
  visionPillars: OrganizationPillar[];
}

export interface CsrInitiative {
  id: string;
  title: string;
  description: string;
  /** Lucide icon name key used by the about page. */
  icon: 'hospital' | 'mosque' | 'school' | 'education';
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  year?: string;
  description: string;
  image: string;
}
