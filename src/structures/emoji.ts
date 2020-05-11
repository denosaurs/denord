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


export interface Create extends NonNullable<Pick<Emoji, "name" | "roles">> {
	/** the 128x128 emoji image */
	image: string;
}

export type Modify = Pick<Create, "name" | "roles">;
