function convertIntToDay(dayByInt) {
	switch (dayByInt) {
		case 0:
			return "sun"
		case 1:
			return "mon"
		case 2:
			return "tue"
		case 3:
			return "wed"
		case 4:
			return "thu"
		case 5:
			return "fri"
		case 6:
			return "sat"
		default:
			return null
	}
}

function convertDayInKorean(dayInEng) {
	switch (dayInEng) {
		case "sun":
			return "일요일"
		case "mon":
			return "월요일"
		case "tue":
			return "화요일"
		case "wed":
			return "수요일"
		case "thu":
			return "목요일"
		case "fri":
			return "금요일"
		case "sat":
			return "토요일"
		default:
			return null
	}
}

export { convertIntToDay, convertDayInKorean }
