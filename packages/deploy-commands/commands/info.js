const dayjs = require("dayjs")
const { SlashCommandBuilder } = require("@discordjs/builders")
const dataManager = require("../src/dataManager")
const dateManager = import("../../../src/dateHandler.js")

module.exports = {
	data: new SlashCommandBuilder().setName("info").setDescription("내 정보 조회"), // 이번 주, 지난 주 통계 옵션 추가
	async execute(interaction) {
		try {
			const userId = interaction.user.id
			const now = dayjs()
			const dayOfWeek = (await dateManager).convertIntToDay(now.day())
			const timeGoal = await dataManager.getTimeGoal(userId)
			const stat = await dataManager.getStat(userId)

			let skipDays = ""

			for (day in stat.thisWeek) {
				if (stat.thisWeek[day].pass === "skip") {
					if (skipDays.length === 0) {
						skipDays = (await dateManager).convertDayInKorean(day)
					} else {
						skipDays = skipDays + ", " + (await dateManager).convertDayInKorean(day)
					}
				}
			}

			await interaction.reply({
				content: `⏰ 목표 공부 시간  ➡️  ${timeGoal ?? "0"} 시간\n\n✏️ 오늘 공부한 시간  ➡️  ${
					stat.thisWeek[dayOfWeek].timeReal?.toFixed(1) ?? "0"
				} 시간\n\n🏝 쉬는 요일  ➡️  ${
					skipDays.length === 0 ? "❌" : skipDays
				}\n\n📊 이번주 통계  👇\n\n월요일  ${stat.thisWeek.mon.pass === false ? "❌" : "✅"}  ➡️  ${
					stat.thisWeek.mon.timeReal?.toFixed(1) ?? 0
				} 시간\n\n화요일  ${stat.thisWeek.tue.pass === false ? "❌" : "✅"}  ➡️  ${
					stat.thisWeek.tue.timeReal?.toFixed(1) ?? 0
				} 시간\n\n수요일  ${stat.thisWeek.wed.pass === false ? "❌" : "✅"}  ➡️  ${
					stat.thisWeek.wed.timeReal?.toFixed(1) ?? 0
				} 시간\n\n목요일  ${stat.thisWeek.thu.pass === false ? "❌" : "✅"}  ➡️  ${
					stat.thisWeek.thu.timeReal?.toFixed(1) ?? 0
				} 시간\n\n금요일  ${stat.thisWeek.fri.pass === false ? "❌" : "✅"}  ➡️  ${
					stat.thisWeek.fri.timeReal?.toFixed(1) ?? 0
				} 시간\n\n토요일  ${stat.thisWeek.sat.pass === false ? "❌" : "✅"}  ➡️  ${
					stat.thisWeek.sat.timeReal?.toFixed(1) ?? 0
				} 시간\n\n일요일  ${stat.thisWeek.sun.pass === false ? "❌" : "✅"}  ➡️  ${
					stat.thisWeek.sun.timeReal?.toFixed(1) ?? 0
				} 시간`,
				ephemeral: true,
			})
		} catch (e) {
			await interaction.reply(`명령을 수행하는 중에 오류가 발생하였습니다! 다시 시도해주세요 :(`)
			console.error(e)
		}
	},
}
