require("dotenv").config()
const { Client } = require("pg")

let client
if (process.env.ENV === "dev") {
	client = new Client({
		user: process.env.DB_USER,
		host: process.env.DB_HOST,
		database: process.env.DB_NAME,
		password: process.env.DB_PWD,
		port: 5432,
	})
} else {
	client = new Client({
		connectionString: process.env.DATABASE_URL,
		ssl: {
			rejectUnauthorized: false,
		},
	})
}

client.connect()

function putGuild(guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			await client.query(`INSERT INTO guild(guild_id, premium) values($1, $2)`, [guildId, false])

			resolve(true)
		} catch (e) {
			reject(e)
		}
	})
}

function existGuild(guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			const result = await client.query(`select * from "guild" where guild_id='${guildId}'`)

			if (result.rowCount === 0) {
				console.error(`[getGuild] Can't find anything with condition "${guildId}" from "guild" table`)
				await putGuild(guildId)
			}
			resolve(true)
		} catch (e) {
			reject(e)
		}
	})
}

function getAllGuilds() {
	return new Promise(async (resolve, reject) => {
		try {
			const result = await client.query(`select * from "guild"`)

			if (result.rowCount === 0) {
				console.error(`[getGuild] Can't find anything from "guild" table`)
			}
			resolve(result.rows)
		} catch (e) {
			reject(e)
		}
	})
}

function deleteGuild(guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			await existGuild(guildId)

			const result = await client.query(`delete from "guild" where guild_id='${guildId}'`)

			if (result.rowCount === 0) {
				throw new Error(
					console.error(`[deleteGuild] Can't find anything with condition "${guildId}" from "guild" table`)
				)
			} else {
				resolve(true)
			}
		} catch (e) {
			reject(e)
		}
	})
}

function putUser(userId, guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			await client.query(
				`INSERT INTO stat(stat_id, user_id, guild_id, 
					this_mon_pass, this_tue_pass, this_wed_pass, this_thu_pass, this_fri_pass, this_sat_pass, this_sun_pass, 
					this_mon_time_real, this_tue_time_real, this_wed_time_real, this_thu_time_real, this_fri_time_real, this_sat_time_real, this_sun_time_real, 
					last_mon_pass, last_tue_pass, last_wed_pass, last_thu_pass, last_fri_pass, last_sat_pass, last_sun_pass, 
					last_mon_time_real, last_tue_time_real, last_wed_time_real, last_thu_time_real, last_fri_time_real, last_sat_time_real, last_sun_time_real) 
					values($1, $2, $3, 
						$4, $5, $6, $7, $8, $9, $10, 
						$11, $12, $13, $14, $15, $16, $17, 
						$18, $19, $20, $21, $22, $23, $24, 
						$25, $26, $27, $28, $29, $30, $31
					)`,
				[
					userId + guildId,
					userId,
					guildId,
					"false",
					"false",
					"false",
					"false",
					"false",
					"false",
					"false",
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					"false",
					"false",
					"false",
					"false",
					"false",
					"false",
					"false",
					0,
					0,
					0,
					0,
					0,
					0,
					0,
				]
			)

			const result = await client.query(
				`INSERT INTO "user"(user_unique_id, user_id, guild_id, time_goal, last_join_timestamp, stat_id) values($1, $2, $3, $4, $5, $6)`,
				[userId + guildId, userId, guildId, 0, null, userId + guildId]
			)

			resolve(true)
		} catch (e) {
			reject(e)
		}
	})
}

function existUser(userId, guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			const result = await client.query(
				`select user_id from "user" where user_id=CAST(${userId} AS VARCHAR) and guild_id=CAST(${guildId} AS VARCHAR)`
			)

			if (result.rowCount === 0) {
				console.error(
					`[existUser] Can't find anything with condition "${userId}" and "${guildId}" from "user" table`
				)
				console.log(
					`[existUser] Trying to put user with condition "${userId}" and "${guildId}" to "user" table`
				)
				await putUser(userId, guildId)
			}
			resolve(true)
		} catch (e) {
			reject(e)
		}
	})
}

function getAllUsersFromGuild(guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			const result = await client.query(`select user_id from "user" where guild_id=CAST(${guildId} AS VARCHAR)`)

			if (result.rowCount === 0) {
				console.error(`[existUser] Can't find anything with condition "${guildId}" from "user" table`)
			}
			resolve(result.rows)
		} catch (e) {
			reject(e)
		}
	})
}

async function setTimeGoal(userId, guildId, timeGoal) {
	return new Promise(async (resolve, reject) => {
		try {
			await existUser(userId, guildId)

			const result = await client.query(
				`UPDATE "user" SET time_goal=${timeGoal} WHERE user_id=CAST(${userId} AS VARCHAR) and guild_id=CAST(${guildId} AS VARCHAR)`
			)

			if (result.rowCount === 0) {
				throw new Error(
					`[setTimeGoal] Can't find anything with condition "${userId}" and "${guildId}" from "user" table`
				)
			} else {
				resolve(true)
			}
		} catch (e) {
			reject(e)
		}
	})
}

