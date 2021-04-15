import type { embed } from "../../discord_typings/mod.ts";

export interface Embed {
  title?: string;
  type?: "rich" | "image" | "video" | "gifv" | "article" | "link";
  description?: string;
  url?: string;
  timestamp?: number;
  color?: number;
  footer?: Footer;
  image?: Image;
  thumbnail?: Thumbnail;
  video?: Video;
  provider?: embed.Provider;
  author?: Author;
  fields?: embed.Field[];
}

export interface Footer {
  text: string;
  iconUrl?: string;
  proxyIconUrl?: string;
}

export interface Image {
  url?: string;
  proxyUrl?: string;
  height?: number;
  width?: number;
}

export interface Thumbnail {
  url?: string;
  proxyUrl?: string;
  height?: number;
  width?: number;
}

export interface Video {
  url?: string;
  proxyUrl?: string;
  height?: number;
  width?: number;
}

export interface Author {
  name?: string;
  url?: string;
  iconUrl?: string;
  proxyIconUrl?: string;
}

export function parseEmbed({
  timestamp,
  footer,
  image,
  thumbnail,
  video,
  author,
  ...embed
}: embed.Embed): Embed {
  return {
    ...embed,
    timestamp: timestamp ? Date.parse(timestamp) : undefined,
    footer: footer && {
      text: footer.text,
      iconUrl: footer.icon_url,
      proxyIconUrl: footer.proxy_icon_url,
    },
    image: image && {
      url: image.url,
      proxyUrl: image.proxy_url,
      height: image.height,
      width: image.width,
    },
    thumbnail: thumbnail && {
      url: thumbnail.url,
      proxyUrl: thumbnail.proxy_url,
      height: thumbnail.height,
      width: thumbnail.width,
    },
    video: video && {
      url: video.url,
      proxyUrl: video.proxy_url,
      height: video.height,
      width: video.width,
    },
    author: author && {
      name: author.name,
      url: author.url,
      iconUrl: author.icon_url,
      proxyIconUrl: author.proxy_icon_url,
    },
  };
}

export function unparseEmbed({
  timestamp,
  footer,
  image,
  thumbnail,
  video,
  author,
  ...embed
}: Embed): embed.Embed {
  return {
    ...embed,
    timestamp: timestamp !== undefined
      ? new Date(timestamp).toISOString()
      : undefined,
    footer: footer && {
      text: footer.text,
      icon_url: footer.iconUrl,
      proxy_icon_url: footer.proxyIconUrl,
    },
    image: image && {
      url: image.url,
      proxy_url: image.proxyUrl,
      height: image.height,
      width: image.width,
    },
    thumbnail: thumbnail && {
      url: thumbnail.url,
      proxy_url: thumbnail.proxyUrl,
      height: thumbnail.height,
      width: thumbnail.width,
    },
    video: video && {
      url: video.url,
      proxy_url: video.proxyUrl,
      height: video.height,
      width: video.width,
    },
    author: author && {
      name: author.name,
      url: author.url,
      icon_url: author.iconUrl,
      proxy_icon_url: author.proxyIconUrl,
    },
  };
}
