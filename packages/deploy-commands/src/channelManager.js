const dataManager = require("./dataManager")
const dateManager = import("../../../src/dateHandler.js")
const apiManager = require("./apiManager")

function setChannelForTime2Study(guildId, channelId) {
	return new Promise(async (resolve, reject) => {
		try {
			let response = ""

			await dataManager.setTime2StudyChannelOfGuild(guildId, channelId)
			const channelName = await apiManager.getChannelName(channelId)

			response += `${channelName} 채널을 Time2Study 알림용 채널로 설정 완료하였습니다`

			resolve(response)
		} catch (e) {
			reject(e)
		}
	})
}

module.exports = { setChannelForTime2Study }
