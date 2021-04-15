import type { Snowflake } from "./common.ts";
import type { PublicUser } from "./user.ts";
import type { Embed } from "./embed.ts";
import type { BaseCreate as MessageBaseCreate } from "./message.ts";
import type { GuildMember } from "./guildMember.ts";

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

export interface Interaction {
  id: Snowflake;
  application_id: Snowflake;
  type: InteractionType;
  data?: ApplicationCommandInteractionData;
  guild_id?: Snowflake;
  channel_id?: Snowflake;
  member?: GuildMember;
  user?: PublicUser;
  token: string;
  version: 1;
}

export type InteractionType = 1 | 2;

export interface ApplicationCommandInteractionData {
  id: Snowflake;
  name: string;
  options?: ApplicationCommandInteractionDataOption[];
}

export interface ApplicationCommandInteractionDataOptionBase {
  name: string;
  type: ApplicationCommandOptionType;
}

export interface ApplicationCommandInteractionDataOptionValue
  extends ApplicationCommandInteractionDataOptionBase {
  value: Snowflake | string | number | boolean;
}
export interface ApplicationCommandInteractionDataOptionOptions
  extends ApplicationCommandInteractionDataOptionBase {
  options: ApplicationCommandInteractionDataOption[];
}

export type ApplicationCommandInteractionDataOption =
  | ApplicationCommandInteractionDataOptionValue
  | ApplicationCommandInteractionDataOptionOptions;

export interface ResponseBase {
  type: InteractionResponseType;
}

export interface ResponseData extends ResponseBase {
  type: 4;
  data: InteractionApplicationCommandCallbackData;
}

export interface ResponseNoData extends ResponseBase {
  type: Exclude<InteractionResponseType, 4>;
}

export type Response = ResponseData | ResponseNoData;

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
