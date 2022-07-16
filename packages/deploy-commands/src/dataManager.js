const fs = require("node:fs")
const path = require("node:path")

const userTablePath = path.join(__dirname, "../../../data/userTable.json")
const userTableFile = fs.readFileSync(userTablePath)
const userTable = JSON.parse(userTableFile)

const guildTablePath = path.join(__dirname, "../../../data/guildTable.json")
const guildTableFile = fs.readFileSync(guildTablePath)
const guildTable = JSON.parse(guildTableFile)

function putGuild(guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			newGuild = {
				guildId: guildId,
				premium: false,
			}
			newIndex = guildTable.guilds.length

			guildTable.guilds[newIndex] = newGuild
			await fs.writeFileSync(guildTablePath, JSON.stringify(guildTable))

			console.log(guildTable)

			resolve({ newGuild, newIndex })
		} catch (e) {
			reject(e)
		}
	})
}

function getGuild(guildId) {
	return new Promise(async (resolve, reject) => {
		let index = 0

		for (const guild of guildTable.guilds) {
			if (guild.guildId === guildId) {
				resolve({ guild: guild, index: index })
				return
			}
			index += 1
		}

		try {
			const { newGuild, newIndex } = await putGuild(guildId)
			resolve({ guild: newGuild, index: newIndex })
		} catch (e) {
			reject(e)
		}
	})
}

function deleteGuild(guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			const { _, index } = await getGuild(guildId)
			console.log(guildTable)

			guildTable.guilds.splice(index, 1)

			console.log(guildTable)

			await fs.writeFileSync(guildTablePath, JSON.stringify(guildTable))
			resolve(true)
		} catch (e) {
			reject(e)
		}
	})
}

function getUserTable() {
	return new Promise(async (resolve, reject) => {
		try {
			resolve(userTable)
		} catch (e) {
			reject(e)
		}
	})
}

function setUserTable(userTable) {
	return new Promise(async (resolve, reject) => {
		try {
			await fs.writeFileSync(userTablePath, JSON.stringify(userTable))
			resolve(true)
		} catch (e) {
			reject(e)
		}
	})
}

function putUser(userId, guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			newUser = {
				userId: userId,
				guildId: guildId,
				timeGoal: null,
				lastJoinTimestamp: null,
				stat: {
					thisWeek: {
						mon: { pass: false, timeReal: null },
						tue: { pass: false, timeReal: null },
						wed: { pass: false, timeReal: null },
						thu: { pass: false, timeReal: null },
						fri: { pass: false, timeReal: null },
						sat: { pass: false, timeReal: null },
						sun: { pass: false, timeReal: null },
					},
					lastWeek: {
						mon: { pass: false, timeReal: null },
						tue: { pass: false, timeReal: null },
						wed: { pass: false, timeReal: null },
						thu: { pass: false, timeReal: null },
						fri: { pass: false, timeReal: null },
						sat: { pass: false, timeReal: null },
						sun: { pass: false, timeReal: null },
					},
				},
			}
			newIndex = userTable.users.length

			userTable.users[newIndex] = newUser
			await fs.writeFileSync(userTablePath, JSON.stringify(userTable))

			resolve({ newUser, newIndex })
		} catch (e) {
			reject(e)
		}
	})
}

function getUser(userId, guildId) {
	return new Promise(async (resolve, reject) => {
		let index = 0

		for (const user of userTable.users) {
			if (user.userId === userId && user.guildId === guildId) {
				resolve({ user: user, index: index })
				return
			}
			index += 1
		}

		try {
			const { newUser, newIndex } = await putUser(userId, guildId)
			resolve({ user: newUser, index: newIndex })
		} catch (e) {
			reject(e)
		}
	})
}

async function setTimeGoal(userId, guildId, timeGoal) {
	return new Promise(async (resolve, reject) => {
		try {
			const { _, index } = await getUser(userId, guildId)
			userTable.users[index].timeGoal = timeGoal

			await fs.writeFileSync(userTablePath, JSON.stringify(userTable))
			resolve(true)
		} catch (e) {
			reject(e)
		}
	})
}

async function setLastJoinTimestamp(userId, guildId, lastJoinTimestamp) {
	return new Promise(async (resolve, reject) => {
		try {
			const { _, index } = await getUser(userId, guildId)
			userTable.users[index].lastJoinTimestamp = lastJoinTimestamp

			await fs.writeFileSync(userTablePath, JSON.stringify(userTable))
			resolve(true)
		} catch (e) {
			reject(e)
		}
	})
}

