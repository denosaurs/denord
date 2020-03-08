import Emoji from "./Emoji.ts";


export default class Reaction {
	count: number;
	me: boolean;
	emoji: Partial<Emoji>;
}
