import test from 'ava';

import { TimeUtils } from '../lib/TimeUtils';
import { TrelloClient } from '../lib/TrelloClient';
import TrelloConfig from '../models/TrelloConfig';

import TrelloController from './TrelloController';

const controller = new TrelloController(
  new TrelloClient(
    new TrelloConfig('dummy_value', 'dummy_value', 'dummy_value')
  ),
  new TimeUtils()
);

test('TestTrelloUpdateDaysActive', async (t) => {
  await controller.updateAllCardsDaysActive('5ffe15d6fb57611385417155');
  t.pass();
});

test('TestTrelloUpdateRepeats', async (t) => {
  await controller.updateRepeatingCards('5ffe15d6fb57611385417155');
  t.pass();
});