async function setThisWeekStat(userId, guildId, stat) {
	return new Promise(async (resolve, reject) => {
		try {
			const { _, index } = await getUser(userId, guildId)
			userTable.users[index].stat.thisWeek = stat

			await fs.writeFileSync(userTablePath, JSON.stringify(userTable))
			resolve(true)
		} catch (e) {
			reject(e)
		}
	})
}

async function setLastWeekStat(userId, guildId, stat) {
	return new Promise(async (resolve, reject) => {
		try {
			const { _, index } = await getUser(userId, guildId)
			userTable.users[index].stat.lastWeek = stat

			await fs.writeFileSync(userTablePath, JSON.stringify(userTable))
			resolve(true)
		} catch (e) {
			reject(e)
		}
	})
}

async function setPassValueOfSpecificStat(userId, guildId, thisWeek, day, value) {
	return new Promise(async (resolve, reject) => {
		try {
			const { _, index } = await getUser(userId, guildId)

			if (thisWeek === true) {
				userTable.users[index].stat.thisWeek[day].pass = value
			} else {
				userTable.users[index].stat.lastWeek[day].pass = value
			}

			await fs.writeFileSync(userTablePath, JSON.stringify(userTable))
			resolve(true)
		} catch (e) {
			reject(e)
		}
	})
}

async function getTimeGoal(userId, guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			const { _, index } = await getUser(userId, guildId)

			resolve(userTable.users[index].timeGoal)
		} catch (e) {
			reject(e)
		}
	})
}

async function getLastJoinTimestamp(userId, guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			const { _, index } = await getUser(userId, guildId)

			resolve(userTable.users[index].lastJoinTimestamp)
		} catch (e) {
			reject(e)
		}
	})
}

async function getStat(userId, guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			const { _, index } = await getUser(userId, guildId)

			resolve(userTable.users[index].stat)
		} catch (e) {
			reject(e)
		}
	})
}

async function getThisWeekStat(userId, guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			const { _, index } = await getUser(userId, guildId)

			resolve(userTable.users[index].stat.thisWeek)
		} catch (e) {
			reject(e)
		}
	})
}

async function getLastWeekStat(userId, guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			const { _, index } = await getUser(userId, guildId)

			resolve(userTable.users[index].stat.lastWeek)
		} catch (e) {
			reject(e)
		}
	})
}

async function getPassValueOfSpecificStat(userId, guildId, thisWeek, day) {
	return new Promise(async (resolve, reject) => {
		try {
			const { _, index } = await getUser(userId, guildId)

			if (thisWeek === true) {
				resolve(userTable.users[index].stat.thisWeek[day].pass)
			} else {
				resolve(userTable.users[index].stat.lastWeek[day].pass)
			}
		} catch (e) {
			reject(e)
		}
	})
}

async function getTimeRealOfSpecificStat(userId, guildId, thisWeek, day) {
	return new Promise(async (resolve, reject) => {
		try {
			const { _, index } = await getUser(userId, guildId)

			if (thisWeek === true) {
				resolve(userTable.users[index].stat.thisWeek[day].timeReal)
			} else {
				resolve(userTable.users[index].stat.lastWeek[day].timeReal)
			}
		} catch (e) {
			reject(e)
		}
	})
}

async function addTimeRealToSpecificStat(userId, guildId, thisWeek, day, timeReal) {
	return new Promise(async (resolve, reject) => {
		try {
			const { _, index } = await getUser(userId, guildId)

			if (thisWeek === true) {
				if (userTable.users[index].stat.thisWeek[day].timeReal === null) {
					userTable.users[index].stat.thisWeek[day].timeReal = 0
				}

				userTable.users[index].stat.thisWeek[day].timeReal =
					userTable.users[index].stat.thisWeek[day].timeReal + timeReal
			} else {
				if (userTable.users[index].stat.lastWeek[day].timeReal === null) {
					userTable.users[index].stat.lastWeek[day].timeReal = 0
				}
				userTable.users[index].stat.lastWeek[day].timeReal =
					userTable.users[index].stat.lastWeek[day].timeReal + timeReal
			}

			await fs.writeFileSync(userTablePath, JSON.stringify(userTable))
			resolve(true)
		} catch (e) {
			reject(e)
		}
	})
}

module.exports = {
	putGuild,
	getGuild,
	deleteGuild,
	getUserTable,
	setUserTable,
	putUser,
	getUser,
	setTimeGoal,
	setLastJoinTimestamp,
	setThisWeekStat,
	setLastWeekStat,
	setPassValueOfSpecificStat,
	getTimeGoal,
	getLastJoinTimestamp,
	getStat,
	getThisWeekStat,
	getLastWeekStat,
	getPassValueOfSpecificStat,
	getTimeRealOfSpecificStat,
	addTimeRealToSpecificStat,
}
