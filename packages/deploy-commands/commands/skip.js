const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageActionRow, MessageSelectMenu } = require("discord.js")
const dataManager = require("../src/dataManager")
const dateManager = import("../../../src/dateHandler.js")

const dayOptions = [
	{
		label: "월요일",
		value: "mon",
	},
	{
		label: "화요일",
		value: "tue",
	},
	{
		label: "수요일",
		value: "wed",
	},
	{
		label: "목요일",
		value: "thu",
	},
	{
		label: "금요일",
		value: "fri",
	},
	{
		label: "토요일",
		value: "sat",
	},
	{
		label: "일요일",
		value: "sun",
	},
]

module.exports = {
	data: new SlashCommandBuilder()
		.setName("skip")
		.setDescription("캠스터디 쉬는 요일 설정 및 해제")
		.addSubcommand((subcommand) => subcommand.setName("add").setDescription("쉬는 요일 설정"))
		.addSubcommand((subcommand) => subcommand.setName("delete").setDescription("쉬는 요일 해제")),
	async execute(interaction) {
		const stat = await dataManager.getStat(interaction.user.id, interaction.guild.id)

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

		if (interaction.options.getSubcommand() === "add") {
			const row = new MessageActionRow().addComponents(
				new MessageSelectMenu()
					.setCustomId("addskip")
					.setPlaceholder("선택된 요일이 없습니다")
					.setMinValues(1)
					.addOptions(dayOptions)
			)

			await interaction.reply({
				content: `나의 쉬는 요일 : ${
					skipDays.length === 0 ? "❌" : skipDays
				}\n\n아래 메뉴에서 등록할 요일을 선택해주세요 (다중 선택 가능)`,
				components: [row],
			})
		} else if (interaction.options.getSubcommand() === "delete") {
			const row = new MessageActionRow().addComponents(
				new MessageSelectMenu()
					.setCustomId("deleteskip")
					.setPlaceholder("선택된 요일이 없습니다")
					.setMinValues(1)
					.addOptions(dayOptions)
			)

			await interaction.reply({
				content: `나의 쉬는 요일 : ${
					skipDays.length === 0 ? "❌" : skipDays
				}\n\n아래 메뉴에서 삭제할 요일을 선택해주세요 (다중 선택 가능)`,
				components: [row],
			})
		}
	},
	async interact(interaction) {
		if (interaction.customId === "addskip") {
			await interaction.deferUpdate()
			for (const dayInEng of interaction.values) {
				await dataManager.setPassValueOfSpecificStat(
					interaction.user.id,
					interaction.guild.id,
					true,
					dayInEng,
					"skip"
				)
			}
			await interaction.editReply({
				content: "성공적으로 등록되었습니다",
				components: [],
			})
		} else if (interaction.customId === "deleteskip") {
			await interaction.deferUpdate()
			for (const dayInEng of interaction.values) {
				if (
					(await dataManager.getPassValueOfSpecificStat(
						interaction.user.id,
						interaction.guild.id,
						true,
						dayInEng
					)) === "skip"
				) {
					await dataManager.setPassValueOfSpecificStat(
						interaction.user.id,
						interaction.guild.id,
						true,
						dayInEng,
						false
					)
				}
			}
			await interaction.editReply({
				content: "성공적으로 삭제되었습니다",
				components: [],
			})
		}
	},
}
