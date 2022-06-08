export function getDayNumber(date = new Date()) {
  return Math.floor(date.getTime() / 8.64e+7)
}

export const normalizeDay = (date: Date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0)

export const formatDay = (date: Date) => date === undefined ? "???" : (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() //America moment

export const formatPhoneNumber = (numStr: string) => {
  numStr = numStr.replace(/-/g, "")
  return "(" + numStr.substr(0, 3) + ") " + numStr.substr(3, 3) + "-" + numStr.substr(6);
}

const quaterTexts = ["Quater", "Half", "@INVALID@", "Whole"] as const
export const formatQuaterText = (quaters: number) => {
  return quaterTexts[quaters - 1]
}

export const formatQuaters = (quaters: number) => quaters + " Quater" + (quaters === 1 ? "" : "s")

const halfs = ["Half of Half", "1 Half", "@INVALID@", "Whole"]
export const formatHalfs = (quaters: number) => halfs[quaters - 1]

const wholes = ["Half of Half", "Half", "@INVALID@", "Whole"]
export const formatWhole = (quaters: number) => halfs[quaters - 1]

export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const paddedID = (id: number) => String(id).padStart(5, "0")