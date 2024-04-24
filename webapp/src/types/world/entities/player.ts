import { ILive } from "./utils/live";
import { Vector2D } from "@type/world/level";
import { ISprite } from "./utils/sprite";
import { IEnemyTarget } from "./npc/enemy";
import { Wawa } from "@type/wawa";

export interface IPlayer extends ISprite, IEnemyTarget {
  /**
   * Total number of killed enemies.
   */
  readonly kills: number;

  /**
   * Player experience.
   */
  experience: number;

  /**
   * Score amount.
   */
  readonly score: number;

  /**
   * Resourses amount.
   */
  readonly resources: number;

  /**
   * Health management.
   */
  readonly live: ILive;

  /**
   * Levels of upgrades.
   */
  readonly upgradeLevel: Record<PlayerSkill, number>;

  /**
   * Active superskills.
   */
  readonly activeSuperskills: Partial<Record<PlayerSuperskill, boolean>>;

  /**
   * cooltime superskills.
   */
  readonly coolDownSuperskills: Partial<Record<PlayerSuperskill, boolean>>;

  /**
   * wawa.
   */
  readonly wawa?: Wawa;

  /**
   * Upgrade player skill.
   */
  upgrade(type: PlayerSkill): void;

  /**
   * Get experience amount need to upgrade.
   */
  getExperienceToUpgrade(type: PlayerSkill): number;

  /**
   * Inremeting number of killed enemies.
   */
  incrementKills(): void;

  /**
   * Give player score.
   * @param amount - Amount
   */
  giveScore(amount: number): void;

  /**
   * Give player experience.
   * @param amount - Amount
   */
  giveExperience(amount: number): void;

  /**
   * Give player resources.
   * @param amount - Resources amount
   */
  giveResources(amount: number): void;

  /**
   * Change player position at matrix.
   */
  changePosition(positionAtMatrix: Vector2D): void;

  /**
   * Take player resources.
   * @param amount - Resources amount
   */
  takeResources(amount: number): void;

  /**
   * Use superskill.
   * @param type - Superskill
   */
  useSuperskill(type: PlayerSuperskill): void;

  /**
   * Get current cost of superskill.
   * @param type - Superskill
   */
  getSuperskillCost(type: PlayerSuperskill): number;

  /**
   * Set angle of target movement direction.
   * @param angle - Angle
   */
  setMovementTarget(angle: Nullable<number>): void;

  /**
   * Get data for saving.
   */
  getDataPayload(): PlayerDataPayload;

  /**
   * Load saved data.
   * @param data - Data
   */
  loadDataPayload(data: PlayerDataPayload): void;
}

export enum PlayerTexture {
  PLAYER = "player",
}

export enum PlayerAudio {
  UPGRADE = "player/upgrade",
  WALK = "player/walk",
  DEAD = "player/dead",
  DAMAGE_1 = "player/damage_1",
  DAMAGE_2 = "player/damage_2",
  DAMAGE_3 = "player/damage_3",
}

export enum WawaAtlas {
  PRIMA = "prima",
  ZOOK = "zook",
  MECHA = "mecha",
  FLAVO = "flavo",
  PET = "pet",
}

export enum PlayerSkillAudio {
  FROST = "player/superskill_frost",
  RAGE = "player/superskill_rage",
  SHIELD = "player/superskill_shield",
  FIRE = "player/superskill_fire",
}
export enum PlayerSkill {
  MAX_HEALTH = "MAX_HEALTH",
  SPEED = "SPEED",
  BUILD_AREA = "BUILD_AREA",
  BUILD_SPEED = "BUILD_SPEED",
  ATTACK_DAMAGE = "ATTACK_DAMAGE",
  ATTACK_DISTANCE = "ATTACK_DISTANCE",
  ATTACK_SPEED = "ATTACK_SPEED",
}

export enum MovementDirection {
  LEFT_UP = "left_up",
  LEFT = "left",
  LEFT_DOWN = "left_down",
  UP = "up",
  DOWN = "down",
  RIGHT_UP = "right_up",
  RIGHT = "right",
  RIGHT_DOWN = "right_down",
}

export type PlayerData = {
  positionAtMatrix: Vector2D;
  wawa?: Wawa;
};

export type PlayerSkillInfo = {
  label: string;
  experience: number;
  target: PlayerSkillTarget;
};

export enum PlayerSkillTarget {
  CHARACTER = "CHARACTER",
  ASSISTANT = "ASSISTANT",
}

export type PlayerSkillData = PlayerSkillInfo & {
  currentLevel: number;
};

export enum PlayerSuperskill {
  FROST = "FROST",
  RAGE = "RAGE",
  SHIELD = "SHIELD",
  FIRE = "FIRE",
}

export type PlayerSuperskillData = {
  description: string;
  cost: number;
  duration: number;
  cooltime: number;
};

export type PlayerDataPayload = {
  position: Vector2D;
  score: number;
  experience: number;
  resources: number;
  kills: number;
  health: number;
  upgradeLevel: Record<PlayerSkill, number>;
  wawa?: Wawa;
};
