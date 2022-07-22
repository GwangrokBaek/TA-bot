const { SlashCommandBuilder } = require("@discordjs/builders")
const weeklyReportManager = require("../src/weeklyReportManager")

module.exports = {
	data: new SlashCommandBuilder().setName("fame").setDescription("명예의 전당 조회"),
	async execute(interaction) {
		try {
			const guildId = interaction.guild.id

			const response = await weeklyReportManager.showFameReport(guildId)

			await interaction.reply({
				content: response,
				ephemeral: true,
			})
		} catch (e) {
			await interaction.reply(`명령을 수행하는 중에 오류가 발생하였습니다! 다시 시도해주세요 :(`)
			console.error(e)
		}
	},
}
