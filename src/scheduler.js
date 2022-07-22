import schedule from "node-schedule"
import { sendMessageToChannel } from "../packages/deploy-commands/src/apiManager.js"
import {
	getStat,
	getAllGuilds,
	getAllUsersFromGuild,
	setStat,
	getAutoWeeklyReportOfGuild,
	getTime2StudyChannelOfGuild,
	addPassFailSkipCountsToUser,
} from "../packages/deploy-commands/src/dataManager.js"
import { showFameReport, showWeeklyReport } from "../packages/deploy-commands/src/weeklyReportManager.js"

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
let autoReportScheduler

async function initScheduler() {
	statScheduler = schedule.scheduleJob("0 0 0 * * 1", async function () {
		console.log("Start statScheduler to reset and copy the stat of this week")
		try {
			const guilds = await getAllGuilds()

			for (const guild of guilds) {
				const users = await getAllUsersFromGuild(guild.guild_id)
				for (const user of users) {
					let stat = await getStat(user.user_id, guild.guild_id)

					stat.lastWeek = cloneObject(stat.thisWeek)

					let passCounts = 0
					let failCounts = 0
					let skipCounts = 0

					for (const day in stat.thisWeek) {
						if (stat.thisWeek[day].pass !== "skip") {
							if (stat.thisWeek[day].pass === "true") {
								passCounts += 1
							} else if (stat.thisWeek[day].pass === "false") {
								failCounts += 1
							}

							stat.thisWeek[day].pass = "false"
						} else {
							skipCounts += 1
						}
						stat.thisWeek[day].timeReal = 0
					}

					addPassFailSkipCountsToUser(user.user_id, guild.guild_id, passCounts, failCounts, skipCounts)
					setStat(user.user_id, guild.guild_id, stat)
				}
			}
		} catch (e) {
			console.error(e)
		}
		console.log("End statScheduler")
	})

	autoReportScheduler = schedule.scheduleJob("0 0 8 * * 1", async function () {
		console.log("Start autoReportScheduler to report the stat of whole members automatically")
		try {
			const guilds = await getAllGuilds()

			for (const guild of guilds) {
				const autoWeeklyReport = await getAutoWeeklyReportOfGuild(guild.guild_id)

				if (autoWeeklyReport) {
					const channelId = await getTime2StudyChannelOfGuild(guild.guild_id)

					if (channelId) {
						const reportStatMessage = await showWeeklyReport(guild.guild_id, false)
						await sendMessageToChannel(channelId, reportStatMessage)
						await sendMessageToChannel(channelId, "\n\n--------------------------------------------\n\n")
						const reportFameMessage = await showFameReport(guild.guild_id)
						await sendMessageToChannel(channelId, reportFameMessage)
						await sendMessageToChannel(channelId, "\n\n--------------------------------------------\n\n")

						console.log(
							`Successfully send weeklyReport to channel : [${channelId}] of guild : [${guild.guild_id}]`
						)
					}
				}
			}
		} catch (e) {
			console.error(e)
		}
		console.log("End autoReportScheduler")
	})
}

export { initScheduler }
