import TrelloConfig from './TrelloConfig';

class AppConfig {
  readonly port: number;
  readonly trelloApiKey: TrelloConfig;
  constructor(port: number, trelloApiKey: TrelloConfig) {
    this.port = port;
    this.trelloApiKey = trelloApiKey;
  }
}

export default AppConfig;
