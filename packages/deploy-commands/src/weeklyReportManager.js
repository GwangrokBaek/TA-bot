const dayjs = require("dayjs")
const dataManager = require("./dataManager")
const dateManager = import("../../../src/dateHandler.js")

function showWeeklyReport(guildId, thisWeek) {
	return new Promise(async (resolve, reject) => {
		try {
			let weekString
			let successList = []
			let failList = []

			const users = await dataManager.getAllUsersFromGuild(guildId)
			for (user of users) {
				const userId = user.user_id
				const stat = await dataManager.getStat(userId, guildId)

				const statResult = {
					userId: `<@${userId}>`,
					passDays: [],
					failDays: [],
				}

				if (thisWeek) {
					weekString = "이번주"
					for (day of ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]) {
						if (stat.thisWeek[day].pass === "false") {
							statResult.failDays.push((await dateManager).convertDayInKorean(day))
						} else {
							statResult.passDays.push((await dateManager).convertDayInKorean(day))
						}
					}
				} else {
					weekString = "지난주"
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

			let response = `📢 지난주 통계 보고 📢\n\n🔸 ${weekString} 목표 달성 성공 멤버는 아래와 같습니다 ☺️\n\n`

			if (successList.length === 0) {
				response += `	– 엥 ⁉️ ${weekString}에는 아무도 성공 못하신 것 같아요...\n`
			} else {
				for (successUser of successList) {
					response += `	– ${successUser.userId}\n\n`
				}
			}

			response += `\n🔸 ${weekString} 목표 달성 실패 멤버는 아래와 같습니다 😢\n\n`

			if (failList.length === 0) {
				response += "	– 세상에나❗️ 모든 멤버가 목표를 달성했어요!"
			} else {
				for (failUser of failList) {
					response += `	– ${failUser.userId}  ➡️  ${failUser.failDays.join(", ")} 실패\n\n`
				}
			}

			resolve(response)
		} catch (e) {
			reject(e)
		}
	})
}

function showFameReport(guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			let response = ""

			let mostTimeValueObject = {
				hour: 0,
				min: 0,
				second: 0,
				string: "",
			}

			const [userIdWithMostTime, mostTimeValue] = await dataManager.getMostTimeRealUserFromGuild(guildId)

			mostTimeValueObject.hour = dayjs.duration(mostTimeValue, "h").asHours()
			mostTimeValueObject.min = dayjs.duration(mostTimeValue, "h").asMinutes()
			mostTimeValueObject.second = dayjs.duration(mostTimeValue, "h").asSeconds()

			if (mostTimeValueObject.hour >= 1) {
				mostTimeValueObject.string += ` ${Math.floor(mostTimeValueObject.hour)} 시간`
			}
			if (mostTimeValueObject.min >= 1) {
				mostTimeValueObject.string += ` ${Math.floor(mostTimeValueObject.min) % 60} 분`
			}
			if (mostTimeValueObject.second >= 1) {
				mostTimeValueObject.string += ` ${Math.floor(mostTimeValueObject.second) % 60} 초`
			}
			if (mostTimeValueObject.string.length === 0) {
				mostTimeValueObject.string += "0 초"
			}

			const [userIdWithMostPassCounts, mostPassCounts] = await dataManager.getMostPassCountsUserFromGuild(guildId)

			const rank = await dataManager.getRankFromGuild(guildId)
			let rankString = ""
			let grade = 0

			for (user of rank) {
				grade += 1
				rankString += `${grade === 1 ? "🥇 1" : grade === 2 ? "🥈 2" : "       " + grade}위  ➡️  <@${
					user.user_id
				}> (${Number(user.points).toFixed(2)} 점)\n\n`
			}

			response = `🏆 명예의 전당 🏆\n\n✅ 가장 많이 목표를 달성한 사람  ➡️  <@${userIdWithMostPassCounts}> (${mostPassCounts} 회)\n\n⏰ 가장 많이 공부한 사람  ➡️  <@${userIdWithMostTime}> (${mostTimeValueObject.string})\n\n📊 종합 순위  👇\n\n${rankString}가장 많이 목표를 달성한 사람의 경우, 매주 월요일 오전 8시를 기준으로 갱신됩니다\n\n종합순위는 목표 달성 성공 횟수와 총 공부 시간을 기준으로 결정됩니다`
			resolve(response)
		} catch (e) {
			reject(e)
		}
	})
}

function setAutoWeeklyReport(guildId, autoReport) {
	return new Promise(async (resolve, reject) => {
		try {
			let response = ""

			const channel = await dataManager.getTime2StudyChannelOfGuild(guildId)

			if (channel === null) {
				response +=
					"Time2Study 알림용 채널이 설정되어 있지 않습니다. 설정 전에 알림용 채널을 먼저 설정해주세요!"
			} else {
				if (autoReport === "enable") {
					await dataManager.setAutoWeeklyReportOfGuild(guildId, true)
					response +=
						"자동 통계 보고를 활성화 하였습니다! 이제 매주 월요일 오전 8시에 지난주 통계를 보고합니다."
				} else {
					await dataManager.setAutoWeeklyReportOfGuild(guildId, false)
					response += "자동 통계 보고를 비활성화 하였습니다!"
				}
			}

			resolve(response)
		} catch (e) {
			reject(e)
		}
	})
}

module.exports = { showWeeklyReport, showFameReport, setAutoWeeklyReport }
