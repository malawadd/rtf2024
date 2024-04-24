import Phaser from "phaser";
import { ILive } from "./live";
import { Vector2D, LevelBiome, TileType } from "@type/world/level";
import { IWorld } from "@type/world";
import { EntityType } from "../entities";
import { IParticlesParent } from "@type/world/effects";

export interface ISprite
  extends Phaser.Physics.Arcade.Sprite,
    IParticlesParent {
  readonly scene: IWorld;
  readonly body: Phaser.Physics.Arcade.Body;

  /**
   * Health management.
   */
  readonly live: ILive;

  /**
   * Current position at matrix.
   */
  readonly positionAtMatrix: Vector2D;

  /**
   * Sprite wrapper.
   */
  readonly container: Phaser.GameObjects.Container;

  /**
   * Movement speed.
   */
  speed: number;

  /**
   * Depth of sprite size.
   */
  gamut: number;

  /**
   * Current biome.
   */
  currentBiome: Nullable<LevelBiome>;

  /**
   * Check is body is stopped.
   */
  isStopped(): boolean;

  /**
   * Add collider handler.
   * @param target - Entity type
   * @param callback - Handler
   * @param overlap - Overlap mode
   */
  addCollider(
    target: EntityType,
    mode: "overlap" | "collider",
    callback: (sprite: any) => void
  ): void;

  /**
   * Get all occupied positions by body.
   */
  getAllPositionsAtMatrix(): Vector2D[];

  /**
   * Get position with gamut offset.
   */
  getPositionOnGround(): Vector2D;

  /**
   * Get body offset by position.
   */
  getBodyOffset(): Vector2D;

  /**
   * Set collision for tiles.
   * @param targets - Tile types
   * @param handler - Collision handler
   */
  setTilesCollision(
    targets: TileType[],
    handler: (tile: Phaser.GameObjects.Image) => void
  ): void;

  /**
   * Set state of checking ground collision.
   * @param state - Checking state
   */
  setTilesGroundCollision(state: boolean): void;

  /**
   * Handle tiles collide and return result.
   * @param direction - Rotation in degrees
   */
  handleCollide(direction: number): boolean;

  /**
   * Add indicator above sprite.
   * @param data - Indicator parameters
   */
  addIndicator(data: SpriteIndicatorData): void;
}

export type SpriteData = {
  texture: string;
  positionAtMatrix: Vector2D;
  frame?: number;
  health: number;
  speed: number;
};

export type SpriteIndicatorData = {
  color: number;
  value: () => number;
  size?: number;
};

export type SpriteIndicator = {
  container: Phaser.GameObjects.Container;
  value: () => number;
};
