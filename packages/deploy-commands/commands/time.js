const { SlashCommandBuilder } = require("@discordjs/builders")
const dataManager = require("../src/dataManager")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("time")
		.setDescription("목표 공부 시간 설정")
		.addNumberOption((option) =>
			option
				.setName("시간")
				.setDescription("하루동안 공부할 총 시간을 적어주세요! ex) 3시간 -> 3 ")
				.setRequired(true)
		),
	async execute(interaction) {
		try {
			const hours = await interaction.options.getNumber("시간")
			const userId = interaction.user.id

			if (hours === null) {
				throw new Error()
			}

			await dataManager.setTimeGoal(userId, hours)
			await interaction.reply({
				content: `하루 목표 공부 시간이 ${hours} 시간으로 설정되었습니다!`,
				ephemeral: true,
			})
		} catch (e) {
			await interaction.reply({
				content: `명령을 수행하는 중에 오류가 발생하였습니다! 다시 시도해주세요 :(`,
				ephemeral: true,
			})
			console.error(e)
		}
	},
}
