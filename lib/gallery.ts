import type { GalleryItem } from '@/lib/types';

export type ResolvedGalleryItem =
  | { type: 'image'; src: string }
  | { type: 'video'; videoType: 'url'; src: string; poster?: string }
  | { type: 'video'; videoType: 'aparat'; src: string; embedSrc: string; poster?: string };

const VIDEO_EXT = /\.(mp4|webm|ogg|mov)(\?|#|$)/i;

export function aparatEmbedUrl(src: string): string {
  return `https://www.aparat.com/video/video/embed/videohash/${extractAparatHash(src)}/vt/frame`;
}

export function extractAparatHash(src: string): string {
  const trimmed = src.trim();
  try {
    const url = new URL(trimmed);
    const fromWatch = url.pathname.match(/\/v\/([^/]+)/);
    if (fromWatch) return fromWatch[1];
    const fromEmbed = url.pathname.match(/videohash\/([^/]+)/);
    if (fromEmbed) return fromEmbed[1];
  } catch {
    // Not a URL — treat the whole string as a hash.
  }
  return trimmed;
}

export function resolveGalleryItem(item: GalleryItem): ResolvedGalleryItem {
  if (typeof item === 'string') {
    if (VIDEO_EXT.test(item)) {
      return { type: 'video', videoType: 'url', src: item };
    }
    return { type: 'image', src: item };
  }

  if (item.type === 'image') {
    return { type: 'image', src: item.src };
  }

  if (item.videoType === 'aparat') {
    return {
      type: 'video',
      videoType: 'aparat',
      src: item.src,
      embedSrc: aparatEmbedUrl(item.src),
      poster: item.poster,
    };
  }

  return {
    type: 'video',
    videoType: 'url',
    src: item.src,
    poster: item.poster,
  };
}
