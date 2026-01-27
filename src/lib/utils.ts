import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getYouTubeEmbedUrl(url: string): string {
  if (!url) return '';

  // Already an embed URL
  if (url.includes('/embed/')) return url;

  let videoId = '';

  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  } else if (url.includes('youtube.com/watch')) {
    const urlParams = new URL(url).searchParams;
    videoId = urlParams.get('v') || '';
  } else if (url.includes('youtube.com/v/')) {
    videoId = url.split('youtube.com/v/')[1].split('?')[0];
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}
