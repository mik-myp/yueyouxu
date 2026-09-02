const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type LocalDate = string & { readonly __localDate: unique symbol };

export function parseLocalDate(value: string): LocalDate {
  if (!LOCAL_DATE_PATTERN.test(value)) {
    throw new Error('日期必须使用 YYYY-MM-DD 格式');
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error('日期不是有效的本地日历日期');
  }

  return value as LocalDate;
}

export function currentTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export function formatLocalDate(date: Date): LocalDate {
  return parseLocalDate(
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`,
  );
}

export function differenceInLocalDays(from: LocalDate, to: LocalDate) {
  const fromTime = Date.parse(`${from}T00:00:00Z`);
  const toTime = Date.parse(`${to}T00:00:00Z`);
  return Math.round((toTime - fromTime) / 86400000);
}

export function addLocalDays(value: LocalDate, amount: number): LocalDate {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return parseLocalDate(
    `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
      date.getUTCDate(),
    ).padStart(2, '0')}`,
  );
}
