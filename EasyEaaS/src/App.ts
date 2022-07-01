import * as bodyParser from 'body-parser';
import express from 'express';
import helmet from 'helmet';

import EvalController from './controllers/EvalController';
import IController from './controllers/IController';
import TrelloController from './controllers/TrelloController';
import Handler from './handlers/Handler';
import TrelloWebhookAuthHandler from './handlers/TrelloWebhookAuthHandler';
import { TimeUtils } from './lib/TimeUtils';
import { TrelloClient } from './lib/TrelloClient';
import AppConfig from './models/AppConfig';

class App {
  readonly config: AppConfig;
  constructor(config: AppConfig) {
    this.config = config;
  }
  setup(forTest = false): express.Express {
    const app: express.Express = express();

    /* Secure with Helmet */
    app.use(helmet());

    /* Parse request bodies as JSON */
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    const handlers = new Array<Handler>();
    if (!forTest) {
      handlers.push(
        new TrelloWebhookAuthHandler(
          '/api/trello',
          this.config.trelloApiKey.oauthSecret,
          'https://stevenzps.duckdns.org'
        )
      );
    }

    for (const handler of handlers) {
      handler.mount(app);
    }

    const router: express.Router = express.Router();

    /* Mount REST API routes */
    const controllers: IController[] = [
      new EvalController(),
      new TrelloController(
        new TrelloClient(this.config.trelloApiKey),
        new TimeUtils()
      ),
    ];
    for (const controller of controllers) {
      controller.mount(router);
    }

    app.use('/api', router);

    app.all('*', (req, res) => {
      res.status(404).send({
        message: 'Route not found!',
      });
    });

    return app;
  }
  run(app: express.Express) {
    app.listen(this.config.port, () => {
      console.log(`Server is listening on ${this.config.port}`);
    });
  }
}

export default App;
