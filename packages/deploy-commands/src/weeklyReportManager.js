const dataManager = require("./dataManager")
const dateManager = import("../../../src/dateHandler.js")
const apiManager = require("./apiManager")

function showWeeklyReport(guildId, thisWeek) {
	return new Promise(async (resolve, reject) => {
		try {
			let successList = []
			let failList = []

			const users = await dataManager.getAllUsersFromGuild(guildId)
			for (user of users) {
				const userId = user.user_id
				const stat = await dataManager.getStat(userId, guildId)
				const userInfo = await apiManager.getUserInfo(userId)

				const statResult = {
					userId: userInfo.username,
					passDays: [],
					failDays: [],
				}

				if (thisWeek) {
					for (day of ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]) {
						if (stat.thisWeek[day].pass === "false") {
							statResult.failDays.push((await dateManager).convertDayInKorean(day))
						} else {
							statResult.passDays.push((await dateManager).convertDayInKorean(day))
						}
					}
				} else {
					for (day of ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]) {
						if (stat.lastWeek[day].pass === "false") {
							statResult.failDays.push((await dateManager).convertDayInKorean(day))
						} else {
							statResult.passDays.push((await dateManager).convertDayInKorean(day))
						}
					}
				}

				if (statResult.failDays.length !== 0) {
					failList.push(statResult)
				} else {
					successList.push(statResult)
				}
			}

			let response = "목표 달성 성공 리스트\n\n"

			for (successUser of successList) {
				response += `${successUser.userId}\n`
			}

			response += "\n목표 달성 실패 리스트\n\n"

			for (failUser of failList) {
				response += `${failUser.userId}\n실패한 요일 : ${failUser.failDays.join(", ")}`
			}

			console.log(response)

			resolve(response)
		} catch (e) {
			reject(e)
		}
	})
}

function selectWeeklyReportChannel(guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			throw new Error("selectWeeklyReportChannel")
		} catch (e) {
			reject(e)
		}
	})
}

module.exports = { showWeeklyReport, selectWeeklyReportChannel }
