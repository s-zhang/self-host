class TrelloConfig {
  readonly key: string;
  readonly token: string;
  readonly oauthSecret: string;
  constructor(key: string, token: string, oauthSecret: string) {
    this.key = key;
    this.token = token;
    this.oauthSecret = oauthSecret;
  }
}

export default TrelloConfig;
