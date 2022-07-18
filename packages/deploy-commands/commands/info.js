const dayjs = require("dayjs")
const { SlashCommandBuilder } = require("@discordjs/builders")
const dataManager = require("../src/dataManager")
const dateManager = import("../../../src/dateHandler.js")

module.exports = {
	data: new SlashCommandBuilder().setName("info").setDescription("내 정보 조회"), // 이번 주, 지난 주 통계 옵션 추가
	async execute(interaction) {
		try {
			const userId = interaction.user.id
			const guildId = interaction.guild.id
			const now = dayjs()
			const dayOfWeek = (await dateManager).convertIntToDay(now.day())
			const timeGoal = await dataManager.getTimeGoal(userId, guildId)
			const stat = await dataManager.getStat(userId, guildId)

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

			let timeReal = {
				thisWeek: {
					mon: { hour: 0, min: 0, second: 0, string: "" },
					tue: { hour: 0, min: 0, second: 0, string: "" },
					wed: { hour: 0, min: 0, second: 0, string: "" },
					thu: { hour: 0, min: 0, second: 0, string: "" },
					fri: { hour: 0, min: 0, second: 0, string: "" },
					sat: { hour: 0, min: 0, second: 0, string: "" },
					sun: { hour: 0, min: 0, second: 0, string: "" },
				},
			}

			for (day in timeReal.thisWeek) {
				timeReal.thisWeek[day].hour = dayjs.duration(stat.thisWeek[day].timeReal, "h").asHours()
				timeReal.thisWeek[day].min = dayjs.duration(stat.thisWeek[day].timeReal, "h").asMinutes()
				timeReal.thisWeek[day].second = dayjs.duration(stat.thisWeek[day].timeReal, "h").asSeconds()

				if (timeReal.thisWeek[day].hour >= 1) {
					timeReal.thisWeek[day].string += ` ${Math.floor(timeReal.thisWeek[day].hour)} 시간`
				}
				if (timeReal.thisWeek[day].min >= 1) {
					timeReal.thisWeek[day].string += ` ${Math.floor(timeReal.thisWeek[day].min) % 60} 분`
				}
				if (timeReal.thisWeek[day].second >= 1) {
					timeReal.thisWeek[day].string += ` ${Math.floor(timeReal.thisWeek[day].second) % 60} 초`
				}
				if (timeReal.thisWeek[day].string.length === 0) {
					timeReal.thisWeek[day].string += "0 초"
				}
			}

			await interaction.reply({
				content: `⏰ 목표 공부 시간  ➡️  ${timeGoal ?? "0"} 시간\n\n✏️ 오늘 공부한 시간  ➡️  ${
					timeReal.thisWeek[dayOfWeek].string
				}\n\n🏝 쉬는 요일  ➡️  ${skipDays.length === 0 ? "❌" : skipDays}\n\n📊 이번주 통계  👇\n\n월요일  ${
					stat.thisWeek.mon.pass === "false" ? "❌" : "✅"
				}  ➡️  ${timeReal.thisWeek.mon.string}\n\n화요일  ${
					stat.thisWeek.tue.pass === "false" ? "❌" : "✅"
				}  ➡️  ${timeReal.thisWeek.tue.string}\n\n수요일  ${
					stat.thisWeek.wed.pass === "false" ? "❌" : "✅"
				}  ➡️  ${timeReal.thisWeek.wed.string}\n\n목요일  ${
					stat.thisWeek.thu.pass === "false" ? "❌" : "✅"
				}  ➡️  ${timeReal.thisWeek.thu.string}\n\n금요일  ${
					stat.thisWeek.fri.pass === "false" ? "❌" : "✅"
				}  ➡️  ${timeReal.thisWeek.fri.string}\n\n토요일  ${
					stat.thisWeek.sat.pass === "false" ? "❌" : "✅"
				}  ➡️  ${timeReal.thisWeek.sat.string}\n\n일요일  ${
					stat.thisWeek.sun.pass === "false" ? "❌" : "✅"
				}  ➡️  ${timeReal.thisWeek.sun.string}`,
				ephemeral: true,
			})
		} catch (e) {
			await interaction.reply(`명령을 수행하는 중에 오류가 발생하였습니다! 다시 시도해주세요 :(`)
			console.error(e)
		}
	},
}
