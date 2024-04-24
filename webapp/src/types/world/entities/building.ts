import Phaser from "phaser";
import { IParticlesParent } from "../effects";
import { IWorld } from "../world";
import { ILive } from "./utils/live";
import { Vector2D } from "@type/world/level";
import { IShotInitiator } from "./shot";
import { IEnemyTarget } from "./npc/enemy";
import { TutorialStep } from "@type/tutorial";

export interface IBuilding
  extends Phaser.GameObjects.Image,
    IEnemyTarget,
    IParticlesParent,
    IShotInitiator {
  readonly scene: IWorld;

  /**
   * Health management.
   */
  readonly live: ILive;

  /**
   * Current upgrade level.
   */
  readonly upgradeLevel: number;

  /**
   * Position at matrix.
   */
  readonly positionAtMatrix: Vector2D;

  /**
   * Variant name.
   */
  readonly variant: BuildingVariant;

  /**
   * Is cursor on building.
   */
  readonly isFocused: boolean;

  /**
   * Check is position inside action area.
   * @param position - Position at world
   */
  actionsAreaContains(position: Vector2D): boolean;

  /**
   * Pause actions.
   */
  pauseActions(): void;

  /**
   * Check is actions not paused.
   */
  isActionAllowed(): boolean;

  /**
   * Bind hint on tutorial step
   * @param step - Tutorial step
   * @param text - Message
   * @param condition - Show condition
   */
  bindTutorialHint(
    step: TutorialStep,
    text: string,
    condition?: () => boolean
  ): void;

  /**
   * Get building information params.
   */
  getInfo(): BuildingParam[];

  /**
   * Get building controls.
   */
  getControls(): BuildingControl[];

  /**
   * Get building meta.
   */
  getMeta(): IBuildingFactory;

  /**
   * Get actions radius.
   */
  getActionsRadius(): number;

  /**
   * Get actions pause.
   */
  getActionsDelay(): number;

  /**
   * Get resources need to upgrade level.
   * @param level - Specified upgrade level
   */
  getUpgradeCost(level?: number): number;

  /**
   * Get position with height offset.
   */
  getPositionOnGround(): Vector2D;

  /**
   * Set building active state.
   */
  select(): void;

  /**
   * Remove building active state.
   */
  unselect(): void;

  /**
   * Add alert icon.
   */
  addAlertIcon(): void;

  /**
   * Remove alert icon.
   */
  removeAlertIcon(): void;

  /**
   * Get data for saving.
   */
  getDataPayload(): BuildingDataPayload;

  /**
   * Load saved data.
   * @param data - Data
   */
  loadDataPayload(data: BuildingDataPayload): void;
}

export interface IBuildingAmmunition extends IBuilding {
  /**
   * Current ammo count.
   */
  readonly ammo: number;

  /**
   * Use ammunition.
   * Returns count of ammo which was used.
   */
  use(amount: number): number;
}

export interface IBuildingBooster extends IBuilding {
  /**
   * Increase power.
   */
  readonly power: number;
}

export interface IBuildingTower extends IBuilding {
  /**
   * Current ammo in clip.
   */
  readonly ammo: number;
}

export interface IBuildingFactory {
  Name: string;
  Description: string;
  Params: BuildingParam[];
  Texture: BuildingTexture;
  Cost: number;
  Health: number;
  Limit?: boolean;
  AllowByWave?: number;
  MaxLevel: number;
  new (scene: IWorld, data: BuildingVariantData): IBuilding;
}

export enum BuildingEvents {
  UPGRADE = "upgrade",
  BUY_AMMO = "buy_ammo",
  BREAK = "break",
}

export enum BuildingVariant {
  TOWER_FIRE = "TOWER_FIRE",
  STAKING = "STAKING",
  WALL = "WALL",
  AMMUNITION = "AMMUNITION",
  TOWER_FROZEN = "TOWER_FROZEN",
  TOWER_LAZER = "TOWER_LAZER",
  RADAR = "RADAR",
  BOOSTER = "BOOSTER",
  STAIR = "STAIR",
}

export enum BuildingTexture {
  WALL = "building/textures/wall",
  TOWER_FIRE = "building/textures/tower_fire",
  TOWER_FROZEN = "building/textures/tower_frozen",
  TOWER_LAZER = "building/textures/tower_lazer",
  STAKING = "building/textures/staking",
  AMMUNITION = "building/textures/ammunition",
  RADAR = "building/textures/radar",
  BOOSTER = "building/textures/booster",
  STAIR = "building/textures/stair",
}

export enum BuildingIcon {
  CONFIRM = "building/icons/confirm",
  CONFIRM_DISABLED = "building/icons/confirm_disabled",
  DECLINE = "building/icons/decline",
  ALERT = "building/icons/alert",
  UPGRADE = "building/icons/upgrade",
  HEALTH = "building/icons/params/health",
  RADIUS = "building/icons/params/radius",
  AMMO = "building/icons/params/ammo",
  HEAL = "building/icons/params/heal",
  DAMAGE = "building/icons/params/damage",
  RESOURCES = "building/icons/params/resources",
  SPEED = "building/icons/params/speed",
  DELAY = "building/icons/params/pause",
  POWER = "building/icons/params/power",
}

export enum BuildingAudio {
  SELECT = "building/select",
  UNSELECT = "building/unselect",
  BUILD = "building/build",
  UPGRADE = "building/upgrade",
  DEAD = "building/dead",
  OVER = "building/over",
  RELOAD = "building/reload",
  REPAIR = "building/repair",
  DAMAGE_1 = "building/damage_1",
  DAMAGE_2 = "building/damage_2",
}

export enum BuildingOutlineState {
  NONE = "NONE",
  FOCUSED = "FOCUSED",
  SELECTED = "SELECTED",
}

export type BuildingGrowthValue = {
  default: number;
  growth: number;
};

export type BuildingParam = {
  label: string;
  value: string | number;
  icon: BuildingIcon;
  attention?: boolean;
};

export type BuildingControl = {
  label: string;
  cost?: number;
  disabled?: boolean;
  onClick: () => void;
};

export type BuildingVariantData = {
  buildDuration?: number;
  positionAtMatrix: Vector2D;
};

export type BuildingBuildData = BuildingVariantData & {
  variant: BuildingVariant;
};

export type BuildingData = BuildingVariantData & {
  variant: BuildingVariant;
  health: number;
  texture: BuildingTexture;
  radius?: BuildingGrowthValue;
  delay?: BuildingGrowthValue;
};

export type BuildingDataPayload = {
  variant: BuildingVariant;
  position: Vector2D;
  health: number;
  upgradeLevel: number;
  ammo?: number;
};
