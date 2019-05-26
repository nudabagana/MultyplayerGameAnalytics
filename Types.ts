// Input Types
export interface IData {
  states: IState[];
  actions: IAction[];
  receivedActions: IAction[];
}

export interface IState {
  tick: number;
  serverTick: number;
  timeMs: number;
  gameObjectState: IGameObject[];
  serverGameObjectState: IGameObject[];
}

export interface IGameObject {
  x: number;
  y: number;
  type: GameObjectTypes;
  id: number;
}

export interface IAction {
  tick: number;
  serverTick: number;
  timeMs: number;
  x: number;
  y: number;
  type: ACTIONS;
}
// Output Types
export interface IInfo {
  input1_3: { delay: number | null; playerSq: number | null };
  input2_4: { delay: number | null; rocketSq: number | null };
  input5: { delay: number | null; playerSq: number | null };
  input6_7: { delay: number | null; playerSq: number | null };
  input8_9: { delay: number | null; playerSq: number | null };
}

export enum GameObjectTypes {
  PLAYER = 0,
  ROCKET = 1,
  BULLET = 2,
}

export enum ACTIONS {
  MOVE = 0,
  BULLET = 1,
  ROCKET = 2,
  SET_PING = 3,
}
