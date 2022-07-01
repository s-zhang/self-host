import fs from 'fs';

import sms from 'source-map-support';

import App from './App';
import AppConfig from './models/AppConfig';

sms.install();

const appConfigPath = process.argv[2];

const appConfig = JSON.parse(
  fs.readFileSync(appConfigPath, 'utf-8')
) as AppConfig;

const app = new App(appConfig);
app.run(app.setup());
