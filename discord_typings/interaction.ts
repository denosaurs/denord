import type { Snowflake } from "./common.ts";
import type { PublicUser } from "./user.ts";
import type { Embed } from "./embed.ts";
import type { BaseCreate as MessageBaseCreate } from "./message.ts";
import type { GuildMember } from "./guildMember.ts";
import type { Role } from "./role.ts";
import type { TextBasedGuildChannel } from "./channel.ts";

export interface ApplicationCommand {
  id: Snowflake;
  application_id: Snowflake;
  name: string;
  description: string;
  options?: ApplicationCommandOption[];
  default_permission?: boolean;
}

export interface ApplicationCommandOption {
  type: ApplicationCommandOptionType;
  name: string;
  description: string;
  default?: boolean;
  required?: boolean;
  choices?: ApplicationCommandOptionChoice[];
  options?: ApplicationCommandOption[];
}

export type ApplicationCommandOptionType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface ApplicationCommandOptionChoice {
  name: string;
  value: string | number;
}

interface BaseInteraction {
  id: Snowflake;
  application_id: Snowflake;
  type: InteractionType;
  guild_id?: Snowflake;
  channel_id?: Snowflake;
  member?: GuildMember;
  user?: PublicUser;
  token: string;
  version: 1;
}

export interface PingInteraction extends BaseInteraction {
  type: 1;
}

export interface ApplicationCommandInteraction extends BaseInteraction {
  type: 2;
  data: ApplicationCommandInteractionData;
}

export type Interaction = PingInteraction | ApplicationCommandInteraction;

export type InteractionType = 1 | 2;

export interface ApplicationCommandInteractionData {
  id: Snowflake;
  name: string;
  resolved?: ApplicationCommandInteractionDataResolved;
  options?: ApplicationCommandInteractionDataOption[];
}

interface BaseApplicationCommandInteractionDataOption {
  name: string;
  type: ApplicationCommandOptionType;
}

interface SubCommandApplicationCommandInteractionDataOption
  extends BaseApplicationCommandInteractionDataOption {
  type: 1;
  options: ApplicationCommandInteractionDataOption[];
}

interface SubCommandGroupApplicationCommandInteractionDataOption
  extends BaseApplicationCommandInteractionDataOption {
  type: 2;
  options: ApplicationCommandInteractionDataOption[];
}

interface StringApplicationCommandInteractionDataOption
  extends BaseApplicationCommandInteractionDataOption {
  type: 3;
  value: string;
}

interface IntegerApplicationCommandInteractionDataOption
  extends BaseApplicationCommandInteractionDataOption {
  type: 4;
  value: number;
}

interface BooleanApplicationCommandInteractionDataOption
  extends BaseApplicationCommandInteractionDataOption {
  type: 5;
  value: boolean;
}

interface UserApplicationCommandInteractionDataOption
  extends BaseApplicationCommandInteractionDataOption {
  type: 6;
  value: Snowflake;
}

interface ChannelApplicationCommandInteractionDataOption
  extends BaseApplicationCommandInteractionDataOption {
  type: 7;
  value: Snowflake;
}

interface RoleApplicationCommandInteractionDataOption
  extends BaseApplicationCommandInteractionDataOption {
  type: 8;
  value: Snowflake;
}

export type ApplicationCommandInteractionDataOption =
  | SubCommandApplicationCommandInteractionDataOption
  | SubCommandGroupApplicationCommandInteractionDataOption
  | StringApplicationCommandInteractionDataOption
  | IntegerApplicationCommandInteractionDataOption
  | BooleanApplicationCommandInteractionDataOption
  | UserApplicationCommandInteractionDataOption
  | ChannelApplicationCommandInteractionDataOption
  | RoleApplicationCommandInteractionDataOption;

export interface ApplicationCommandInteractionDataResolved {
  users?: Record<Snowflake, PublicUser>;
  members?: Record<Snowflake, Omit<GuildMember, "user" | "deaf" | "mute">>;
  roles?: Record<Snowflake, Role>;
  channels?: Record<
    Snowflake,
    Pick<TextBasedGuildChannel, "id" | "name" | "type" | "permissions">
  >;
}

export interface BaseResponse {
  type: InteractionResponseType;
}

export interface DataResponse extends BaseResponse {
  type: 4;
  data: InteractionApplicationCommandCallbackData;
}

export interface NoDataResponse extends BaseResponse {
  type: Exclude<InteractionResponseType, 4>;
}

export type Response = DataResponse | NoDataResponse;

export type InteractionResponseType = 1 | 4 | 5;

export type InteractionApplicationCommandCallbackData =
  & Pick<MessageBaseCreate, "tts" | "allowed_mentions" | "content">
  & {
    embeds?: Embed[];
    flags?: number;
  };

export interface CreateGlobalApplicationCommand {
  name: string;
  description: string;
  options?: ApplicationCommandOption[];
  default_permission?: boolean;
}

export interface EditGlobalApplicationCommand {
  name?: string;
  description?: string;
  options?: ApplicationCommandOption[] | null;
  default_permission?: boolean;
}

export type CreateGuildApplicationCommand = CreateGlobalApplicationCommand;

export type EditGuildApplicationCommand = EditGlobalApplicationCommand;

export interface MessageInteraction {
  id: Snowflake;
  type: InteractionType;
  name: string;
  user: PublicUser;
}

export interface GuildApplicationCommandPermissions {
  id: Snowflake;
  application_id: Snowflake;
  guild_id: Snowflake;
  permissions: ApplicationCommandPermissions[];
}

export interface ApplicationCommandPermissions {
  id: Snowflake;
  type: ApplicationCommandPermissionType;
  permission: boolean;
}

export type ApplicationCommandPermissionType = 1 | 2;

export interface EditApplicationCommandPermissions {
  permissions: ApplicationCommandPermissions[];
}

export type BatchEditApplicationCommandPermissions = Pick<
  GuildApplicationCommandPermissions,
  "id" | "permissions"
>[];

export type ApplicationCommandEvent = ApplicationCommand & {
  guild_id?: Snowflake;
};