async function setLastJoinTimestamp(userId, guildId, lastJoinTimestamp) {
	return new Promise(async (resolve, reject) => {
		try {
			await existUser(userId, guildId)

			const result = await client.query(
				`UPDATE "user" SET last_join_timestamp='${lastJoinTimestamp}' WHERE user_id='${userId}' and guild_id='${guildId}'`
			)

			if (result.rowCount === 0) {
				throw new Error(
					`[setLastJoinTimestamp] Can't find anything with condition "${userId}" and "${guildId}" from "user" table`
				)
			} else {
				resolve(true)
			}
		} catch (e) {
			reject(e)
		}
	})
}

async function setStat(userId, guildId, stat) {
	return new Promise(async (resolve, reject) => {
		try {
			let resultThisWeekPass
			let resultThisWeekTimeReal
			let resultLastWeekPass
			let resultLastWeekTimeReal

			for (day in stat.thisWeek) {
				resultThisWeekPass = await client.query(
					`UPDATE "stat" SET this_${day}_pass='${stat.thisWeek[day].pass}' WHERE stat_id='${userId}${guildId}'`
				)
				resultThisWeekTimeReal = await client.query(
					`UPDATE "stat" SET this_${day}_time_real='${stat.thisWeek[day].timeReal}' WHERE stat_id='${userId}${guildId}'`
				)
			}
			for (day in stat.lastWeek) {
				resultLastWeekPass = await client.query(
					`UPDATE "stat" SET last_${day}_pass='${stat.lastWeek[day].pass}' WHERE stat_id='${userId}${guildId}'`
				)
				resultLastWeekTimeReal = await client.query(
					`UPDATE "stat" SET last_${day}_time_real='${stat.lastWeek[day].timeReal}' WHERE stat_id='${userId}${guildId}'`
				)
			}

			if (
				resultThisWeekPass.rowCount === 0 ||
				resultThisWeekTimeReal.rowCount === 0 ||
				resultLastWeekPass.rowCount === 0 ||
				resultLastWeekTimeReal.rowCount === 0
			) {
				throw new Error(`[setStat] Can't find anything with condition "${userId}${guildId}" from "stat" table`)
			} else {
				resolve(true)
			}
		} catch (e) {
			reject(e)
		}
	})
}

async function setPassValueOfSpecificStat(userId, guildId, thisWeek, day, value) {
	return new Promise(async (resolve, reject) => {
		try {
			await existUser(userId, guildId)
			let result

			if (thisWeek === true) {
				result = await client.query(
					`UPDATE "stat" SET this_${day}_pass='${value}' WHERE stat_id='${userId}${guildId}'`
				)
			} else {
				result = await client.query(
					`UPDATE "stat" SET last_${day}_pass='${value}' WHERE stat_id='${userId}${guildId}'`
				)
			}

			if (result.rowCount === 0) {
				throw new Error(
					`[setPassValueOfSpecificStat] Can't find anything with condition "${userId}${guildId}" from "stat" table`
				)
			} else {
				resolve(true)
			}
		} catch (e) {
			reject(e)
		}
	})
}

async function getTimeGoal(userId, guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			let response
			await existUser(userId, guildId)

			const result = await client.query(
				`select time_goal from "user" where user_id='${userId}' and guild_id='${guildId}'`
			)
			response = result.rows[0].time_goal

			if (result.rowCount === 0) {
				throw new Error(
					`[getTimeGoal] Can't find anything with condition "${userId}" and "${guildId}" from "user" table`
				)
			} else {
				resolve(response)
			}
		} catch (e) {
			reject(e)
		}
	})
}

async function getLastJoinTimestamp(userId, guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			let response
			await existUser(userId, guildId)

			const result = await client.query(
				`select last_join_timestamp from "user" where user_id='${userId}' and guild_id='${guildId}'`
			)
			response = result.rows[0].last_join_timestamp

			if (result.rowCount === 0) {
				throw new Error(
					`[getLastJoinTimestamp] Can't find anything with condition "${userId}" and "${guildId}" from "user" table`
				)
			} else {
				resolve(response)
			}
		} catch (e) {
			reject(e)
		}
	})
}

