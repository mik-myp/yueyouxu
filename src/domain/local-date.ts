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
