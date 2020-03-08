export interface IEmbedFooter {
	text: string,
	icon_url?: string,
	proxy_icon_url?: string
}

export interface IEmbedImage {
	url?: string,
	proxy_url?: string,
	height?: number,
	width?: number
}

export interface IEmbedThumbnail {
	url?: string,
	proxy_url?: string,
	height?: number,
	width?: number
}

export interface IEmbedVideo {
	url?: string,
	height?: number,
	width?: number
}

export interface IEmbedProvider {
	name?: string,
	url?: string
}

export interface IEmbedAuthor {
	name?: string,
	url?: string,
	icon_url?: string,
	proxy_icon_url?: string
}

export interface IEmbedField {
	name: string,
	value: string,
	inline?: boolean
}


export default class Embed {
	title?: string;
	type?: "rich" | "image" | "video" | "gifv" | "article" | "link";
	description?: string;
	url?: string;
	timestamp?: string;
	color?: number;
	footer?: IEmbedFooter;
	image?: IEmbedImage;
	thumbnail?: IEmbedThumbnail;
	video?: IEmbedVideo;
	provider?: IEmbedProvider;
	author?: IEmbedAuthor;
	fields?: IEmbedField[];
}
