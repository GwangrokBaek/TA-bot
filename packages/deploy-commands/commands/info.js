const dayjs = require("dayjs")
const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageButton, MessageActionRow } = require("discord.js")
const dataManager = require("../src/dataManager")
const badgeManager = require("../src/badgeManager")
const dateManager = import("../../../src/dateHandler.js")

const backButton = new MessageButton({
	style: "SECONDARY",
	label: " 이전",
	emoji: "👈",
	customId: "back",
})

const forwardButton = new MessageButton({
	style: "SECONDARY",
	label: " 다음",
	emoji: "👉",
	customId: "forward",
})

async function infoMessageBuilder(interaction) {
	return new Promise(async (resolve, reject) => {
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

			const content = `⏰ 목표 공부 시간  ➡️  ${timeGoal ?? "0"} 시간\n\n✏️ 오늘 공부한 시간  ➡️  ${
				timeReal.thisWeek[dayOfWeek].string
			}\n\n🏝 쉬는 요일  ➡️  ${skipDays.length === 0 ? "❌" : skipDays}\n\n📊 이번주 통계  👇\n\n월요일  ${
				stat.thisWeek.mon.pass === "false" ? "❌" : stat.thisWeek.mon.pass === "skip" ? "🏝" : "✅"
			}  ➡️  ${timeReal.thisWeek.mon.string}\n\n화요일  ${
				stat.thisWeek.tue.pass === "false" ? "❌" : stat.thisWeek.tue.pass === "skip" ? "🏝" : "✅"
			}  ➡️  ${timeReal.thisWeek.tue.string}\n\n수요일  ${
				stat.thisWeek.wed.pass === "false" ? "❌" : stat.thisWeek.wed.pass === "skip" ? "🏝" : "✅"
			}  ➡️  ${timeReal.thisWeek.wed.string}\n\n목요일  ${
				stat.thisWeek.thu.pass === "false" ? "❌" : stat.thisWeek.thu.pass === "skip" ? "🏝" : "✅"
			}  ➡️  ${timeReal.thisWeek.thu.string}\n\n금요일  ${
				stat.thisWeek.fri.pass === "false" ? "❌" : stat.thisWeek.fri.pass === "skip" ? "🏝" : "✅"
			}  ➡️  ${timeReal.thisWeek.fri.string}\n\n토요일  ${
				stat.thisWeek.sat.pass === "false" ? "❌" : stat.thisWeek.sat.pass === "skip" ? "🏝" : "✅"
			}  ➡️  ${timeReal.thisWeek.sat.string}\n\n일요일  ${
				stat.thisWeek.sun.pass === "false" ? "❌" : stat.thisWeek.sun.pass === "skip" ? "🏝" : "✅"
			}  ➡️  ${timeReal.thisWeek.sun.string}`

			resolve(content)
		} catch (e) {
			reject(e)
		}
	})
}

module.exports = {
	data: new SlashCommandBuilder().setName("info").setDescription("내 정보 조회"), // 이번 주, 지난 주 통계 옵션 추가
	async execute(interaction) {
		try {
			await interaction.reply({
				content: await infoMessageBuilder(interaction),
				ephemeral: true,
				components: [new MessageActionRow({ components: [forwardButton] })],
			})
		} catch (e) {
			await interaction.reply(`명령을 수행하는 중에 오류가 발생하였습니다! 다시 시도해주세요 :(`)
			console.error(e)
		}
	},
	async interact(interaction) {
		try {
			if (interaction.customId === "forward") {
				const badges = await dataManager.getBadges(interaction.user.id, interaction.guild.id)

				let badgeString = ""

				if (badges !== null && badges.length !== 0) {
					for (badge of badges) {
						badgeString += `${badgeManager.badgeInImage[badge]} ${badgeManager.badgeInKorean[badge]}\n${badgeManager.badgeExplanation[badge]}\n\n`
					}
				}

				await interaction.update({
					content: `🏅 획득한 뱃지 👇\n\n${
						badgeString.length === 0 ? "획득한 뱃지가 아직 없습니다 🥹" : badgeString
					}`,
					ephemeral: true,
					components: [new MessageActionRow({ components: [backButton] })],
				})
			} else {
				await interaction.update({
					content: await infoMessageBuilder(interaction),
					ephemeral: true,
					components: [new MessageActionRow({ components: [forwardButton] })],
				})
			}
		} catch (e) {
			await interaction.reply(`명령을 수행하는 중에 오류가 발생하였습니다! 다시 시도해주세요 :(`)
			console.error(e)
		}
	},
}
