import {Emoji} from "./emoji.ts";


/** a message reaction */
export interface Reaction {
	/** times this emoji has been used to react */
	count: number;
	/** whether the current user reacted using this emoji */
	me: boolean;
	/** emoji information */
	emoji: Partial<Emoji>;
}
