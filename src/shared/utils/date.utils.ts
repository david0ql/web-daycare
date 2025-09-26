import * as moment from 'moment';

export class DateUtils {
  static formatDate(date: string | Date, format: string = 'DD/MM/YYYY'): string {
    return moment(date).format(format);
  }

  static formatDateTime(date: string | Date, format: string = 'DD/MM/YYYY HH:mm'): string {
    return moment(date).format(format);
  }

  static formatTime(date: string | Date, format: string = 'HH:mm'): string {
    return moment(date).format(format);
  }

  static getRelativeTime(date: string | Date): string {
    return moment(date).fromNow();
  }

  static isToday(date: string | Date): boolean {
    return moment(date).isSame(moment(), 'day');
  }

  static isYesterday(date: string | Date): boolean {
    return moment(date).isSame(moment().subtract(1, 'day'), 'day');
  }

  static isTomorrow(date: string | Date): boolean {
    return moment(date).isSame(moment().add(1, 'day'), 'day');
  }

  static getDaysDifference(date1: string | Date, date2: string | Date): number {
    return moment(date1).diff(moment(date2), 'days');
  }

  static getHoursDifference(date1: string | Date, date2: string | Date): number {
    return moment(date1).diff(moment(date2), 'hours');
  }

  static getMinutesDifference(date1: string | Date, date2: string | Date): number {
    return moment(date1).diff(moment(date2), 'minutes');
  }

  static addDays(date: string | Date, days: number): string {
    return moment(date).add(days, 'days').toISOString();
  }

  static addMonths(date: string | Date, months: number): string {
    return moment(date).add(months, 'months').toISOString();
  }

  static addYears(date: string | Date, years: number): string {
    return moment(date).add(years, 'years').toISOString();
  }

  static startOfDay(date: string | Date): string {
    return moment(date).startOf('day').toISOString();
  }

  static endOfDay(date: string | Date): string {
    return moment(date).endOf('day').toISOString();
  }

  static startOfMonth(date: string | Date): string {
    return moment(date).startOf('month').toISOString();
  }

  static endOfMonth(date: string | Date): string {
    return moment(date).endOf('month').toISOString();
  }

  static startOfYear(date: string | Date): string {
    return moment(date).startOf('year').toISOString();
  }

  static endOfYear(date: string | Date): string {
    return moment(date).endOf('year').toISOString();
  }

  static isValidDate(date: string | Date): boolean {
    return moment(date).isValid();
  }

  static parseDate(date: string, format?: string): moment.Moment {
    return moment(date, format);
  }

  static getCurrentDate(): string {
    return moment().toISOString();
  }

  static getCurrentTimestamp(): number {
    return moment().valueOf();
  }
}
