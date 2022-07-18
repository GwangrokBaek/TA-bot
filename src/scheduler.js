import schedule from "node-schedule"
import { getStat, getAllGuilds, getAllUsersFromGuild, setStat } from "../packages/deploy-commands/src/dataManager.js"

function cloneObject(obj) {
	var clone = {}
	for (var key in obj) {
		if (typeof obj[key] == "object" && obj[key] != null) {
			clone[key] = cloneObject(obj[key])
		} else {
			clone[key] = obj[key]
		}
	}

	return clone
}

let statScheduler

async function initScheduler() {
	statScheduler = schedule.scheduleJob("0 0 0 * * 1", async function () {
		console.log("Start statScheduler to reset and copy the stat of this week")
		const guilds = await getAllGuilds()

		for (const guild of guilds) {
			const users = await getAllUsersFromGuild(guild.guild_id)
			for (const user of users) {
				let stat = await getStat(user.user_id, guild.guild_id)

				stat.lastWeek = cloneObject(stat.thisWeek)

				for (const day in stat.thisWeek) {
					if (stat.thisWeek[day].pass !== "skip") {
						stat.thisWeek[day].pass = "false"
					}
					stat.thisWeek[day].timeReal = 0
				}

				setStat(user.user_id, guild.guild_id, stat)
			}
		}
		console.log("End statScheduler to reset and copy the stat of this week")
	})
}

export { initScheduler }
