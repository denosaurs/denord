import {Snowflake} from "./generics.ts";
import {User} from "./user.ts";


/** an emoji */
export interface Emoji {
	/** emoji id */
	id: Snowflake | null;
	/** emoji name (can be null only in reaction emoji objects) */
	name: string | null;
	/** roles this emoji is whitelisted to */
	roles?: Snowflake[];
	/** user that created this emoji */
	user?: User;
	/** whether this emoji must be wrapped in colons */
	require_colons?: boolean;
	/** whether this emoji is managed */
	managed?: boolean;
	/** whether this emoji is animated */
	animated?: boolean;
}


export interface Create {
	/** name of the emoji */
	name: string;
	/** the 128x128 emoji image */
	image: string;
	/** roles for which this emoji will be whitelisted */
	roles: Snowflake[];
}

export interface Modify {
	/** name of the emoji */
	name: string;
	/** roles to which this emoji will be whitelisted */
	roles: Snowflake[];
}
