const apiManager = require("./apiManager")
const dataManager = require("./dataManager")
const client = import("../../../src/index.js")

const baseTableForBadge = {
	early_bird: {
		morning_counts: {
			value: 30,
			sign: ">=",
		},
		sum_time_real: {
			value: 100,
			sign: ">=",
		},
	},
	night_owl: {
		night_counts: {
			value: 30,
			sign: ">=",
		},
		sum_time_real: {
			value: 100,
			sign: ">=",
		},
	},
	miracle_morning: {
		morning_counts: {
			value: 60,
			sign: ">=",
		},
	},
	vampire: {
		night_counts: {
			value: 60,
			sign: ">=",
		},
	},
	cautios_person: {
		time_goal: {
			value: 1,
			sign: "==",
		},
	},
	great_passion: {
		time_goal: {
			value: 24,
			sign: "==",
		},
	},
	always_first_grade: {
		first_grade_counts: {
			value: 30,
			sign: ">=",
		},
	},
	always_last_grade: {
		last_grade_counts: {
			value: 30,
			sign: ">=",
		},
	},
}

const badgeInKorean = {
	early_bird: "일찍 일어나는 새",
	night_owl: "밤이 더 좋은 올빼미",
	miracle_morning: "제 특기는 미라클모닝",
	vampire: "뱀파이어",
	cautios_person: "신중한 그대",
	great_passion: "열정만큼은 인정",
	always_first_grade: "1등이 가장 쉬웠어요",
	always_last_grade: "항상 1등 (뒤에서)",
}

const badgeInImage = {
	early_bird: "🦜",
	night_owl: "🦉",
	miracle_morning: "🌞",
	vampire: "🧛🏻‍♂️",
	cautios_person: "🤔",
	great_passion: "🔥",
	always_first_grade: "🥇",
	always_last_grade: "⁉️",
}

const badgeExplanation = {
	early_bird: "밤보다 아침에 공부하는 것을 더 선호하는 당신! 진정한 아침형 인간이시군요 😊",
	night_owl: "아침보다 밤에 공부하는 것을 더 선호하는 당신! 역시 밤에 집중이 더 잘 되는 법이죠 😙",
	miracle_morning: "세상에나! 이렇게나 꾸준히 아침마다 공부하시다니. 혹시 특기가 미라클 모닝이신가요..? 😳",
	vampire: "매일 밤 늦은 시간임에도 불구하고, 근면 성실하게 공부하는 당신의 모습은 마치 뱀파이어와도 같군요! 😨",
	cautios_person: "무턱대고 큰 목표를 세우기 보다는, 작더라도 실천 가능한 목표가 좋은 법이죠 😌",
	great_passion: "24시간이요 ⁉️  열정 하나는 끝내주네요!",
	always_first_grade: "1등을 완벽하게 사수하는 당신. 이쯤되면 양보 한 번 해주시죠! 😝",
	always_last_grade: "꼴등을 완벽하게 사수하는 당신. 이것도 능력입니다! 😎",
}

function addBadgeToUser(badge, userId, guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			await dataManager.addBadge(userId, guildId, badge)
			const user = (await client).client.users.fetch(userId)
			const result = (await user).send(
				`🥳  축하합니다! ${badgeInImage[badge]} ${badgeInKorean[badge]} 뱃지를 획득하셨습니다 🙌\n\n${badgeExplanation[badge]}\n\n/info 명령어로 획득한 뱃지를 확인해보세요!\n\n`
			)
			resolve(true)
		} catch (e) {
			reject(e)
		}
	})
}

function getSucessOrFail(compareA, compareB, sign) {
	return new Promise(async (resolve, reject) => {
		let result = false
		try {
			switch (sign) {
				case ">":
					if (compareA > compareB) {
						result = true
					}
					break
				case ">=":
					if (compareA >= compareB) {
						result = true
					}
					break
				case "<":
					if (compareA < compareB) {
						result = true
					}
					break
				case "<=":
					if (compareA <= compareB) {
						result = true
					}
					break
				case "==":
					if (compareA === compareB) {
						result = true
					}
					break
				case "!=":
					if (compareA !== compareB) {
						result = true
					}
					break
				default:
					throw new Error(`Given sign value : ${sign} is not supported`)
					break
			}
			resolve(result)
		} catch (e) {
			reject(e)
		}
	})
}

function checkBadgeNeedToAdd(badgeRelatedData, userId, guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			const userBadges = await dataManager.getBadges(userId, guildId)

			const keys = Object.keys(baseTableForBadge)
			for (key of keys) {
				if (userBadges.includes(key)) {
					continue
				}

				let keyFullfilled = true
				const bases = Object.keys(baseTableForBadge[key])
				for (base of bases) {
					const result = await getSucessOrFail(
						badgeRelatedData[0][base],
						baseTableForBadge[key][base].value,
						baseTableForBadge[key][base].sign
					)

					if (result === false) {
						keyFullfilled = false
					} else if (result === true) {
					} else {
						reject(result)
					}
				}

				if (keyFullfilled) {
					await addBadgeToUser(key, userId, guildId)
				}
			}

			resolve(true)
		} catch (e) {
			reject(e)
		}
	})
}

module.exports = { checkBadgeNeedToAdd, badgeInKorean, badgeInImage, badgeExplanation }
