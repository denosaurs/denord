declare namespace Discord {
	/** a snowflake */
	type Snowflake = string;

	/** an ISO8601 date string */
	type ISO8601 = string;


	namespace activity {
		/** unix timestamps for start and/or end of the game */
		interface Timestamps {
			/** unix timestamp for start of the game */
			start?: number;
			/** unix timestamp for end of the game */
			end?: number;
		}

		/** information for an activity's party */
		interface Party {
			/** the id of the party */
			id?: string;
			/** two integers (current_size, max_size), used to show the party's current and maximum size */
			size?: [number, number];
		}

		/** assets an activity may have */
		interface Assets {
			/** the id for a large asset of the activity, usually a snowflake */
			large_image?: string;
			/** text displayed when hovering over the large image of the activity */
			large_text?: string;
			/** the id for a small asset of the activity, usually a snowflake */
			small_image?: string;
			/** text displayed when hovering over the small image of the activity */
			small_text?: string;
		}

		/** secrets for Rich Presence joining and spectating */
		interface Secrets {
			/** the secret for joining a party */
			join?: string;
			/** the secret for spectating a game */
			spectate?: string;
			/** the secret for a specific instanced match */
			match?: string;
		}


		/**
		 * an activity
		 * NOTE: bots are only able to send `name`, `type`, and optionally `url`.
		 */
		interface Activity {
			/** the activity's name */
			name: string;
			/** the type of the activity */
			type: 0 | 1 | 2 | 4;
			/** stream url, is validated when type is 1 */
			url?: string | null;
			/** unix timestamp of when the activity was added to the user's session */
			created_at: number;
			/** unix timestamps for start and/or end of the game */
			timestamps?: Timestamps;
			/** application id for the game */
			application_id?: Snowflake;
			/** what the player is currently doing */
			details?: string | null;
			/** the user's current party status */
			state?: string | null;
			/** the emoji used for a custom status */
			emoji?: emoji.Emoji | null;
			/** information for the current party of the player */
			party?: Party;
			/** images for the presence and their hover texts */
			assets?: Assets;
			/** secrets for Rich Presence joining and spectating */
			secrets?: Secrets;
			/** whether or not the activity is an instanced game session */
			instance?: boolean;
			/** activity flags `OR`d together, describes what the payload includes */
			flags?: number;
		}
	}

	namespace attachment {
		/** a file attachment */
		interface Attachment {
			/** attachment id */
			id: Snowflake;
			/** name of file attached */
			filename: string;
			/** size of file in bytes */
			size: number;
			/** source url of file */
			url: string;
			/** a proxied url of file */
			proxy_url: string;
			/** height of file (if image) */
			height: number | null;
			/** width of file (if image) */
			width: number | null;
		}
	}

	namespace auditLog {
		interface AuditLogChange {
			new_value?: any;
			old_value?: any;
			key: string; //TODO: maybe write all possible keys?
		}

		interface AuditEntryInfo {
			delete_member_days: string;
			members_removed: string;
			channel_id: Snowflake;
			message_id: Snowflake;
			count: string;
			id: Snowflake;
			type: "member" | "role";
			role_name: string;
		}

		interface AuditLogEntry {
			target_id: string | null;
			changes?: AuditLogChange[];
			user_id: Snowflake;
			id: Snowflake;
			action_type: 1 | 10 | 11 | 12 | 13 | 14 | 15 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 30 | 31 | 32 | 40 | 41 | 42 | 50 | 51 | 52 | 60 | 61 | 62 | 72 | 73 | 74 | 75 | 80 | 81 | 82;
			options?: AuditEntryInfo;
			reason?: string;
		}


		interface AuditLog {
			webhooks: webhook.Webhook[];
			users: user.User[];
			audit_log_entries: AuditLogEntry[];
			integrations: Partial<integration.Integration>[];
		}
	}

	namespace channel {
		/** types of channels */
		type Type = 0 | 1 | 2 | 3 | 4 | 5 | 6;


		/** explicit permission overwrites for members and roles */
		interface Overwrite {
			/** role id or user id */
			id: Snowflake;
			/** what type of id you want to overwrite */
			type: "role" | "member";
			/** permission bit set */
			allow: number;
			/** permission bit set */
			deny: number;
		}

		/** a channel mention */
		interface Mention {
			/** id of the channel */
			id: Snowflake;
			/** id of the guild containing the channel */
			guild_id: Snowflake;
			/** the type of channel */
			type: Type;
			/** the name of the channel */
			name: string;
		}


		/** a channel */
		interface Channel {
			/** the id of this channel */
			id: Snowflake;
			/** the type of channel */
			type: Type;
			/** the id of the guild */
			guild_id?: Snowflake;
			/** sorting position of the channel */
			position?: number;
			/** explicit permission overwrites for members and roles */
			permission_overwrites?: Overwrite[];
			/** the name of the channel (2-100 characters) */
			name?: string;
			/** the channel topic (0-1024 characters) */
			topic?: string | null;
			/** whether the channel is nsfw */
			nsfw?: boolean;
			/** the id of the last message sent in this channel (may not point to an existing or valid message) */
			last_message_id?: Snowflake | null;
			/** the bitrate (in bits) of the voice channel */
			bitrate?: number;
			/** the user limit of the voice channel */
			user_limit?: number;
			/** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission `manage_messages` or `manage_channel`, are unaffected */
			rate_limit_per_user?: number;
			/** the recipients of the DM */
			recipients?: user.User[];
			/** icon hash */
			icon?: string | null;
			/** id of the DM creator */
			owner_id?: Snowflake;
			/** application id of the group DM creator if it is bot-created */
			application_id?: Snowflake;
			/** id of the parent category for a channel (each parent category can contain up to 50 channels) */
			parent_id?: Snowflake | null;
			/** when the last pinned message was pinned */
			last_pin_timestamp?: ISO8601;
		}


		interface GetMessages {
			/** get messages around this message ID */
			around?: Snowflake;
			/** get messages before this message ID */
			before?: Snowflake;
			/** get messages after this message ID */
			after?: Snowflake;
			/** max number of messages to return (1-100) */
			limit?: number;
		}

		interface GetReactions {
			/** get users before this user ID */
			before?: Snowflake;
			/** get users after this user ID */
			after?: Snowflake;
			/** max number of users to return (1-100) */
			limit?: number;
		}

		interface BulkDelete {
			/** an array of message ids to delete (2-100) */
			messages: Snowflake[];
		}

		interface GroupDMAddRecipient {
			/** access token of a user that has granted your app the `gdm.join` scope */
			access_token: string;
			/** nickname of the user being added */
			nick: string;
		}

		interface CreateGuildChannel {
			/** channel name (2-100 characters) */
			name: string;
			/** the type of channel */
			type?: Type;
			/** channel topic (0-1024 characters) */
			topic?: string;
			/** the bitrate (in bits) of the voice channel (voice only) */
			bitrate?: number;
			/** the user limit of the voice channel (voice only) */
			user_limit?: number;
			/** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission `manage_messages` or `manage_channel`, are unaffected */
			rate_limit_per_user?: number;
			/** sorting position of the channel */
			position?: number;
			/** the channel's permission overwrites */
			permission_overwrites?: Overwrite[];
			/** id of the parent category for a channel */
			parent_id?: Snowflake;
			/** whether the channel is nsfw */
			nsfw?: boolean;
		}

		type Modify = Partial<Omit<CreateGuildChannel, "type">>;

		interface GuildPosition {
			/** channel id */
			id: Snowflake;
			/** sorting position of the channel */
			position: number;
		}

		interface CreateDM {
			/** the recipient to open a DM channel with */
			recipient_id: Snowflake;
		}

		interface CreateGroupDM {
			/** access tokens of users that have granted your app the `gdm.join` scope */
			access_tokens: string[];
			/** a dictionary of user ids to their respective nicknames */
			nicks: { [key: string]: string }
		}


		interface PinsUpdateEvent {
			guild_id?: Snowflake;
			channel_id: Snowflake;
			last_pin_timestamp?: ISO8601;
		}


		interface DeleteBulkEvent {
			ids: Snowflake[];
			channel_id: Snowflake;
			guild_id: Snowflake;
		}

		interface TypingStartEvent {
			channel_id: Snowflake;
			guild_id?: Snowflake;
			user_id: Snowflake;
			timestamp: number;
			member?: guildMember.GuildMember;
		}
	}

	namespace embed {
		/** an embed footer */
		interface Footer {
			/** footer text */
			text: string;
			/** url of footer icon (only supports http(s) and attachments) */
			icon_url?: string;
			/** a proxied url of footer icon */
			proxy_icon_url?: string;
		}

		/** an embed image */
		interface Image {
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
		interface Thumbnail {
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
		interface Video {
			/** source url of video */
			url?: string;
			/** height of video */
			height?: number;
			/** width of video */
			width?: number;
		}

		/** an embed provider */
		interface Provider {
			/** name of provider */
			name?: string;
			/** url of provider */
			url?: string;
		}

		/** an embed author */
		interface Author {
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
		interface Field {
			/** name of the field */
			name: string;
			/** value of the field */
			value: string;
			/** whether or not this field should display inline */
			inline?: boolean;
		}


		/** an embed */
		interface Embed {
			/** title of embed */
			title?: string;
			/** type of embed (always "rich" for webhook embeds) */
			type?: "rich" | "image" | "video" | "gifv" | "article" | "link";
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
	}

	namespace emoji {
		/** an emoji */
		interface Emoji {
			/** emoji id */
			id: Snowflake | null;
			/** emoji name (can be null only in reaction emoji objects) */
			name: string | null;
			/** roles this emoji is whitelisted to */
			roles?: Snowflake[];
			/** user that created this emoji */
			user?: user.User;
			/** whether this emoji must be wrapped in colons */
			require_colons?: boolean;
			/** whether this emoji is managed */
			managed?: boolean;
			/** whether this emoji is animated */
			animated?: boolean;
		}


		interface Create extends NonNullable<Pick<Emoji, "name" | "roles">> {
			/** the 128x128 emoji image */
			image: string;
		}

		type Modify = Pick<Create, "name" | "roles">;
	}

	namespace guild {
		/** a guild embed */
		interface Embed {
			/** whether the embed is enabled */
			enabled: boolean;
			/** the embed channel id */
			channel_id: Snowflake | null;
		}

		/** a guild ban */
		interface Ban {
			/** the reason for the ban */
			reason: string | null;
			/** the banned user */
			user: user.User;
		}

		/** a user's status. active sessions are indicated with an "online", "idle", or "dnd" string per platform. If a user is offline or invisible, the corresponding field is not present. */
		interface ClientStatus {
			/** the user's status set for an active desktop (Windows, Linux, Mac) application session */
			desktop?: ActiveStatus;
			/** the user's status set for an active mobile (iOS, Android) application session */
			mobile?: ActiveStatus;
			/** the user's status set for an active web (browser, bot account) application session */
			web?: ActiveStatus;
		}

		/** A user's presence is their current state on a guild. This event is sent when a user's presence or info, such as name or avatar, is updated. */
		interface PresenceUpdateEvent {
			/** the user presence is being updated for */
			user: user.User;
			/** roles this user is in */
			roles: Snowflake[];
			/** null, or the user's current activity */
			game: activity.Activity | null;
			/** id of the guild */
			guild_id: Snowflake;
			/** the status of the user */
			status: ActiveStatus | "offline";
			/** user's current activities */
			activities: activity.Activity[];
			/** user's platform-dependent status */
			client_status: ClientStatus;
			/** when the user started boosting the guild */
			premium_since?: string | null;
			/** this users guild nickname (if one is set) */
			nick?: string | null;
		}


		/** a user's active activity status */
		type ActiveStatus = "idle" | "dnd" | "online";


		/** a guild */
		interface Guild {
			/** guild id */
			id: Snowflake;
			/** guild name (2-100 characters) */
			name: string;
			/** icon hash */
			icon: string | null;
			/** splash hash */
			splash: string | null;
			/** discovery splash hash */
			discovery_splash: string | null;
			/** whether or not the user is the owner of the guild */
			owner?: boolean;
			/** id of owner */
			owner_id: Snowflake;
			/** total permissions for the user in the guild (does not include channel overrides) */
			permissions?: number;
			/** voice region id for the guild */
			region: string;
			/** id of afk channel */
			afk_channel_id: Snowflake | null;
			/** afk timeout in seconds */
			afk_timeout: number;
			/** whether this guild is embeddable (e.g. widget) */
			embed_enabled?: boolean;
			/** if not null, the channel id that the widget will generate an invite to */
			embed_channel_id?: Snowflake | null;
			/** verification level required for the guild */
			verification_level: 0 | 1 | 2 | 3 | 4;
			/** default message notifications level */
			default_message_notifications: 0 | 1;
			/** explicit content filter level */
			explicit_content_filter: 0 | 1 | 2;
			/** roles in the guild */
			roles: role.Role[];
			/** custom guild emojis */
			emojis: emoji.Emoji[];
			/** enabled guild features */
			features: ("INVITE_SPLASH" | "VIP_REGIONS" | "VANITY_URL" | "VERIFIED" | "PARTNERED" | "PUBLIC" | "COMMERCE" | "NEWS" | "DISCOVERABLE" | "FEATURABLE" | "ANIMATED_ICON" | "BANNER" | "PUBLIC_DISABLED")[];
			/** required MFA level for moderators */
			mfa_level: 0 | 1;
			/** application id of the guild creator if it is bot-created */
			application_id: Snowflake | null;
			/** whether or not the server widget is enabled */
			widget_enabled?: boolean;
			/** the channel id for the server widget */
			widget_channel_id?: Snowflake | null;
			/** the id of the channel where guild notices such as welcome messages and boost events are posted */
			system_channel_id: Snowflake | null;
			/** system channel flags */
			system_channel_flags: number;
			/** the id of the channel where "PUBLIC" guilds display rules and/or guidelines */
			rules_channel_id: Snowflake | null;
			/** when this guild was joined at */
			joined_at?: ISO8601;
			/** whether this is considered a large guild */
			large?: boolean;
			/** whether this guild is unavailable */
			unavailable: boolean;
			/** total number of members in this guild */
			member_count?: number;
			/** an array of partial voice state objects */
			voice_states?: Partial<Omit<voice.State, "guild_id">>[];
			/** users in the guild */
			members?: guildMember.GuildMember[];
			/** channels in the guild */
			channels?: channel.Channel[];
			/** presences of the users in the guild */
			presences?: Partial<PresenceUpdateEvent>[];
			/** the maximum amount of presences for the guild (the default value, currently 5000, is in effect when null is returned) */
			max_presences?: number | null;
			/** the maximum amount of members for the guild */
			max_members?: number;
			/** the vanity url code for the guild */
			vanity_url_code: string | null;
			/** the description for the guild */
			description: string | null;
			/** banner hash */
			banner: string | null;
			/** server boost level */
			premium_tier: 0 | 1 | 2 | 3;
			/** the number of boosts this server currently has */
			premium_subscription_count?: number;
			/** the preferred locale of a "PUBLIC" guild used in server discovery and notices from Discord; defaults to "en-US" */
			preferred_locale: string;
			/** the id of the channel where admins and moderators of "PUBLIC" guilds receive notices from Discord */
			public_updates_channel_id: Snowflake | null;
		}


		type Create =
			Pick<Guild, "name">
			& Partial<NonNullable<Pick<Guild, "region" | "icon" | "verification_level" | "default_message_notifications" | "explicit_content_filter" | "roles" | "channels" | "afk_channel_id" | "afk_timeout" | "system_channel_id">>>;

		type Modify =
			Partial<Create>
			& Partial<NonNullable<Pick<Guild, "owner_id" | "splash" | "banner" | "rules_channel_id" | "public_updates_channel_id" | "preferred_locale">>>;

		interface CreateBan {
			/** number of days to delete messages for (0-7) */
			"delete-message-days"?: number;
			/** reason for the ban */
			reason?: string;
		}

		interface PruneCount {
			/** number of days to count prune for (1 or more) */
			days?: number;
		}

		interface BeginPrune {
			/** number of days to prune (1 or more) */
			days: number;
			/** whether 'pruned' is returned, discouraged for large guilds */
			compute_prune_count: boolean;
		}

		type EmbedModify = Partial<Embed>;

		interface WidgetEmbedStyle {
			/** style of the widget image returned */
			style?: "shield" | "banner1" | "banner2" | "banner3" | "banner4"
		}

		type UnavailableGuild = Pick<Guild, "id" | "unavailable">;


		interface BanEvent {
			guild_id: Snowflake;
			user: user.User;
		}

		interface EmojisUpdateEvent {
			guild_id: Snowflake;
			emojis: emoji.Emoji[];
		}

		interface IntegrationsUpdateEvent {
			guild_id: Snowflake;
		}

		interface MemberAddEvent extends guildMember.GuildMember {
			guild_id: Snowflake;
		}

		interface MemberRemoveEvent {
			guild_id: Snowflake;
			user: user.User;
		}

		interface MemberUpdateEvent extends Pick<guildMember.GuildMember, "roles" | "user" | "premium_since">, Partial<Pick<guildMember.GuildMember, "nick">> {
			guild_id: Snowflake;
		}

		interface MembersChunkEvent {
			guild_id: Snowflake;
			members: guildMember.GuildMember[];
			chunk_index: number;
			chunk_count: number;
			not_found?: [];
			presences?: PresenceUpdateEvent[];
			nonce?: string;
		}
	}

	namespace guildMember {
		/** a member of a guild */
		interface GuildMember {
			/** the user this guild member represents */
			user?: user.User;
			/** this user's guild nickname (if one is set) */
			nick: string | null;
			/** array of role object ids the user has */
			roles: Snowflake[];
			/** when the user joined the guild */
			joined_at: ISO8601;
			/** when the user started boosting the guild */
			premium_since?: ISO8601 | null;
			/** whether the user is deafened in voice channels */
			deaf: boolean;
			/** whether the user is muted in voice channels */
			mute: boolean;
		}


		interface List {
			/** max number of members to return (1-1000) */
			limit?: number;
			/** the highest user id in the previous page */
			after?: Snowflake;
		}

		type MinimalGuildMember = Partial<Pick<GuildMember, "nick" | "roles" | "mute" | "deaf">>;

		interface Add extends MinimalGuildMember {
			/** an oauth2 access token granted with the `guilds.join` to the bot's application for the user you want to add to the guild */
			access_token: string;
		}

		interface Modify extends MinimalGuildMember {
			/** id of channel to move user to (if they are connected to voice) */
			channel_id?: Snowflake | null;
		}

		interface ModifyCurrentNick {
			/** value to set users nickname to */
			nick: string;
		}
	}

	namespace integration {
		/** an integration account */
		interface Account {
			/** id of the account */
			id: string;
			/** name of the account */
			name: string;
		}


		/** an integration */
		interface Integration {
			/** integration id */
			id: Snowflake;
			/** integration name */
			name: string;
			/** integration type (twitch, youtube, etc) */
			type: string;
			/** is this integration enabled */
			enabled: boolean;
			/** is this integration syncing */
			syncing: boolean;
			/** id that this integration uses for "subscribers" */
			role_id: Snowflake;
			/** whether emoticons should be synced for this integration (twitch only currently) */
			enable_emoticons?: boolean;
			/** the behavior of expiring subscribers */
			expire_behavior: 1 | 2;
			/** the grace period (in days) before expiring subscribers */
			expire_grace_period: number;
			/** user for this integration */
			user: user.User;
			/** integration account information */
			account: Account;
			/** when this integration was last synced */
			synced_at: ISO8601;
		}


		type Create = Pick<Integration, "id" | "type">;

		type Modify = Partial<Pick<Integration, "expire_behavior" | "expire_grace_period" | "enable_emoticons">>;
	}

	namespace invite {
		/** extra information about an invite */
		interface MetadataInvite extends Invite {
			/** number of times this invite has been used */
			uses: number;
			/** max number of times this invite can be used */
			max_uses: number;
			/** duration (in seconds) after which the invite expires */
			max_age: number;
			/** whether this invite only grants temporary membership */
			temporary: boolean;
			/** when this invite was created */
			created_at: ISO8601;
		}

		/** a guild channel invite */
		interface Invite {
			/** the invite code (unique ID) */
			code: string;
			/** the guild this invite is for */
			guild?: Partial<guild.Guild>;
			/** the channel this invite is for */
			channel: Partial<channel.Channel>;
			/** the user who created the invite */
			inviter?: user.User;
			/** the target user for this invite */
			target_user?: Partial<user.User>;
			/** the type of target user for this invite */
			target_user_type?: 1;
			/** approximate count of online members (only present when target_user is set) */
			approximate_presence_count?: number;
			/** approximate count of total members */
			approximate_member_count?: number;
		}


		interface Create extends Partial<Pick<MetadataInvite, "max_age" | "max_uses" | "temporary" | "target_user_type">> {
			/** if true, don't try to reuse a similar invite (useful for creating many unique one time use invites) (default: false) */
			unique?: boolean;
			/** the target user id for this invite */
			target_user?: Snowflake;
		}

		type VanityURL = Pick<MetadataInvite, "code" | "uses">;

		interface CreateEvent extends Pick<MetadataInvite, "code" | "created_at" | "inviter" | "max_age" | "max_uses" | "target_user" | "target_user_type" | "temporary" | "uses"> {
			channel_id: Snowflake;
			guild_id: Snowflake;
		}

		type DeleteEvent =
			Pick<CreateEvent, "channel_id" | "code">
			& Partial<Pick<CreateEvent, "guild_id">>
	}

	namespace message {
		/** a message activity */
		interface Activity {
			/** type of message activity */
			type: 1 | 2 | 3 | 5;
			/** party_id from a Rich Presence event */
			party_id?: string;
		}

		/** a message application */
		interface Application {
			/** id of the application */
			id: Snowflake;
			/** id of the embed's image asset */
			cover_image?: string;
			/** application's description */
			description: string;
			/** id of the application's icon */
			icon: string | null;
			/** name of the application */
			name: string;
		}

		/** allowed mentions allows for more granular control over mentions without various hacks to the message content. this will always validate against message content to avoid phantom pings (e.g. to ping everyone, you must still have `@everyone` in the message content), and check against user/bot permissions */
		interface AllowedMentions {
			/** An array of allowed mention types to parse from the content. */
			parse: ("roles" | "users" | "everyone")[];
			/** Array of role_ids to mention (Max size of 100) */
			roles: Snowflake[];
			/** Array of user_ids to mention (Max size of 100) */
			users: Snowflake[];
		}

		/** a message reference */
		interface Reference {
			/** id of the originating message */
			message_id?: Snowflake;
			/** id of the originating message's channel */
			channel_id: Snowflake;
			/** id of the originating message's guild */
			guild_id?: Snowflake;
		}


		/** a message */
		interface Message {
			/** id of the message */
			id: Snowflake;
			/** id of the channel the message was sent in */
			channel_id: Snowflake;
			/** id of the guild the message was sent in */
			guild_id?: Snowflake;
			/**
			 * the author of this message.
			 * NOTE: the author object follows the structure of the user object, but is only a valid user in the case where the message is generated by a user or bot user. If the message is generated by a webhook, the author object corresponds to the webhook's id, username, and avatar. You can tell if a message is generated by a webhook by checking for the `webhook_id` on the message object
			 */
			author: user.User | (Pick<user.User, "username" | "avatar"> & { webhook_id: Snowflake });
			/**
			 * member properties for this message's author
			 * NOTE: the member object exists in `MESSAGE_CREATE` and `MESSAGE_UPDATE` events from text-based guild channels. This allows bots to obtain real-time member data without requiring bots to store member state in memory
			 */
			member?: Partial<guildMember.GuildMember>;
			/** contents of the message */
			content: string;
			/** when this message was sent */
			timestamp: ISO8601;
			/** when this message was edited (or null if never) */
			edited_timestamp: ISO8601 | null;
			/** whether this was a TTS message */
			tts: boolean;
			/** whether this message mentions everyone */
			mention_everyone: boolean;
			/**
			 * users specifically mentioned in the message.
			 * NOTE: the user objects in the mentions array will only have the partial member field present in `MESSAGE_CREATE` and `MESSAGE_UPDATE` events from text-based guild channels
			 */
			mentions: (user.User & { member: Partial<guildMember.GuildMember> })[];
			/** roles specifically mentioned in this message */
			mention_roles: Snowflake[];
			/** channels specifically mentioned in this message */
			mention_channels?: channel.Mention[];
			/** any attached files */
			attachments: attachment.Attachment[];
			/** any embedded content */
			embeds: embed.Embed[];
			/** reactions to the message */
			reactions?: reaction.Reaction[];
			/** used for validating a message was sent */
			nonce?: number | string;
			/** whether this message is pinned */
			pinned: boolean;
			/** if the message is generated by a webhook, this is the webhook's id */
			webhook_id?: Snowflake;
			/** type of message */
			type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 14 | 15;
			/** sent with Rich Presence-related chat embeds */
			activity?: Activity;
			/** sent with Rich Presence-related chat embeds */
			application?: Application;
			/** reference data sent with crossposted messages */
			message_reference?: Reference;
			/** message flags `OR`d together, describes extra features of the message */
			flags?: number;
		}


		interface Create extends Partial<Pick<Message, "content" | "nonce" | "tts">> {
			/** the contents of the file being sent */
			file?: File;
			/** embedded `rich` content */
			embed?: embed.Embed;
			/** JSON encoded body of any additional request fields. */
			payload_json?: string;
			/** object	allowed mentions for a message */
			allowed_mentions?: AllowedMentions;
		}

		type Edit = Partial<Pick<Message, "content" | "flags"> & Pick<Create, "embed">>;

		type DeleteEvent = Pick<Message, "id" | "channel_id" | "guild_id">;

		interface ReactionAddEvent {
			user_id: Snowflake;
			channel_id: Snowflake;
			message_id: Snowflake;
			guild_id?: Snowflake;
			member?: guildMember.GuildMember;
			emoji: Partial<emoji.Emoji>;
		}

		type ReactionRemoveEvent = Omit<ReactionAddEvent, "member">

		type ReactionRemoveAllEvent = Omit<ReactionRemoveEvent, "emoji" | "user_id">;

		type ReactionRemoveEmojiEvent = Omit<ReactionRemoveEvent, "user_id">;
	}

	namespace reaction {
		/** a message reaction */
		interface Reaction {
			/** times this emoji has been used to react */
			count: number;
			/** whether the current user reacted using this emoji */
			me: boolean;
			/** emoji information */
			emoji: Partial<emoji.Emoji>;
		}
	}

	namespace richPresence {
		/** a rich presence */
		interface RichPresence {
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
	}

	namespace role {
		/** a role */
		interface Role {
			/** role id */
			id: Snowflake;
			/** role name */
			name: string;
			/** integer representation of hexadecimal color code */
			color: number;
			/** if this role is pinned in the user listing */
			hoist: boolean;
			/** position of this role */
			position: number;
			/** permission bit set */
			permissions: number;
			/** whether this role is managed by an integration */
			managed: boolean;
			/** whether this role is mentionable */
			mentionable: boolean;
		}


		type Create = Pick<Role, "name" | "permissions" | "color" | "hoist" | "mentionable">;

		type ModifyPosition = Pick<Role, "id" | "position">;

		type Modify = Partial<Create>;


		interface UpdateEvent {
			guild_id: Snowflake;
			role: Role;
		}

		interface DeleteEvent {
			guild_id: Snowflake;
			role_id: Snowflake;
		}
	}

	namespace user {
		/** the connection object that the user has attached */
		interface Connection {
			/** id of the connection account */
			id: string;
			/** the username of the connection account */
			name: string;
			/** the service of the connection (twitch, youtube) */
			type: string;
			/** whether the connection is revoked */
			revoked: boolean;
			/** an array of partial server integrations */
			integrations: Partial<integration.Integration>[];
			/** whether the connection is verified */
			verified: boolean;
			/** whether friend sync is enabled for this connection */
			friend_sync: boolean;
			/** whether activities related to this connection will be shown in presence updates */
			show_activity: boolean;
			/** visibility of this connection */
			visibility: 0 | 1;
		}


		/** a user */
		interface User {
			/** the user's id */
			id: Snowflake;
			/** the user's username, not unique across the platform */
			username: string;
			/** the user's 4-digit discord-tag */
			discriminator: string;
			/** the user's avatar hash */
			avatar: string | null;
			/** whether the user belongs to an OAuth2 application */
			bot?: boolean;
			/** whether the user is an Official Discord System user (part of the urgent message system) */
			system?: boolean;
			/** whether the user has two factor enabled on their account */
			mfa_enabled?: boolean;
			/** the user's chosen language option */
			locale?: string;
			/** whether the email on this account has been verified */
			verified?: boolean;
			/** the user's email */
			email?: string;
			/** user flags `OR`d together, describes extra characteristics of a user */
			flags?: number;
			/** the type of Nitro subscription on a user's account */
			premium_type?: 1 | 2;
		}


		type Modify = Partial<NonNullable<Pick<User, "username" | "avatar">>>;

		interface GetGuilds {
			/** get guilds before this guild ID */
			before?: Snowflake;
			/** get guilds after this guild ID */
			after?: Snowflake;
			/** max number of guilds to return (1-100) */
			limit?: number;
		}
	}

	namespace voice {
		/** a voice region */
		interface Region {
			/** unique ID for the region */
			id: string;
			/** name of the region */
			name: string;
			/** true if this is a vip-only server */
			vip: boolean;
			/** true for a single server that is closest to the current user's client */
			optimal: boolean;
			/** whether this is a deprecated voice region (avoid switching to these) */
			deprecated: boolean;
			/** whether this is a custom voice region (used for events/etc) */
			custom: boolean;
		}


		/** a voice state. used to represent a user's voice connection status */
		interface State {
			/** the guild id this voice state is for */
			guild_id?: Snowflake;
			/** the channel id this user is connected to */
			channel_id: Snowflake | null;
			/** the user id this voice state is for */
			user_id: Snowflake;
			/** the guild member this voice state is for */
			member?: guildMember.GuildMember;
			/** the session id for this voice state */
			session_id: string;
			/** whether this user is deafened by the server */
			deaf: boolean;
			/** whether this user is muted by the server */
			mute: boolean;
			/** whether this user is locally deafened */
			self_deaf: boolean;
			/** whether this user is locally muted */
			self_mute: boolean;
			/** whether this user is streaming using "Go Live" */
			self_stream?: boolean;
			/** whether this user is muted by the current user */
			suppress: boolean;
		}


		interface ServerUpdateEvent {
			token: string;
			guild_id: Snowflake;
			endpoint: string;
		}
	}

	namespace webhook {
		/** a webhook. webhooks are a low-effort way to post messages to channels in Discord. they do not require a bot user or authentication to use */
		interface Webhook {
			/** the id of the webhook */
			id: Snowflake;
			/** the type of the webhook */
			type: 1 | 2;
			/** the guild id this webhook is for */
			guild_id?: Snowflake;
			/** the channel id this webhook is for */
			channel_id: Snowflake;
			/** the user this webhook was created by (not returned when getting a webhook with its token) */
			user?: user.User;
			/** the default name of the webhook */
			name?: string | null;
			/** the default avatar of the webhook */
			avatar?: string | null;
			/** the secure token of the webhook (returned for Incoming Webhooks) */
			token?: string;
		}


		type Create =
			NonNullable<Pick<Webhook, "name">>
			& Required<Pick<Webhook, "name">>;

		type Modify = Partial<NonNullable<Pick<Webhook, "name" | "avatar" | "channel_id">>>;

		interface ExecuteParams {
			/** waits for server confirmation of message send before response, and returns the created message body (defaults to `false`; when `false` a message that is not saved does not return an error) */
			wait?: boolean;
		}

		interface ExecuteBody extends Omit<message.Create, "embed" | "nonce"> {
			/** override the default username of the webhook */
			username?: string;
			/** override the default avatar of the webhook */
			avatar_url?: string;
			/** embedded `rich` content */
			embeds?: embed.Embed[];
		}


		type UpdateEvent = NonNullable<Pick<Webhook, "guild_id" | "channel_id">>
	}
}
