import {Snowflake} from "../utils/mod.ts";

import User from "./User.ts";


export default class Emoji {
	id: Snowflake | null;
	name: string | null;
	roles?: Snowflake[];
	user?: User;
	require_colons?: boolean;
	managed?: boolean;
	animated?: boolean;
}
