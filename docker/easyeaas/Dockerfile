FROM node:16

ADD ../EasyEaaS/dist /build

ADD config /config

CMD node /build/bundle.js /config/app_config.json

