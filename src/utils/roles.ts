import { env } from "~/env.mjs"
import { RolesEnum } from "../interfaces/roles.enum"

export function roleIdToEnum(roleId: string): RolesEnum | null {
	switch (true) {
		case env.DISCORD_ROLE_ADMIN.includes(roleId):
			return RolesEnum.ADMIN
		case env.DISCORD_ROLE_PLANNING.includes(roleId):
			return RolesEnum.PLANNING
		case env.DISCORD_ROLE_STREAMER.includes(roleId):
			return RolesEnum.STREAMER
		case env.DISCORD_ROLE_TECH.includes(roleId):
			return RolesEnum.TECH
		case env.DISCORD_ROLE_MODERATOR.includes(roleId):
			return RolesEnum.MODERATOR
		default:
			return null
	}
}
