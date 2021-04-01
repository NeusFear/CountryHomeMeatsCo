export function getDayNumber(date = new Date()) {
  return Math.floor(date.getTime() / 8.64e+7)
}

export const normalizeDay = (date: Date = new Date()) => 
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0)