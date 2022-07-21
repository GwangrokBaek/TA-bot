require("dotenv").config()
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")

const token = process.env.DISCORD_TOKEN
const rest = new REST({ version: "9" }).setToken(token)

function registerCommands(clientId, commands) {
	return new Promise(async (resolve, reject) => {
		try {
			await rest
				.put(Routes.applicationCommands(clientId), { body: commands })
				.then(() => console.log("Successfully registered application commands."))
				.catch((error) => console.error(error))
			resolve(true)
		} catch (e) {
			reject(e)
		}
	})
}

function getUserInfo(userId) {
	return new Promise(async (resolve, reject) => {
		try {
			const result = await rest.get(Routes.user(userId))
			resolve(result)
		} catch (e) {
			reject(e)
		}
	})
}

function getAllChannels(guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			const result = await rest.get(Routes.guildChannels(guildId))
			resolve(result)
		} catch (e) {
			reject(e)
		}
	})
}

function getChannelName(channelId) {
	return new Promise(async (resolve, reject) => {
		try {
			const result = await rest.get(Routes.channel(channelId))
			resolve(result.name)
		} catch (e) {
			reject(e)
		}
	})
}

function sendMessageToChannel(channelId, message) {
	return new Promise(async (resolve, reject) => {
		try {
			const requestBody = { content: message }
			const result = await rest.post(
				Routes.channelMessages(channelId),
				(RequestData = {
					body: JSON.stringify(requestBody),
					headers: { "Content-Type": "application/json" },
					appendToFormData: true,
					passThroughBody: true,
				})
			)
			resolve(true)
		} catch (e) {
			reject(e)
		}
	})
}

module.exports = { registerCommands, getUserInfo, getAllChannels, getChannelName, sendMessageToChannel }
