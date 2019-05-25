import * as dotenv from "dotenv";
import { readFileSync, writeFileSync, readdirSync } from "fs";
import {
  IInfo,
  IData,
  ACTIONS,
  IGameObject,
  GameObjectTypes,
  IState,
} from "./Types";

dotenv.config();
if (!process.env.FILE) {
  throw new Error(`FILE not Found! Please set it in environment variables.`);
}
const filename = process.env.FILE;

const getActionXYTime = (
  data: IData,
  x: number,
  y: number,
  action: ACTIONS
) => {
  const entry = data.actions.find(
    entry => entry.x === x && entry.y === y && entry.type === action
  );

  return entry ? entry.timeMs : null;
};

const getGameObjectAppearTime = (data: IData, type: GameObjectTypes) => {
  const entry = data.states.find(state =>
    state.gameObjectState.find(obj => obj.type === type) ? true : false
  );

  return entry ? entry.timeMs : null;
};

const getGameObject = (gameObjects: IGameObject[], type: GameObjectTypes) => {
  if (type === GameObjectTypes.PLAYER) {
    return gameObjects.find(obj => obj.type === type && obj.id === 1);
  }
  return gameObjects.find(obj => obj.type === type);
};

const getPlayerAtXYTime = (data: IData, x: number, y: number) => {
  const entry = data.states.find(entry => {
    const player = getGameObject(entry.gameObjectState, GameObjectTypes.PLAYER);
    if (!player) {
      return false;
    }
    if (Math.abs(player.x - x) < 10 && Math.abs(player.y - y) < 10) {
      return true;
    }
    return false;
  });
  return entry ? entry.timeMs : null;
};

const getPlayerStartMoveTime = (data: IData) => {
  const entry = data.states.find((entry, index) => {
    const player = getGameObject(entry.gameObjectState, GameObjectTypes.PLAYER);
    if (!player) {
      return false;
    }
    if (data.states[index + 1]) {
      const playerNext = getGameObject(data.states[index + 1].gameObjectState, GameObjectTypes.PLAYER);
      if (
        playerNext &&
        (playerNext.x !== player.x || playerNext.y !== player.y)
      ) {
        return true;
      }
    }
    return false;
  });
  return entry ? entry.timeMs : null;
};

const getDelay = (inputMs: number | null, actionMs: number | null) => {
  if (inputMs && actionMs) {
    return actionMs - inputMs;
  }
  return null;
};

const getGameObjectMoveSquare = (
  statesOfInterest: IState[],
  type: GameObjectTypes
) => {
  if (statesOfInterest.length === 0) {
    throw Error("0 states of interest when calculating square!");
  }
  const count = statesOfInterest.length;

  let sum = 0;
  let statesWihoutCompare = 0;

  statesOfInterest.forEach(state => {
    const obj = getGameObject(state.gameObjectState, type);
    const objServer = getGameObject(state.serverGameObjectState, type);
    if (obj && objServer) {
      sum +=
        Math.pow(obj.x - objServer.x, 2) +
        Math.pow(obj.y - objServer.y, 2);
    } else {
      statesWihoutCompare++;
    }
  });
  const result = Math.floor(sum / (count - statesWihoutCompare));
  console.log(
    `States of interest: ${count}, Skipped: ${statesWihoutCompare}, Result: ${result}`
  );
  return result;
};

const getInput5 = (data: IData) => {
  const moveX900Y100Time = getActionXYTime(data, 900, 100, ACTIONS.MOVE);
  const playerAtX900Y100Time = getPlayerAtXYTime(data, 900, 100);
  let playerMoveX900Y100Square = null;
  if (moveX900Y100Time && playerAtX900Y100Time) {
    const statesOfInterest = data.states.filter(
      state =>
        state.timeMs >= moveX900Y100Time && state.timeMs <= playerAtX900Y100Time
    );
    playerMoveX900Y100Square = getGameObjectMoveSquare(statesOfInterest, GameObjectTypes.PLAYER);
  }

  const playerStartMoveTime = getPlayerStartMoveTime(data);
  const movDelay = getDelay(moveX900Y100Time, playerStartMoveTime);
  return { movDelay, playerMoveX900Y100Square };
};

const getInput1 = (data: IData) => {
  const bulletActionTime = getActionXYTime(data, 500, 400, ACTIONS.BULLET);
  const bulletAppearTime = getGameObjectAppearTime(
    data,
    GameObjectTypes.BULLET
  );
  let playerSq = null;
  if (bulletActionTime && bulletAppearTime) {
    const statesOfInterest = data.states.filter(
      state =>
        state.timeMs >= bulletActionTime && state.timeMs <= bulletAppearTime
    );
    playerSq = getGameObjectMoveSquare(statesOfInterest, GameObjectTypes.PLAYER);
  }

  const delay = getDelay(bulletActionTime, bulletAppearTime);
  return { delay, playerSq };
};

const getInput2 = (data: IData) => {
  const actionTime = getActionXYTime(data, 500, 400, ACTIONS.ROCKET);
  const appearTime = getGameObjectAppearTime(data, GameObjectTypes.ROCKET);
  let rocketSq = null;
  if (actionTime && appearTime) {
    const statesOfInterest = data.states.filter(
      state => state.timeMs >= actionTime
    );
    rocketSq = getGameObjectMoveSquare(statesOfInterest, GameObjectTypes.ROCKET);
  }

  const delay = getDelay(actionTime, appearTime);
  return { delay, rocketSq };
};

const analyzeFile = (filename: string) => {
  const data: IData = JSON.parse(readFileSync(`./input/${filename}`, "utf8"));

  const info: IInfo = {
    input1: getInput1(data),
    input2: getInput2(data),
    input5: getInput5(data),
  };

  writeFileSync(`./output/${filename}`, JSON.stringify(info));
};

const outputFile = readdirSync("./output");
readdirSync("./input")
  .filter(name => !outputFile.includes(name))
  .forEach(filename => analyzeFile(filename));
