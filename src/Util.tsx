export function getDayNumber(date = new Date()) {
  return Math.floor(date.getTime() / 8.64e+7)
}

export const normalizeDay = (date: Date = new Date()) => 
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0)

export const formatDay = (date: Date) => date === undefined ? "???" : date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear() //America moment

export const formatPhoneNumber = (numStr: string) => {
    numStr = numStr.replace(/-/g, "")
    return "(" + numStr.substr(0, 3) + ") " + numStr.substr(3, 3) + "-" + numStr.substr(6);
}