import axios from 'axios';
import axiosBetterStacktrace from 'axios-better-stacktrace';

import TrelloConfig from '../models/TrelloConfig';
import {
  Board,
  Card,
  CustomField,
  CustomFieldItems,
  List,
  Value,
} from '../models/TrelloModels';

axiosBetterStacktrace(axios);

interface ITrelloClient {
  moveCardToList(cardId: string, listId: string): Promise<void>;
  copyCard(
    fromCardId: string,
    toListId: string,
    propertiesToCopy?: string
  ): Promise<void>;
  getLists(boardId: string): Promise<List[]>;
  getListByName(boardId: string, name: string): Promise<List | undefined>;
  getCards(listId: string): Promise<Card[]>;
  updateCustomFieldItemOnCard(
    cardId: string,
    customFieldId: string,
    value: Value | undefined
  ): Promise<void>;
  getCustomFieldsForBoard(boardId: string): Promise<CustomField[]>;
  getCustomFieldsByName(
    boardId: string,
    name: string
  ): Promise<CustomField | undefined>;
  getCustomFieldIdByName(boardId: string, name: string): Promise<string>;
  getCustomFieldItemsOnCard(cardId: string): Promise<CustomFieldItems[]>;
  getCustomFieldValueById<T>(
    cardId: string,
    customFieldId: string,
    parser: (s: string) => T
  ): Promise<T | undefined>;
  getCustomFieldValueFromItems<T>(
    fieldItems: CustomFieldItems,
    parser: (s: string) => T
  ): T | undefined;
  getBoards(): Promise<Board[]>;
}

class TrelloClient implements ITrelloClient {
  private readonly trelloEndpoint: string = 'https://api.trello.com/1';
  private readonly trelloAuthParams: string;
  constructor(trelloConfig: TrelloConfig) {
    this.trelloAuthParams = `key=${trelloConfig.key}&token=${trelloConfig.token}`;
  }
  async moveCardToList(cardId: string, listId: string): Promise<void> {
    const url = `${this.trelloEndpoint}/cards/${cardId}?${this.trelloAuthParams}`;
    console.log(`TrelloClient: PUT ${url}`);
    await axios.put(url, {
      idList: listId,
    });
  }
  async copyCard(
    fromCardId: string,
    toListId: string,
    propertiesToCopy = 'attachments,checklists,comments,due,start,labels,members,stickers'
  ): Promise<void> {
    const url = `${this.trelloEndpoint}/cards?idList=${toListId}&${this.trelloAuthParams}`;
    console.log(`TrelloClient: POST ${url}`);
    const body = {
      idCardSource: fromCardId,
      keepFromSource: propertiesToCopy,
    };
    console.log(`TrelloClient: body: ${JSON.stringify(body, null, 4)}`);
    await axios.post(url, body);
  }
  async updateCustomFieldItemOnCard(
    cardId: string,
    customFieldId: string,
    value: Value | undefined
  ): Promise<void> {
    const url = `${this.trelloEndpoint}/cards/${cardId}/customField/${customFieldId}/item?${this.trelloAuthParams}`;
    console.log(`TrelloClient: PUT ${url}`);
    const body = {
      value: value ?? '',
    };
    console.log(`TrelloClient: body: ${JSON.stringify(body, null, 4)}`);
    await axios.put(url, body);
  }
  async getCustomFieldsForBoard(boardId: string): Promise<CustomField[]> {
    const url = `${this.trelloEndpoint}/boards/${boardId}/customFields?${this.trelloAuthParams}`;
    console.log(`TrelloClient: GET ${url}`);
    const response = await axios.get<CustomField[]>(url);
    return response.data;
  }
  async getCustomFieldsByName(
    boardId: string,
    name: string
  ): Promise<CustomField | undefined> {
    const fields = await this.getCustomFieldsForBoard(boardId);
    let fieldWithName;
    for (const field of fields) {
      if (field.name == name) {
        fieldWithName = field;
      }
    }
    return fieldWithName;
  }
  async getCustomFieldIdByName(boardId: string, name: string): Promise<string> {
    const field = await this.getCustomFieldsByName(boardId, name);
    if (!field) {
      throw new Error(
        `Custom field with ${name} does not exist in board ${boardId}`
      );
    }
    return field.id;
  }
  async getCustomFieldItemsOnCard(cardId: string): Promise<CustomFieldItems[]> {
    const url = `${this.trelloEndpoint}/cards/${cardId}/customFieldItems?${this.trelloAuthParams}`;
    console.log(`TrelloClient: GET ${url}`);
    const response = await axios.get<CustomFieldItems[]>(url);
    return response.data;
  }
  async getCustomFieldValueById<T>(
    cardId: string,
    customFieldId: string,
    parser: (s: string) => T
  ): Promise<T | undefined> {
    const allFieldItems = await this.getCustomFieldItemsOnCard(cardId);
    let value;
    for (const fieldItems of allFieldItems) {
      if (fieldItems.idCustomField == customFieldId) {
        value = this.getCustomFieldValueFromItems(fieldItems, parser);
      }
    }
    return value;
  }
  getCustomFieldValueFromItems<T>(
    fieldItems: CustomFieldItems,
    parser: (s: string) => T
  ): T | undefined {
    let value;
    if (fieldItems.value) {
      value = parser(Object.values<string>(fieldItems.value)[0]);
    }
    return value;
  }
  async getBoards(): Promise<Board[]> {
    const url = `${this.trelloEndpoint}/members/me/boards?${this.trelloAuthParams}`;
    console.log(`TrelloClient: GET ${url}`);
    const response = await axios.get<Board[]>(url);
    return response.data;
  }
  async getLists(boardId: string): Promise<List[]> {
    const url = `${this.trelloEndpoint}/boards/${boardId}/lists?${this.trelloAuthParams}`;
    console.log(`TrelloClient: GET ${url}`);
    const response = await axios.get<List[]>(url);
    return response.data;
  }
  async getListByName(
    boardId: string,
    name: string
  ): Promise<List | undefined> {
    const lists = await this.getLists(boardId);
    return lists.find((list) => list.name === name);
  }
  async getCards(listId: string): Promise<Card[]> {
    const url = `${this.trelloEndpoint}/lists/${listId}/cards?${this.trelloAuthParams}`;
    console.log(`TrelloClient: GET ${url}`);
    const response = await axios.get<Card[]>(url);
    return response.data;
  }
}

export { TrelloClient, ITrelloClient };
