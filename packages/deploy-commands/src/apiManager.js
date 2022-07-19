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
				.catch(console.error)

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
			console.log(result)
			resolve(result)
		} catch (e) {
			reject(e)
		}
	})
}

module.exports = { registerCommands, getUserInfo }
