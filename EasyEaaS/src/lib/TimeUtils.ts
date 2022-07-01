import { DateTime, Duration } from 'luxon';

interface ITimeUtils {
  local(): DateTime;
  fromJSDate(date: Date): DateTime;
  fromISO(dateString: string): DateTime;
  durationFromString(durationString: string): Duration;
  getMondayOfWeek(dateTime: DateTime): DateTime;
}

class TimeUtils implements ITimeUtils {
  private readonly timezone: string;
  constructor(timezone = 'America/Los_Angeles') {
    this.timezone = timezone;
  }

  local(): DateTime {
    return DateTime.local().setZone(this.timezone);
  }

  fromISO(dateString: string): DateTime {
    return DateTime.fromISO(dateString);
  }

  fromJSDate(date: Date): DateTime {
    return DateTime.fromJSDate(date).setZone(this.timezone);
  }

  durationFromString(durationString: string): Duration {
    return Duration.fromISO('P' + durationString.toLocaleUpperCase());
  }

  getMondayOfWeek(dateTime: DateTime): DateTime {
    return dateTime.startOf('day').plus({ days: 1 - dateTime.weekday });
  }
}

export { ITimeUtils, TimeUtils };
