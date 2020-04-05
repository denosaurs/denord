import {ISO8601} from "./generics.ts";


/** embed type */
export enum Type {
	/** generic embed rendered from embed attributes */
	RICH = "rich",
	/** image embed */
	IMAGE = "image",
	/** video embed */
	VIDEO = "video",
	/** animated gif image embed rendered as a video embed */
	GIFV = "gifv",
	/** article embed */
	ARTICLE = "article",
	/** link embed */
	LINK = "link"
}


/** an embed footer */
export interface Footer {
	/** footer text */
	text: string;
	/** url of footer icon (only supports http(s) and attachments) */
	icon_url?: string;
	/** a proxied url of footer icon */
	proxy_icon_url?: string;
}

/** an embed image */
export interface Image {
	/** source url of image (only supports http(s) and attachments) */
	url?: string;
	/** a proxied url of the image */
	proxy_url?: string;
	/** height of image */
	height?: number;
	/** width of image */
	width?: number;
}

/** an embed thumbnail */
export interface Thumbnail {
	/** source url of thumbnail (only supports http(s) and attachments) */
	url?: string;
	/** a proxied url of the thumbnail */
	proxy_url?: string;
	/** height of thumbnail */
	height?: number;
	/** width of thumbnail */
	width?: number;
}

/** an embed video */
export interface Video {
	/** source url of video */
	url?: string;
	/** height of video */
	height?: number;
	/** width of video */
	width?: number;
}

/** an embed provider */
export interface Provider {
	/** name of provider */
	name?: string;
	/** url of provider */
	url?: string;
}

/** an embed author */
export interface Author {
	/** name of author */
	name?: string;
	/** url of author */
	url?: string;
	/** url of author icon (only supports http(s) and attachments) */
	icon_url?: string;
	/** a proxied url of author icon */
	proxy_icon_url?: string;
}

/** an embed field */
export interface Field {
	/** name of the field */
	name: string;
	/** value of the field */
	value: string;
	/** whether or not this field should display inline */
	inline?: boolean;
}


/** an embed */
export interface Embed {
	/** title of embed */
	title?: string;
	/** type of embed (always "rich" for webhook embeds) */
	type?: Type;
	/** description of embed */
	description?: string;
	/** url of embed */
	url?: string;
	/** timestamp of embed content */
	timestamp?: ISO8601;
	/** color code of the embed */
	color?: number;
	/** footer information */
	footer?: Footer;
	/** image information */
	image?: Image;
	/** thumbnail information */
	thumbnail?: Thumbnail;
	/** video information */
	video?: Video;
	/** provider information */
	provider?: Provider;
	/** author information */
	author?: Author;
	/** fields information */
	fields?: Field[];
}
