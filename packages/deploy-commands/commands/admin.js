const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageActionRow, MessageSelectMenu } = require("discord.js")
const dataManager = require("../src/dataManager")
const dateManager = import("../../../src/dateHandler.js")
const weeklyReportManager = require("../src/weeklyReportManager")
const channelManager = require("../src/channelManager")
const apiManager = require("../src/apiManager")

const adminMenuOptions = [
	{
		label: "전체 멤버 공부 통계 보기",
		value: "showWeeklyReport",
	},
	{
		label: "자동 통계 보고 설정",
		value: "setAutoWeeklyReport",
	},
	{
		label: "Time2Study용 채널 설정",
		value: "setChannelForTime2Study",
	},
]

const showWeeklyReportMenuOptions = [
	{
		label: "이번주 공부 통계 보기",
		value: "showWeeklyReportThisWeek",
	},
	{
		label: "지난주 공부 통계 보기",
		value: "showWeeklyReportLastWeek",
	},
]

const setAutoWeeklyReportMenuOptions = [
	{
		label: "활성화",
		value: "autoWeeklyReport enable",
	},
	{
		label: "비활성화",
		value: "autoWeeklyReport disable",
	},
]

let setChannelForTime2StudyMenuOptions = []

module.exports = {
	data: new SlashCommandBuilder().setName("admin").setDescription("관리자 메뉴"),
	async execute(interaction) {
		const member = interaction.guild.members.cache.get(interaction.user.id)
		const isAdmin = member.roles.cache.some((role) => role.name === "Time2Study-admin")
		if (isAdmin) {
			const row = new MessageActionRow().addComponents(
				new MessageSelectMenu()
					.setCustomId("selectAdminMenu")
					.setPlaceholder("선택된 명령이 없습니다")
					.setMaxValues(1)
					.addOptions(adminMenuOptions)
			)

			await interaction.reply({ content: "아래 메뉴에서 실행할 명령을 선택해주세요", components: [row] })
		} else {
			await interaction.reply({ content: "해당 명령을 사용할 권한이 없습니다. 관리자에게 문의해주세요!" })
		}
	},
	async interact(interaction) {
		try {
			if (interaction.customId === "selectAdminMenu") {
				await interaction.deferUpdate()
				let value = interaction.values[0].split(" ")
				let message

				switch (value[0]) {
					case "showWeeklyReport":
						const rowForshowWeeklyReport = new MessageActionRow().addComponents(
							new MessageSelectMenu()
								.setCustomId("selectAdminMenu")
								.setPlaceholder("선택된 항목이 없습니다")
								.setMaxValues(1)
								.addOptions(showWeeklyReportMenuOptions)
						)

						await interaction.editReply({
							content: "이번주 통계와 지난주 통계 중 하나를 선택해주세요",
							components: [rowForshowWeeklyReport],
						})

						return
					case "setAutoWeeklyReport":
						const rowForSetAutoWeeklyReport = new MessageActionRow().addComponents(
							new MessageSelectMenu()
								.setCustomId("selectAdminMenu")
								.setPlaceholder("선택된 항목이 없습니다")
								.setMaxValues(1)
								.addOptions(setAutoWeeklyReportMenuOptions)
						)

						const autoWeeklyReport = await dataManager.getAutoWeeklyReportOfGuild(interaction.guild.id)

						await interaction.editReply({
							content: `현재 자동 통계 보고 설정 값 : ${
								autoWeeklyReport === false ? "비활성화" : "활성화"
							}`,
							components: [rowForSetAutoWeeklyReport],
						})

						return
					case "setChannelForTime2Study":
						const channels = await apiManager.getAllChannels(interaction.guild.id)

						for (channel of channels) {
							if (channel.type === 0) {
								setChannelForTime2StudyMenuOptions.push({
									label: `${channel.name}`,
									value: `channelSelected ${channel.id}`,
								})
							}
						}

						const rowForsetChannelForTime2Study = new MessageActionRow().addComponents(
							new MessageSelectMenu()
								.setCustomId("selectAdminMenu")
								.setPlaceholder("선택된 채널이 없습니다")
								.setMaxValues(1)
								.addOptions(setChannelForTime2StudyMenuOptions)
						)

						await interaction.editReply({
							content: "아래 메뉴에서 채널을 선택해주세요",
							components: [rowForsetChannelForTime2Study],
						})

						return
					case "showWeeklyReportThisWeek":
						message = await weeklyReportManager.showWeeklyReport(interaction.guild.id, true)
						break
					case "showWeeklyReportLastWeek":
						message = await weeklyReportManager.showWeeklyReport(interaction.guild.id, false)
						break
					case "channelSelected":
						message = await channelManager.setChannelForTime2Study(interaction.guild.id, value[1])
						break
					case "autoWeeklyReport":
						message = await weeklyReportManager.setAutoWeeklyReport(interaction.guild.id, value[1])
						break
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
