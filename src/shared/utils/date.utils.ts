import dayjs from 'dayjs';

export class DateUtils {
  static formatDate(date: string | Date, format: string = 'DD/MM/YYYY'): string {
    return dayjs(date).format(format);
  }

  static formatDateTime(date: string | Date, format: string = 'DD/MM/YYYY HH:mm'): string {
    return dayjs(date).format(format);
  }

  static formatTime(date: string | Date, format: string = 'HH:mm'): string {
    return dayjs(date).format(format);
  }

  static getRelativeTime(date: string | Date): string {
    return dayjs(date).fromNow();
  }

  static isToday(date: string | Date): boolean {
    return dayjs(date).isSame(dayjs(), 'day');
  }

  static isYesterday(date: string | Date): boolean {
    return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day');
  }

  static isTomorrow(date: string | Date): boolean {
    return dayjs(date).isSame(dayjs().add(1, 'day'), 'day');
  }

  static getDaysDifference(date1: string | Date, date2: string | Date): number {
    return dayjs(date1).diff(dayjs(date2), 'days');
  }

  static getHoursDifference(date1: string | Date, date2: string | Date): number {
    return dayjs(date1).diff(dayjs(date2), 'hours');
  }

  static getMinutesDifference(date1: string | Date, date2: string | Date): number {
    return dayjs(date1).diff(dayjs(date2), 'minutes');
  }

  static addDays(date: string | Date, days: number): string {
    return dayjs(date).add(days, 'days').toISOString();
  }

  static addMonths(date: string | Date, months: number): string {
    return dayjs(date).add(months, 'months').toISOString();
  }

  static addYears(date: string | Date, years: number): string {
    return dayjs(date).add(years, 'years').toISOString();
  }

  static startOfDay(date: string | Date): string {
    return dayjs(date).startOf('day').toISOString();
  }

  static endOfDay(date: string | Date): string {
    return dayjs(date).endOf('day').toISOString();
  }

  static startOfMonth(date: string | Date): string {
    return dayjs(date).startOf('month').toISOString();
  }

  static endOfMonth(date: string | Date): string {
    return dayjs(date).endOf('month').toISOString();
  }

  static startOfYear(date: string | Date): string {
    return dayjs(date).startOf('year').toISOString();
  }

  static endOfYear(date: string | Date): string {
    return dayjs(date).endOf('year').toISOString();
  }

  static isValidDate(date: string | Date): boolean {
    return dayjs(date).isValid();
  }

  static parseDate(date: string, format?: string): dayjs.Dayjs {
    return dayjs(date, format);
  }

  static getCurrentDate(): string {
    return dayjs().toISOString();
  }

  static getCurrentTimestamp(): number {
    return dayjs().valueOf();
  }
}