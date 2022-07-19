const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageActionRow, MessageSelectMenu } = require("discord.js")
const dataManager = require("../src/dataManager")
const dateManager = import("../../../src/dateHandler.js")
const weeklyReportManager = require("../src/weeklyReportManager")

const adminMenuOptions = [
	{
		label: "전체 멤버 공부 통계 보기",
		value: "showWeeklyReport",
	},
	{
		label: "통계 자동 보고 활성화",
		value: "selectWeeklyReportChannel",
	},
]

module.exports = {
	data: new SlashCommandBuilder().setName("admin").setDescription("관리자 메뉴"),
	async execute(interaction) {
		const row = new MessageActionRow().addComponents(
			new MessageSelectMenu()
				.setCustomId("selectAdminMenu")
				.setPlaceholder("선택된 명령이 없습니다")
				.setMaxValues(1)
				.addOptions(adminMenuOptions)
		)

		await interaction.reply({ content: "아래 메뉴에서 실행할 명령을 선택해주세요", components: [row] })
	},
	async interact(interaction) {
		try {
			if (interaction.customId === "selectAdminMenu") {
				await interaction.deferUpdate()
				let message

				switch (interaction.values[0]) {
					case "showWeeklyReport":
						message = await weeklyReportManager.showWeeklyReport(interaction.guild.id, true)
						break
					case "selectWeeklyReportChannel":
						message = await weeklyReportManager.selectWeeklyReportChannel("1")
						break
					default:
						message = "명령을 수행하는 중에 오류가 발생하였습니다! 다시 시도해주세요 :("
						break
				}

				await interaction.editReply({
					content: message,
					components: [],
				})
			}
		} catch (e) {
			await interaction.editReply({
				content: "명령을 수행하는 중에 오류가 발생하였습니다! 다시 시도해주세요 :(",
				components: [],
			})
			console.error(e)
		}
	},
}
