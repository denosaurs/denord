import Emoji from "./Emoji.ts";


/** a message reaction */
export default class Reaction {
	/** times this emoji has been used to react */
	count: number;
	/** whether the current user reacted using this emoji */
	me: boolean;
	/** emoji information */
	emoji: Partial<Emoji>;
}
