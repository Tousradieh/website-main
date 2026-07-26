import type { GalleryItem } from '@/lib/types';

export interface ResolvedGalleryItem {
  type: 'image' | 'video';
  src: string;
  poster?: string;
}

const VIDEO_EXT = /\.(mp4|webm|ogg|mov)(\?|#|$)/i;

export function resolveGalleryItem(item: GalleryItem): ResolvedGalleryItem {
  if (typeof item === 'string') {
    return {
      type: VIDEO_EXT.test(item) ? 'video' : 'image',
      src: item,
    };
  }
  return item;
}
