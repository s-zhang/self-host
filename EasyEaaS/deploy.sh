#!/bin/sh

TARGET=szh10000@stevenzps.duckdns.org
KEY_FILE=./selfhost
HOME_DIR=/home/szh10000
TARGET_DEPLOY_DIR=$HOME_DIR/deploy/EasyEaaS
SOURCE_DIR=./dist

ssh $TARGET -i $KEY_FILE -t "bash -ci \"cd $HOME_DIR/docker && (docker-compose kill easyeaas || rm -rf $TARGET_DEPLOY_DIR/* || mkdir $TARGET_DEPLOY_DIR || true)\""
scp -r -i $KEY_FILE $SOURCE_DIR/* $TARGET:$TARGET_DEPLOY_DIR
ssh $TARGET -i $KEY_FILE -t "bash -ci \"cd $HOME_DIR/docker && docker-compose up easyeaas &\""
