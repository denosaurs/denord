import {Snowflake} from "../utils/mod.ts";


export default class Attachment {
	id: Snowflake;
	filename: string;
	size: number;
	url: string;
	proxy_url: string;
	height: number | null;
	width: number | null;
}