async function getStat(userId, guildId) {
	return new Promise(async (resolve, reject) => {
		try {
			let response
			await existUser(userId, guildId)

			const result = await client.query(`select * from "stat" where stat_id='${userId + guildId}'`)

			response = {
				thisWeek: {
					mon: { pass: result.rows[0].this_mon_pass, timeReal: Number(result.rows[0].this_mon_time_real) },
					tue: { pass: result.rows[0].this_tue_pass, timeReal: Number(result.rows[0].this_tue_time_real) },
					wed: { pass: result.rows[0].this_wed_pass, timeReal: Number(result.rows[0].this_wed_time_real) },
					thu: { pass: result.rows[0].this_thu_pass, timeReal: Number(result.rows[0].this_thu_time_real) },
					fri: { pass: result.rows[0].this_fri_pass, timeReal: Number(result.rows[0].this_fri_time_real) },
					sat: { pass: result.rows[0].this_sat_pass, timeReal: Number(result.rows[0].this_sat_time_real) },
					sun: { pass: result.rows[0].this_sun_pass, timeReal: Number(result.rows[0].this_sun_time_real) },
				},
				lastWeek: {
					mon: { pass: result.rows[0].last_mon_pass, timeReal: Number(result.rows[0].last_mon_time_real) },
					tue: { pass: result.rows[0].last_tue_pass, timeReal: Number(result.rows[0].last_tue_time_real) },
					wed: { pass: result.rows[0].last_wed_pass, timeReal: Number(result.rows[0].last_wed_time_real) },
					thu: { pass: result.rows[0].last_thu_pass, timeReal: Number(result.rows[0].last_thu_time_real) },
					fri: { pass: result.rows[0].last_fri_pass, timeReal: Number(result.rows[0].last_fri_time_real) },
					sat: { pass: result.rows[0].last_sat_pass, timeReal: Number(result.rows[0].last_sat_time_real) },
					sun: { pass: result.rows[0].last_sun_pass, timeReal: Number(result.rows[0].last_sun_time_real) },
				},
			}

			if (result.rowCount === 0) {
				throw new Error(`[getStat] Can't find anything with condition "${userId}${guildId}" from "stat" table`)
			} else {
				resolve(response)
			}
		} catch (e) {
			reject(e)
		}
	})
}

async function getPassValueOfSpecificStat(userId, guildId, thisWeek, day) {
	return new Promise(async (resolve, reject) => {
		try {
			let response
			await existUser(userId, guildId)

			let result
			if (thisWeek === true) {
				result = await client.query(`select this_${day}_pass from "stat" where stat_id='${userId}${guildId}'`)
				response = result.rows[0][`this_${day}_pass`]
			} else {
				result = await client.query(`select last_${day}_pass from "stat" where stat_id='${userId}${guildId}'`)
				response = result.rows[0][`last_${day}_pass`]
			}

			if (result.rowCount === 0) {
				throw new Error(
					`[getPassValueOfSpecificStat] Can't find anything with condition "${userId}${guildId}" from "stat" table`
				)
			} else {
				resolve(response)
			}
		} catch (e) {
			reject(e)
		}
	})
}

async function getTimeRealOfSpecificStat(userId, guildId, thisWeek, day) {
	return new Promise(async (resolve, reject) => {
		try {
			let response
			await existUser(userId, guildId)

			let result
			if (thisWeek === true) {
				result = await client.query(
					`select this_${day}_time_real from "stat" where stat_id='${userId}${guildId}'`
				)
				response = result.rows[0][`this_${day}_time_real`]
			} else {
				result = await client.query(
					`select last_${day}_time_real from "stat" where stat_id='${userId}${guildId}'`
				)
				response = result.rows[0][`last_${day}_time_real`]
			}

			if (result.rowCount === 0) {
				throw new Error(
					`[getTimeRealOfSpecificStat] Can't find anything with condition "${userId}${guildId}" from "stat" table`
				)
			} else {
				resolve(response)
			}
		} catch (e) {
			reject(e)
		}
	})
}

async function addTimeRealToSpecificStat(userId, guildId, thisWeek, day, timeReal) {
	return new Promise(async (resolve, reject) => {
		try {
			await existUser(userId, guildId)

			let resultUpdate
			if (thisWeek === true) {
				const resultQuery = await client.query(
					`select this_${day}_time_real from "stat" where stat_id='${userId}${guildId}'`
				)

				let timeRealBefore = Number(resultQuery.rows[0][`this_${day}_time_real`])

				resultUpdate = await client.query(
					`UPDATE "stat" SET this_${day}_time_real='${
						timeRealBefore + timeReal
					}' WHERE stat_id='${userId}${guildId}'`
				)
			} else {
				const resultQuery = await client.query(
					`select last_${day}_time_real from "stat" where stat_id='${userId}${guildId}'`
				)

				let timeRealBefore = Number(resultQuery.rows[0][`last_${day}_time_real`])

				resultUpdate = await client.query(
					`UPDATE "stat" SET last_${day}_time_real='${
						timeRealBefore + timeReal
					}' WHERE stat_id='${userId}${guildId}'`
				)
			}

			if (resultUpdate.rowCount === 0) {
				throw new Error(
					`[addTimeRealToSpecificStat] Can't find anything with condition "${userId}${guildId}" from "stat" table`
				)
			} else {
				resolve(true)
			}
		} catch (e) {
			reject(e)
		}
	})
}

module.exports = {
	putGuild,
	existGuild,
	getAllGuilds,
	deleteGuild,
	putUser,
	existUser,
	getAllUsersFromGuild,
	setTimeGoal,
	setLastJoinTimestamp,
	setStat,
	setPassValueOfSpecificStat,
	getTimeGoal,
	getLastJoinTimestamp,
	getStat,
	getPassValueOfSpecificStat,
	getTimeRealOfSpecificStat,
	addTimeRealToSpecificStat,
}
