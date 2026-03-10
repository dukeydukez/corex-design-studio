# Platform Specifications

Platform specs for all supported social media and design formats.

export const PLATFORM_SPECS = {
  instagram_feed: {
    width: 1080,
    height: 1080,
    aspectRatio: 1,
    name: 'Instagram Feed',
  },
  instagram_story: {
    width: 1080,
    height: 1920,
    aspectRatio: 9 / 16,
    name: 'Instagram Story',
  },
  instagram_reel: {
    width: 1080,
    height: 1920,
    aspectRatio: 9 / 16,
    name: 'Instagram Reel',
  },
  tiktok: {
    width: 1080,
    height: 1920,
    aspectRatio: 9 / 16,
    name: 'TikTok',
  },
  linkedin_feed: {
    width: 1200,
    height: 628,
    aspectRatio: 1.91,
    name: 'LinkedIn Post',
  },
  linkedin_carousel: {
    width: 1200,
    height: 628,
    aspectRatio: 1.91,
    name: 'LinkedIn Carousel',
  },
  twitter: {
    width: 1024,
    height: 512,
    aspectRatio: 2,
    name: 'Twitter/X Post',
  },
  twitter_video: {
    width: 1280,
    height: 720,
    aspectRatio: 16 / 9,
    name: 'Twitter/X Video',
  },
  facebook: {
    width: 1200,
    height: 628,
    aspectRatio: 1.91,
    name: 'Facebook Post',
  },
  facebook_story: {
    width: 1080,
    height: 1920,
    aspectRatio: 9 / 16,
    name: 'Facebook Story',
  },
  youtube_thumbnail: {
    width: 1280,
    height: 720,
    aspectRatio: 16 / 9,
    name: 'YouTube Thumbnail',
  },
  email: {
    width: 600,
    height: null,
    maxHeight: 900,
    name: 'Email',
  },
  web_banner: {
    width: 1200,
    height: 400,
    aspectRatio: 3,
    name: 'Web Banner',
  },
};
