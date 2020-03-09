import {Snowflake} from "../utils/mod.ts";

import User from "./User.ts";


/** an emoji */
export default class Emoji {
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
