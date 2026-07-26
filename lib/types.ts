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

/** Image path, or an explicit media object (videos / optional poster). */
export type GalleryItem =
  | string
  | {
      src: string;
      type: 'image' | 'video';
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

export interface Material {
  id: string;
  name: string;
  description: string;
  specs: string[];
  image: string;
}

export interface Stat {
  value: string;
  label: string;
}
