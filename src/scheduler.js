import schedule from "node-schedule"
import { getUserTable, setUserTable } from "../packages/deploy-commands/src/dataManager.js"

const defaultStat = {
	thisWeek: {
		mon: { pass: false, timeReal: null },
		tue: { pass: false, timeReal: null },
		wed: { pass: false, timeReal: null },
		thu: { pass: false, timeReal: null },
		fri: { pass: false, timeReal: null },
		sat: { pass: false, timeReal: null },
		sun: { pass: false, timeReal: null },
	},
}

function cloneObject(obj) {
	var clone = {}
	for (var key in obj) {
		if (typeof obj[key] == "object" && obj[key] != null) {
			clone[key] = cloneObject(obj[key])
		} else {
			clone[key] = obj[key]
		}
	}

	return clone
}

let statScheduler

async function initScheduler() {
	statScheduler = schedule.scheduleJob("0 0 0 * * 1", async function () {
		console.log("Start statScheduler to reset and copy the stat of this week")
		const userTable = await getUserTable()
		for (const user of userTable.users) {
			user.stat.lastWeek = cloneObject(user.stat.thisWeek)
			for (const day in user.stat.thisWeek) {
				if (user.stat.thisWeek[day].pass !== "skip") {
					user.stat.thisWeek[day].pass = false
				}
				user.stat.thisWeek[day].timeReal = null
			}
		}
		setUserTable(userTable)
		console.log("End statScheduler to reset and copy the stat of this week")
	})
}

export { initScheduler }
