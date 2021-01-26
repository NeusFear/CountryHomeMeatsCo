export function getDayNumber(date = new Date()) {
  return Math.floor(date.getTime() / 8.64e+7)
}