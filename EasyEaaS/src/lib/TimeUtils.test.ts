import test from 'ava';
import { DateTime } from 'luxon';

import { TimeUtils } from './TimeUtils';

const timeUtils = new TimeUtils();

test('GetMondayOfWeekOfMondayIsSameDay', (t) => {
  const aMonday = DateTime.fromObject({
    year: 2020,
    month: 10,
    day: 5,
  });
  const mondayOfWeek = timeUtils.getMondayOfWeek(aMonday);
  t.is(mondayOfWeek.month, 10);
  t.is(mondayOfWeek.day, 5);
});

test('GetMondayOfWeekOfSundayIsLastMonday', (t) => {
  const aSunday = DateTime.fromObject({
    year: 2020,
    month: 10,
    day: 11,
  });
  const mondayOfWeek = timeUtils.getMondayOfWeek(aSunday);
  t.is(mondayOfWeek.month, 10);
  t.is(mondayOfWeek.day, 5);
});
