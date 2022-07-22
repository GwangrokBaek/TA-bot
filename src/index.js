import fs from "fs"
import path from "path"
import * as url from "url"
import dotenv from "dotenv"
import { Client, Collection, Permissions } from "discord.js"
import {
	getLastJoinTimestamp,
	setLastJoinTimestamp,
	getTimeGoal,
	setPassValueOfSpecificStat,
	addTimeRealToSpecificStat,
	getTimeRealOfSpecificStat,
	putGuild,
	deleteGuild,
	addMorningCounts,
	addNightCounts,
} from "../packages/deploy-commands/src/dataManager.js"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration.js"
import { convertIntToDay } from "./dateHandler.js"
import { initScheduler } from "./scheduler.js"
import { addRoleToMember } from "../packages/deploy-commands/src/apiManager.js"

dayjs.extend(duration)
dotenv.config()

const token = process.env.DISCORD_TOKEN
const client = new Client({ intents: 641 })
client.commands = new Collection()

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const commandsPath = path.join(__dirname, "../packages/deploy-commands/commands")
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"))

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file)
	const command = await import(filePath)
	client.commands.set(command.data.name, command)
}

client.on("ready", (client) => {
	console.log(`Ready! Logged in as ${client.user.tag}`)
})

client.on("guildCreate", async (guild) => {
	console.log(`Joined a new guild : ${guild.name}(${guild.id})`)
	await putGuild(guild.id)
	await guild.roles.create({
		name: "Time2Study-admin",
		permissions: [],
	})

	const role = guild.roles.cache.find((r) => r.name === "Time2Study-admin")
	await addRoleToMember(guild.id, guild.ownerId, role.id)
})

client.on("guildDelete", async (guild) => {
	console.log(`Left a guild : ${guild.name}(${guild.id})`)
	await deleteGuild(guild.id)
})

client.on("interactionCreate", async (interaction) => {
	console.log(
		`${interaction.user.tag} in #${interaction.channel.name} of ${interaction.guild.name} server triggered an interaction`
	)

	if (interaction.isCommand()) {
		const command = client.commands.get(interaction.commandName)

		if (!command) return

		try {
			await command.default.execute(interaction)
		} catch (error) {
			console.error(error)
		}
	} else if (interaction.isSelectMenu()) {
		const messageArray = interaction.message.interaction.commandName.split(" ")
		const command = client.commands.get(messageArray[0])

		if (!command) return

		try {
			await command.default.interact(interaction)
		} catch (error) {
			console.error(error)
		}
	}
})

client.on("voiceStateUpdate", async (oldState, newState) => {
	if (!oldState.selfVideo && newState.selfVideo) {
		const now = dayjs()

		const before = await getLastJoinTimestamp(newState.id, newState.guild.id)

		if (now.isAfter(before, "day")) {
			if (now.get("h") <= 10) {
				await addMorningCounts(newState.id, newState.guild.id)
			} else if (now.get("h") >= 21) {
				await addNightCounts(newState.id, newState.guild.id)
			}
		}

		setLastJoinTimestamp(newState.id, newState.guild.id, now.format())
	} else if (oldState.selfVideo && oldState.channelId && (!newState.selfVideo || !newState.channelId)) {
		const now = dayjs()
		const before = dayjs(await getLastJoinTimestamp(newState.id, newState.guild.id))
		const duration = now - before

		const studyTime = dayjs.duration(duration, "ms").asHours()

		const today = now.day()

		if (now.isAfter(before, "day")) {
			const studyTimeOfToday = now.hour()
			const studyTimeOflastDay = studyTime - studyTimeOfToday

			if (convertIntToDay(today) === "mon") {
				await addTimeRealToSpecificStat(newState.id, newState.guild.id, false, "sun", studyTimeOflastDay)
				if (
					(await getTimeRealOfSpecificStat(newState.id, newState.guild.id, false, "sun")) >=
					(await getTimeGoal(newState.id, newState.guild.id))
				) {
					await setPassValueOfSpecificStat(newState.id, newState.guild.id, false, "sun", "true")
				}
			} else {
				await addTimeRealToSpecificStat(
					newState.id,
					newState.guild.id,
					true,
					convertIntToDay(today - 1),
					studyTimeOflastDay
				)
				if (
					(await getTimeRealOfSpecificStat(
						newState.id,
						newState.guild.id,
						false,
						convertIntToDay(today - 1)
					)) >= (await getTimeGoal(newState.id, newState.guild.id))
				) {
					await setPassValueOfSpecificStat(
						newState.id,
						newState.guild.id,
						true,
						convertIntToDay(today - 1),
						"true"
					)
				}
			}

			await addTimeRealToSpecificStat(
				newState.id,
				newState.guild.id,
				true,
				convertIntToDay(today),
				studyTimeOfToday
			)

			if (
				(await getTimeRealOfSpecificStat(newState.id, newState.guild.id, true, convertIntToDay(today))) >=
				(await getTimeGoal(newState.id, newState.guild.id))
			) {
				await setPassValueOfSpecificStat(newState.id, newState.guild.id, true, convertIntToDay(today), "true")
			}
		} else if (now.isSame(before, "day")) {
			await addTimeRealToSpecificStat(newState.id, newState.guild.id, true, convertIntToDay(today), studyTime)

			if (
				(await getTimeRealOfSpecificStat(newState.id, newState.guild.id, true, convertIntToDay(today))) >=
				(await getTimeGoal(newState.id, newState.guild.id))
			) {
				await setPassValueOfSpecificStat(newState.id, newState.guild.id, true, convertIntToDay(today), "true")
			}
		}
	}
})

client.login(token)
initScheduler()
