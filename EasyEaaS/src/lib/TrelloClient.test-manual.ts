/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import test from 'ava';

import TrelloConfig from '../models/TrelloConfig';

import { TimeUtils } from './TimeUtils';
import { TrelloClient } from './TrelloClient';

const trelloClient = new TrelloClient(new TrelloConfig('', '', ''));

test('TestUpdateCustomFieldItemOnCard', async (t) => {
  await trelloClient.updateCustomFieldItemOnCard(
    '603349c0a9fc7b72823ce9d3',
    '6039735c1a0da10234ab1707',
    {
      number: '100',
    }
  );
  t.pass();
});

test('TestGetBoards', async (t) => {
  const boards = await trelloClient.getBoards();
  for (const board of boards) {
    console.log(`${board.name}: ${board.id}`);
  }
  t.pass();
});

test('TestGetCustomFieldsByName', async (t) => {
  const boards = await trelloClient.getBoards();
  let workBoard = null;
  for (const board of boards) {
    if (board.name == 'Work v2') {
      workBoard = board;
    }
  }
  const boardId = workBoard!.id;

  const daysActiveField = await trelloClient.getCustomFieldsByName(
    boardId,
    'DA'
  );
  console.log(daysActiveField?.id);
  t.pass();
});

test('Test', async (t) => {
  t.pass();
});
