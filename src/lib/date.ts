// All wedding times are Vietnam local time (UTC+7, no DST).
const VN_OFFSET = "+07:00";

export function toInstant(localDateTime: string) {
  return new Date(`${localDateTime}:00${VN_OFFSET}`);
}

/** Parses "YYYY-MM-DD" as a calendar date, independent of server timezone. */
export function parseDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return { year: y, month: m, day: d };
}

const WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

export function weekday(date: string) {
  const { year, month, day } = parseDate(date);
  return WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "20.10.2026" */
export function dotted(date: string) {
  const { year, month, day } = parseDate(date);
  return `${pad(day)}.${pad(month)}.${year}`;
}

/** "Thứ Ba, ngày 20 tháng 10, 2026" */
export function longVi(date: string) {
  const { year, month, day } = parseDate(date);
  return `${weekday(date)}, ngày ${day} tháng ${month}, ${year}`;
}

/** Monday-first month grid; null for leading/trailing blanks. */
export function monthGrid(year: number, month: number) {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const lead = (first + 6) % 7;
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (number | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);
  return cells;
}
