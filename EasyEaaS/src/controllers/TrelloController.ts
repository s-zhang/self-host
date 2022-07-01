/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Request, Response, Router } from 'express';
import asyncHandler from 'express-async-handler';
import { DateTime, Duration } from 'luxon';

import { ITimeUtils } from '../lib/TimeUtils';
import { ITrelloClient } from '../lib/TrelloClient';
import {
  Board,
  BoardWebhook,
  UpdateCustomFieldItemActionData,
} from '../models/TrelloModels';

import IController from './IController';

class TrelloController implements IController {
  private readonly trelloClient: ITrelloClient;
  private readonly timeUtils: ITimeUtils;
  constructor(trelloClient: ITrelloClient, timeUtils: ITimeUtils) {
    this.trelloClient = trelloClient;
    this.timeUtils = timeUtils;
  }
  async boardWebhookListener(
    request: Request,
    response: Response
  ): Promise<void> {
    const webhook = request.body as BoardWebhook;
    console.log(`Webhook triggered. ${JSON.stringify(webhook, null, 4)}`);
    const board: Board = webhook.model;
    if (board.name.endsWith('[X]')) {
      switch (webhook.action.type) {
        case 'updateCard':
          break;
        case 'updateCustomFieldItem':
          await this.updateDaysActiveUponActiveDateChange(webhook.action.data);
          break;
      }
    }

    response.end();
  }

  echo(request: Request, response: Response) {
    const body = JSON.stringify(request.body, null, 4);
    console.log(body);
    response.end(body);
  }

  async moveCardToListIfNeeded(
    cardId: string,
    fromListId: string,
    toListId: string
  ): Promise<void> {
    if (fromListId == toListId) {
      console.log(`card ${cardId} already in list ${toListId}`);
    } else {
      console.log(
        `Moving card ${cardId} from list ${fromListId} to list ${toListId}`
      );
      await this.trelloClient.moveCardToList(cardId, toListId);
    }
  }

  async updateCustomFieldItemHandler(data: UpdateCustomFieldItemActionData) {
    await this.updateDaysActiveUponActiveDateChange(data);
  }

  async updateDaysActiveUponActiveDateChange(
    data: UpdateCustomFieldItemActionData
  ): Promise<void> {
    if (data.customField.name != 'Active Date') {
      return;
    }

    const activeDate = this.trelloClient.getCustomFieldValueFromItems<DateTime>(
      data.customFieldItem,
      this.timeUtils.fromISO
    );

    const daysActiveField = await this.trelloClient.getCustomFieldsByName(
      data.board.id,
      'DA'
    );

    await this.updateDaysActiveIfNeeded(
      data.card.id,
      activeDate,
      daysActiveField!.id
    );
  }

  async updateDaysActiveIfNeeded(
    cardId: string,
    activeDate: DateTime | undefined,
    daysActiveFieldId: string
  ): Promise<void> {
    //console.log(activeDate.toISO());
    let value;
    if (activeDate) {
      const daysActive = Math.round(-activeDate.diffNow('day').days);
      //console.log(daysActive);
      value = {
        number: `${daysActive}`,
      };
    }
    await this.trelloClient.updateCustomFieldItemOnCard(
      cardId,
      daysActiveFieldId,
      value
    );
  }

  async updateAllCardsDaysActive(boardId: string): Promise<void> {
    const activeDateFieldId = await this.trelloClient.getCustomFieldIdByName(
      boardId,
      'Active Date'
    );
    const daysActiveFieldId = await this.trelloClient.getCustomFieldIdByName(
      boardId,
      'DA'
    );

    const lists = await this.trelloClient.getLists(boardId);
    for (const list of lists) {
      if (list.name.endsWith('[M]')) {
        // Skip any lists marked [M] as in Meta
        continue;
      }
      const cards = await this.trelloClient.getCards(list.id);
      for (const card of cards) {
        const activeDate = await this.trelloClient.getCustomFieldValueById<
          DateTime
        >(card.id, activeDateFieldId, this.timeUtils.fromISO);
        await this.updateDaysActiveIfNeeded(
          card.id,
          activeDate,
          daysActiveFieldId
        );
      }
    }
  }

  async updateRepeatingCards(boardId: string): Promise<void> {
    const recurringCardsList = await this.trelloClient.getListByName(
      boardId,
      'Repeats [M]'
    );
    if (!recurringCardsList) {
      return;
    }

    const nextRepeatFieldId = await this.trelloClient.getCustomFieldIdByName(
      boardId,
      'Next Repeat'
    );
    const repeatEveryFieldId = await this.trelloClient.getCustomFieldIdByName(
      boardId,
      'Repeat Every'
    );
    const repeatListFieldId = await this.trelloClient.getCustomFieldIdByName(
      boardId,
      'Repeat List'
    );

    const recurringCards = await this.trelloClient.getCards(
      recurringCardsList.id
    );
    for (const recurringCard of recurringCards) {
      const nextRepeatDate = await this.trelloClient.getCustomFieldValueById<
        DateTime
      >(recurringCard.id, nextRepeatFieldId, this.timeUtils.fromISO);
      console.log(`Next repeat date ${nextRepeatDate}`);
      if (
        nextRepeatDate &&
        nextRepeatDate.startOf('day') <= this.timeUtils.local().startOf('day')
      ) {
        // If next repeat date is same as today's date

        const repeatListName = await this.trelloClient.getCustomFieldValueById<
          string
        >(recurringCard.id, repeatListFieldId, (s) => s);
        if (!repeatListName) {
          console.log(
            `Recurring card [${recurringCard.name}] does not have Repeat List field defined!`
          );
          continue;
        }
        const repeatList = await this.trelloClient.getListByName(
          boardId,
          repeatListName
        );

        this.trelloClient.copyCard(recurringCard.id, repeatList!.id);

        const repeatEvery = await this.trelloClient.getCustomFieldValueById<
          Duration
        >(
          recurringCard.id,
          repeatEveryFieldId,
          this.timeUtils.durationFromString
        );
        if (!repeatEvery) {
          console.log(
            `Recurring card [${recurringCard.name}] does not have Repeat Every field defined!`
          );
          continue;
        }

        const nextNextRepeatDate = nextRepeatDate.plus(repeatEvery);

        await this.trelloClient.updateCustomFieldItemOnCard(
          recurringCard.id,
          nextRepeatFieldId,
          {
            date: nextNextRepeatDate.toISO(),
          }
        );
      }
    }
  }

  private mountTrelloWebhook(
    router: Router,
    pathComponent: string,
    listener: (request: Request, response: Response) => Promise<void>
  ): void {
    const path = `/trello/${pathComponent}`;
    router.post(path, asyncHandler(listener));
    router.head(path, (req, res) => {
      res.sendStatus(200);
    });
  }

  mount(router: Router): void {
    this.mountTrelloWebhook(router, 'board_webhook', (req, res) =>
      this.boardWebhookListener(req, res)
    );
    router.post(
      '/butler_trello/update_days_active',
      asyncHandler(async (req, res) => {
        await this.updateAllCardsDaysActive(req.query.boardId as string);
        res.sendStatus(200);
      })
    );
    router.post(
      '/butler_trello/update_repeats',
      asyncHandler(async (req, res) => {
        await this.updateRepeatingCards(req.query.boardId as string);
        res.sendStatus(200);
      })
    );
    router.post('/trello/echo', this.echo);
  }
}

export default TrelloController;
