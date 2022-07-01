/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Card {
  id: string;
  name: string;
  idList: string;
  due: undefined | string;
}

export interface List {
  id: string;
  name: string;
}

export interface Board {
  id: string;
  name: string;
}

export interface ActionData {
  card: Card | undefined;
  list: List | undefined;
  board: Board;
}

export interface UpdateCustomFieldItemActionData {
  customField: CustomField;
  customFieldItem: ActionDataCustomFieldItems;
  board: Board;
  card: Card;
}

export interface Value {
  [s: string]: string;
}

export interface Action {
  id: string;
  data: any;
  type: string;
  date: string;
}

export interface BoardWebhook {
  action: Action;
  model: Board;
}

export interface CustomField {
  id: string;
  name: string;
  type: string;
}

export interface CustomFieldItems {
  id: string;
  value: Value | undefined;
  idCustomField: string;
}

export interface ActionDataCustomFieldItems extends CustomFieldItems {
  idModel: string;
  modelType: string;
}
