require("dotenv").config()
const fs = require("node:fs")
const path = require("node:path")
const apiManager = require("./apiManager")

const clientId = process.env.CLIENT_ID

const commands = []
const commandsPath = path.join(__dirname, "../commands")
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"))

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file)
	const command = require(filePath)
	commands.push(command.data?.toJSON())
}

async function main() {
	await apiManager.registerCommands(clientId, commands)
}

main()
