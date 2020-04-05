/** a rich presence */
export interface RichPresence {
	/** the user's current party status */
	state: string;
	/** what the player is currently doing */
	details: string;
	/** epoch seconds for game start - including will show time as "elapsed" */
	startTimestamp: number;
	/** epoch seconds for game end - including will show time as "remaining" */
	endTimestamp: number;
	/** name of the uploaded image for the large profile artwork */
	largeImageKey: string;
	/** tooltip for the largeImageKey */
	largeImageText: string;
	/** name of the uploaded image for the small profile artwork */
	smallImageKey: string;
	/** tooltip for the smallImageKey */
	smallImageText: string;
	/** id of the player's party, lobby, or group */
	partyId: string;
	/** current size of the player's party, lobby, or group */
	partySize: number;
	/** maximum size of the player's party, lobby, or group */
	partyMax: number;
	/** (for future use) unique hashed string for a player's match */
	matchSecret: string;
	/** unique hashed string for Spectate button */
	spectateSecret: string;
	/** unique hashed string for chat invitations and Ask to Join */
	joinSecret: string;
	/** (for future use) integer representing a boolean for if the player is in an instance (an in-progress match) */
	instance: number;
}
