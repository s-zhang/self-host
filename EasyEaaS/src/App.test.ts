import test from 'ava';
import request from 'supertest';

import App from './App';
import AppConfig from './models/AppConfig';
import TrelloConfig from './models/TrelloConfig';

const app = new App(new AppConfig(0, new TrelloConfig('', '', ''))).setup(true);

test('TestEval', async (t) => {
  const response = await request(app)
    .post('/api/eval')
    .send({ code: 'const a = 1 + 1; a + 1' })
    .set('Accept', 'application/json');
  t.is(response.status, 200);
  t.is(response.body, 3);
});

test('TestTrelloWebHookHead', async (t) => {
  const response = await request(app).head('/api/trello/board_webhook');
  t.is(response.status, 200);
});
