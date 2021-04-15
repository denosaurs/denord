import type { PrivateUser } from "./user.ts";
import type {
  BanEvent,
  EmojisUpdateEvent,
  GatewayGuild,
  IntegrationsUpdateEvent,
  UnavailableGuild,
} from "./guild.ts";
import type { Application } from "./oauth2.ts";
import type { Snowflake } from "./common.ts";
import type {
  Channel,
  DeleteBulkEvent as ChannelDeleteBulkEvent,
  GroupDMChannel,
  GuildChannels,
  PinsUpdateEvent,
  TypingStartEvent,
} from "./channel.ts";
import type {
  DeleteEvent as MessageDeleteEvent,
  Message,
  ReactionAddEvent,
  ReactionRemoveAllEvent,
  ReactionRemoveEmojiEvent,
  ReactionRemoveEvent,
  UpdateEvent as MessageUpdateEvent,
} from "./message.ts";
import type { ActiveStatus, Activity, Presence } from "./presence.ts";
import type {
  CreateEvent as InviteCreateEvent,
  DeleteEvent as InviteDeleteEvent,
} from "./invite.ts";
import type {
  DeleteEvent as IntegrationDeleteEvent,
  Integration,
} from "./integration.ts";
import type {
  DeleteEvent as RoleDeleteEvent,
  UpdateEvent as RoleUpdateEvent,
} from "./role.ts";
import type { ApplicationCommandEvent, Interaction } from "./interaction.ts";
import type { UpdateEvent as WebhookUpdateEvent } from "./webhook.ts";
import type {
  ServerUpdateEvent as VoiceServerUpdateEvent,
  State as VoiceState,
} from "./voice.ts";
import type {
  AddEvent as GuildMemberAddEvent,
  ChunkEvent as GuildMembersChunkEvent,
  RemoveEvent as GuildMemberRemoveEvent,
  UpdateEvent as GuildMemberUpdateEvent,
} from "./guildMember.ts";

export interface Gateway {
  url: string;
}

export interface GatewayBot extends Gateway {
  shards: number;
  session_start_limit: {
    total: number;
    remaining: number;
    reset_after: number;
    max_concurrency: number;
  };
}

interface EventPayload<T extends keyof Events> {
  op: 0;
  d: Events[T];
  s: number;
  t: T;
}

export type SpecificEventPayload<T extends keyof Events> = T extends
  keyof Events ? EventPayload<T>
  : never;

export type SpecificEvent = SpecificEventPayload<keyof Events>;

interface OpPayload<T extends keyof Ops> {
  op: T;
  d: Ops[T];
  s: null;
  t: null;
}

type SpecificOpPayload<T extends keyof Ops> = T extends keyof Ops ? OpPayload<T>
  : never;

export type SpecificOp = SpecificOpPayload<keyof Ops>;

export type Payload =
  | SpecificEvent
  | SpecificOp;

export interface Ops {
  1: number;
  2: { // Voice
    ssrc: number;
    ip: string;
    port: number;
    modes: string[];
    heartbeat_interval: number;
  };
  6: number; // Voice
  7: undefined;
  8: { // Voice
    heartbeat_interval: number;
  };
  9: boolean;
  10: {
    heartbeat_interval: number;
  };
  11: undefined;
}

export interface Events {
  READY: ReadyEvent;
  RESUMED: undefined;
  RECONNECT: undefined;

  CHANNEL_CREATE: GuildChannels;
  CHANNEL_UPDATE: Exclude<Channel, GroupDMChannel>;
  CHANNEL_DELETE: Exclude<Channel, GroupDMChannel>;
  CHANNEL_PINS_UPDATE: PinsUpdateEvent;

  GUILD_CREATE: GatewayGuild;
  GUILD_UPDATE: GatewayGuild;
  GUILD_DELETE: UnavailableGuild;
  GUILD_BAN_ADD: BanEvent;
  GUILD_BAN_REMOVE: BanEvent;
  GUILD_EMOJIS_UPDATE: EmojisUpdateEvent;
  GUILD_INTEGRATIONS_UPDATE: IntegrationsUpdateEvent;
  GUILD_MEMBER_ADD: GuildMemberAddEvent;
  GUILD_MEMBER_REMOVE: GuildMemberRemoveEvent;
  GUILD_MEMBER_UPDATE: GuildMemberUpdateEvent;
  GUILD_MEMBERS_CHUNK: GuildMembersChunkEvent;
  GUILD_ROLE_CREATE: RoleUpdateEvent;
  GUILD_ROLE_UPDATE: RoleUpdateEvent;
  GUILD_ROLE_DELETE: RoleDeleteEvent;

  INTEGRATION_CREATE: Integration & { guild_id: Snowflake };
  INTEGRATION_UPDATE: Integration & { guild_id: Snowflake };
  INTEGRATION_DELETE: IntegrationDeleteEvent;

  INVITE_CREATE: InviteCreateEvent;
  INVITE_DELETE: InviteDeleteEvent;

  MESSAGE_CREATE: Message;
  MESSAGE_UPDATE: MessageUpdateEvent;
  MESSAGE_DELETE: MessageDeleteEvent;
  MESSAGE_DELETE_BULK: ChannelDeleteBulkEvent;
  MESSAGE_REACTION_ADD: ReactionAddEvent;
  MESSAGE_REACTION_REMOVE: ReactionRemoveEvent;
  MESSAGE_REACTION_REMOVE_ALL: ReactionRemoveAllEvent;
  MESSAGE_REACTION_REMOVE_EMOJI: ReactionRemoveEmojiEvent;

  PRESENCE_UPDATE: Presence;
  TYPING_START: TypingStartEvent;
  USER_UPDATE: PrivateUser;

  VOICE_STATE_UPDATE: VoiceState;
  VOICE_SERVER_UPDATE: VoiceServerUpdateEvent;

  WEBHOOKS_UPDATE: WebhookUpdateEvent;

  APPLICATION_COMMAND_CREATE: ApplicationCommandEvent;
  APPLICATION_COMMAND_UPDATE: ApplicationCommandEvent;
  APPLICATION_COMMAND_DELETE: ApplicationCommandEvent;

  INTERACTION_CREATE: Interaction;
}

export interface ReadyEvent {
  v: number;
  user: PrivateUser;
  private_channels: [];
  guilds: UnavailableGuild[];
  session_id: string;
  shard?: [number, number];
  application: Pick<Application, "id" | "flags">;
}

export interface GuildRequestMembers {
  guild_id: Snowflake;
  query?: string;
  limit: number;
  presences?: boolean;
  user_ids?: Snowflake | Snowflake[];
  nonce?: string;
}

export interface PresenceUpdate {
  since: number | null;
  activities: Activity[];
  status: ActiveStatus;
  afk: boolean;
}
