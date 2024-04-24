import EventEmitter from "events";

import Phaser from "phaser";

import { WORLD_DEPTH_GRAPHIC } from "@const/world";
import { DIFFICULTY } from "@const/world/difficulty";
import { BUILDINGS } from "@const/world/entities/buildings";
import { LEVEL_TILE_SIZE } from "@const/world/level";
import { getStage, equalPositions } from "@lib/utils";
import { Level } from "@game/scenes/world/level";
import { NoticeType } from "@type/screen";
import { TutorialStep, TutorialStepState } from "@type/tutorial";
import { IWorld } from "@type/world";
import { BuilderEvents, IBuilder } from "@type/world/builder";
import { EntityType } from "@type/world/entities";
import {
  BuildingAudio,
  BuildingBuildData,
  BuildingIcon,
  BuildingVariant,
  IBuilding,
} from "@type/world/entities/building";
import { INPC } from "@type/world/entities/npc";
import { BiomeType, TileType, Vector2D } from "@type/world/level";
import { progressionLinear } from "@lib/difficulty";
import { PlayerSkill } from "@type/world/entities/player";

export class Builder extends EventEmitter implements IBuilder {
  readonly scene: IWorld;

  private _isBuild: boolean = false;

  public get isBuild() {
    return this._isBuild;
  }

  private set isBuild(v) {
    this._isBuild = v;
  }

  public selectedBuilding: Nullable<IBuilding> = null;

  private buildArea: Nullable<Phaser.GameObjects.Ellipse> = null;

  private buildPreview: Nullable<Phaser.GameObjects.Image> = null;

  private buildControls: Nullable<Phaser.GameObjects.Container> = null;

  private buildings: Partial<Record<BuildingVariant, IBuilding[]>> = {};

  private supposedPosition: Nullable<Vector2D> = null;

  private _variant: Nullable<BuildingVariant> = null;

  private lastTapTime: number = 0;

  public get variant() {
    return this._variant;
  }

  private set variant(v) {
    this._variant = v;
  }

  private _radius: number = DIFFICULTY.BUILDER_BUILD_AREA;

  public get radius() {
    return this._radius;
  }

  private set radius(v) {
    this._radius = v;
  }

  constructor(scene: IWorld) {
    super();

    this.scene = scene;

    this.setMaxListeners(0);
    this.handleKeyboard();
    this.handlePointer();
    this.handleTutorial();
  }

  public destroy() {
    this.close();
    this.removeAllListeners();
  }

  public update() {
    if (this.isCanBuild()) {
      if (this.isBuild) {
        this.updateSupposedPosition();
        this.updateBuildAreaPosition();
        this.updateBuildInstance();
      } else {
        if (!this.scene.wave.isGoing) {
          this.open();
        }
      }
    } else if (this.isBuild) {
      this.close();
    }
  }

  public setBuildingVariant(variant: BuildingVariant) {
    if (this.variant === variant || !this.isBuildingAllowByTutorial(variant)) {
      return;
    }

    const BuildingInstance = BUILDINGS[variant];

    if (!this.isBuildingAllowByWave(variant)) {
      this.scene.game.screen.notice(
        NoticeType.ERROR,
        `Will be available on ${BuildingInstance.AllowByWave} wave`
      );

      return;
    }

    this.scene.sound.play(BuildingAudio.SELECT);

    this.variant = variant;

    if (this.buildPreview) {
      this.buildPreview.setTexture(BuildingInstance.Texture);
    }
  }

  public unsetBuildingVariant(force?: boolean) {
    if (this.variant === null) {
      return;
    }

    if (!force) {
      this.scene.sound.play(BuildingAudio.UNSELECT);
    }

    if (this.scene.game.device.os.desktop) {
      this.scene.game.tutorial.complete(TutorialStep.STOP_BUILD);
    }

    this.clearBuildingVariant();
  }

  public addFoundation(position: Vector2D) {
    const newBiome = this.scene.level.getBiome(BiomeType.RUBBLE);

    if (!newBiome) {
      return;
    }

    for (let y = position.y - 1; y <= position.y + 1; y++) {
      for (let x = position.x - 1; x <= position.x + 1; x++) {
        const biome = this.scene.level.map.getAt({ x, y });

        if (biome && biome.solid && biome.type !== BiomeType.RUBBLE) {
          // Replace biome
          const index = Array.isArray(newBiome.tileIndex)
            ? Phaser.Math.Between(...newBiome.tileIndex)
            : newBiome.tileIndex;

          this.scene.level.groundLayer.putTileAt(index, x, y);
          this.scene.level.map.replaceAt({ x, y }, newBiome);

          // Remove scenery
          const tile = this.scene.level.getTileWithType(
            { x, y, z: 1 },
            TileType.SCENERY
          );

          if (tile) {
            tile.destroy();
          }

          // Remove effects
          this.scene.level.effectsOnGround.forEach((effect) => {
            const positionAtMatrix = Level.ToMatrixPosition(effect);

            if (equalPositions(positionAtMatrix, { x, y })) {
              effect.destroy();
            }
          });
        }
      }
    }
  }

  public isBuildingAllowByTutorial(variant: BuildingVariant) {
    if (!this.scene.game.tutorial.isEnabled) {
      return true;
    }

    const links: {
      step: TutorialStep;
      variant: BuildingVariant;
    }[] = [
      {
        step: TutorialStep.BUILD_TOWER_FIRE,
        variant: BuildingVariant.TOWER_FIRE,
      },
      {
        step: TutorialStep.BUILD_STAKING,
        variant: BuildingVariant.STAKING,
      },
    ];

    const current = links.find(
      (link) =>
        this.scene.game.tutorial.state(link.step) ===
        TutorialStepState.IN_PROGRESS
    );

    return !current || current.variant === variant;
  }

  public isBuildingAllowByWave(variant: BuildingVariant) {
    const waveAllowed = BUILDINGS[variant].AllowByWave;

    if (variant === BuildingVariant.STAIR) {
      return (
        !this.scene.game.isPVP &&
        this.scene.wave.number == DIFFICULTY.BUILDING_STAIR_ALLOW_BY_WAVE &&
        this.scene.game.world.isTimePaused()
      );
    }

    if (waveAllowed) {
      return waveAllowed <= this.scene.wave.number;
    }
    return true;
  }

  public getBuildingLimit(variant: BuildingVariant): Nullable<number> {
    if (!BUILDINGS[variant].Limit) {
      return null;
    }

    const start = BUILDINGS[variant].AllowByWave ?? 1;
    const limit = getStage(start, this.scene.wave.number);

    return limit;
  }

  public getBuildingsByVariant<T extends IBuilding>(variant: BuildingVariant) {
    return (this.buildings[variant] ?? []) as T[];
  }

  private open() {
    if (this.isBuild) {
      return;
    }

    this.isBuild = true;

    if (!this.scene.game.device.os.desktop) {
      this.supposedPosition =
        this.scene.level.getFreeAdjacentTile({
          ...this.scene.player.positionAtMatrix,
          z: 1,
        }) ?? this.scene.player.positionAtMatrix;
    }

    this.createBuildArea();
    this.createBuildInstance();

    this.emit(BuilderEvents.BUILD_START);
  }

  public close() {
    if (!this.isBuild) {
      return;
    }

    this.destroyBuildInstance();
    this.destroyBuildArea();

    this.isBuild = false;
    this.supposedPosition = null;

    this.emit(BuilderEvents.BUILD_STOP);
  }

  private clearBuildingVariant() {
    this.close();
    this.variant = null;
  }

  private switchBuildingVariant(index: number) {
    const variant = Object.values(BuildingVariant)[index];

    if (variant) {
      if (this.variant === variant) {
        this.unsetBuildingVariant();
      } else {
        this.setBuildingVariant(variant);
      }
    }
  }

  private isCanBuild() {
    return this.variant !== null && !this.scene.player.live.isDead();
  }

  private isAllowBuild() {
    if (!this.buildArea || !this.supposedPosition) {
      return false;
    }
    if (this.scene.wave.isGoing) {
      return false;
    }
    const positionAtMatrix = this.supposedPosition;
    const positionAtWorld = Level.ToWorldPosition({
      ...positionAtMatrix,
      z: 0,
    });
    const offset = this.buildArea.getTopLeft() as Vector2D;
    const inArea = this.buildArea.geom.contains(
      positionAtWorld.x - offset.x,
      positionAtWorld.y - offset.y
    );

    if (!inArea) {
      return false;
    }

    const biome = this.scene.level.map.getAt(positionAtMatrix);

    if (!biome?.solid) {
      return false;
    }

    const isFreeFromTile = this.scene.level.isFreePoint({
      ...positionAtMatrix,
      z: 1,
    });

    if (!isFreeFromTile) {
      return false;
    }

    let spritePositionsAtMatrix = this.scene.player.getAllPositionsAtMatrix();

    this.scene.getEntities<INPC>(EntityType.NPC).forEach((npc) => {
      spritePositionsAtMatrix = spritePositionsAtMatrix.concat(
        npc.getAllPositionsAtMatrix()
      );
    });

    const isFreeFromSprite = spritePositionsAtMatrix.every(
      (point) => !equalPositions(positionAtMatrix, point)
    );

    if (!isFreeFromSprite) {
      return false;
    }

    return true;
  }

  private build() {
    if (!this.variant || !this.supposedPosition || !this.isAllowBuild()) {
      return;
    }

    const BuildingInstance = BUILDINGS[this.variant];

    if (this.isBuildingLimitReached(this.variant)) {
      this.scene.game.screen.notice(
        NoticeType.ERROR,
        `You have maximum ${BuildingInstance.Name}`
      );

      return;
    }

    if (this.scene.player.resources < BuildingInstance.Cost) {
      this.scene.game.screen.notice(NoticeType.ERROR, "Not enough ethereum");

      return;
    }

    this.createBuilding({
      variant: this.variant,
      positionAtMatrix: this.supposedPosition,
      buildDuration: progressionLinear({
        defaultValue: DIFFICULTY.BUILDER_BUILD_DURATION,
        scale: DIFFICULTY.BUILDER_BUILD_DURATION_GROWTH,
        level: this.scene.player.upgradeLevel[PlayerSkill.BUILD_SPEED],
      }),
    });

    this.scene.player.takeResources(BuildingInstance.Cost);
    this.scene.player.giveExperience(DIFFICULTY.BUILDING_BUILD_EXPERIENCE);

    this.scene.sound.play(BuildingAudio.BUILD);

    if (!this.scene.game.device.os.desktop) {
      this.unsetBuildingVariant(true);
    }
  }

  public createBuilding(data: BuildingBuildData) {
    const BuildingInstance = BUILDINGS[data.variant];
    const building = new BuildingInstance(this.scene, {
      buildDuration: data.buildDuration,
      positionAtMatrix: data.positionAtMatrix,
    });

    let list = this.buildings[data.variant];

    if (list) {
      list.push(building);
    } else {
      list = [building];
      this.buildings[data.variant] = list;
    }

    building.on(Phaser.GameObjects.Events.DESTROY, () => {
      if (list) {
        const index = list.indexOf(building);

        if (index !== -1) {
          list.splice(index, 1);
        }
      }
    });

    return building;
  }

  public isBuildingLimitReached(variant: BuildingVariant) {
    const limit = this.getBuildingLimit(variant);

    if (limit) {
      return this.getBuildingsByVariant(variant).length >= limit;
    }

    return false;
  }

  private createBuildArea() {
    this.buildArea = this.scene.add.ellipse();
    this.buildArea.setStrokeStyle(2, 0xffffff, 0.4);

    this.updateBuildAreaPosition();
    this.updateBuildAreaSize();
  }

  public setBuildAreaRadius(radius: number) {
    this.radius = radius;

    if (this.buildArea) {
      this.updateBuildAreaSize();
    }
  }

  private updateBuildAreaSize() {
    if (!this.buildArea) {
      return;
    }

    this.buildArea.setSize(
      this.radius * 2,
      this.radius * 2 * LEVEL_TILE_SIZE.persperctive
    );
    this.buildArea.updateDisplayOrigin();
    this.buildArea.setDepth(WORLD_DEPTH_GRAPHIC);
  }

  private updateBuildAreaPosition() {
    if (!this.buildArea) {
      return;
    }

    const position = this.scene.player.getPositionOnGround();

    this.buildArea.setPosition(position.x, position.y);
  }

  private destroyBuildArea() {
    if (!this.buildArea) {
      return;
    }

    this.buildArea.destroy();
    this.buildArea = null;
  }

  private createBuildPreview() {
    if (!this.variant) {
      return;
    }

    const BuildingInstance = BUILDINGS[this.variant];

    this.buildPreview = this.scene.add.image(0, 0, BuildingInstance.Texture);
    this.buildPreview.setOrigin(0.5, LEVEL_TILE_SIZE.origin);
    this.buildPreview.addShader("OutlineShader", {
      size: 2.0,
      color: 0xffffff,
    });
  }

  private createBuildControls() {
    this.buildControls = this.scene.add.container(0, 0);

    const confirm = this.scene.add.image(-2, 0, BuildingIcon.CONFIRM);

    confirm.setInteractive();
    confirm.setOrigin(1.0, 0.5);

    confirm.on(
      Phaser.Input.Events.POINTER_DOWN,
      (pointer: Phaser.Input.Pointer) => {
        pointer.reset();
        this.build();
      }
    );

    const decline = this.scene.add.image(2, 0, BuildingIcon.DECLINE);

    decline.setInteractive();
    decline.setOrigin(0.0, 0.5);

    decline.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.unsetBuildingVariant();
    });

    this.buildControls.add([confirm, decline]);
  }

  private createBuildInstance() {
    this.createBuildPreview();

    if (!this.scene.game.device.os.desktop) {
      this.createBuildControls();
    }

    this.updateBuildInstance();
  }

  private updateBuildInstance() {
    if (!this.supposedPosition) {
      return;
    }

    const tilePosition = { ...this.supposedPosition, z: 1 };
    const positionAtWorld = Level.ToWorldPosition(tilePosition);
    const depth = Level.GetTileDepth(positionAtWorld.y, tilePosition.z) + 1;
    const isAllow = this.isAllowBuild();

    if (this.buildPreview) {
      this.buildPreview.setPosition(positionAtWorld.x, positionAtWorld.y);
      this.buildPreview.setDepth(depth);
      this.buildPreview.setAlpha(isAllow ? 1.0 : 0.25);
    }

    if (this.buildControls) {
      const confirmBtton = <Phaser.GameObjects.Image>(
        this.buildControls.getAt(0)
      );

      this.buildControls.setPosition(
        positionAtWorld.x,
        positionAtWorld.y + LEVEL_TILE_SIZE.height
      );
      this.buildControls.setDepth(WORLD_DEPTH_GRAPHIC);
      confirmBtton.setTexture(
        isAllow ? BuildingIcon.CONFIRM : BuildingIcon.CONFIRM_DISABLED
      );
    }
  }

  private destroyBuildInstance() {
    if (this.buildPreview) {
      this.buildPreview.destroy();
      this.buildPreview = null;
    }

    if (this.buildControls) {
      this.buildControls.destroy();
      this.buildControls = null;
    }
  }

  private getCurrentPointer() {
    const busyPointerId = this.scene.game.screen.joystickActivePointer?.id;

    return busyPointerId === 1
      ? this.scene.input.pointer2
      : this.scene.input.pointer1;
  }

  private updateSupposedPosition() {
    let position: Vector2D;

    if (this.scene.game.device.os.desktop) {
      position = {
        x: this.scene.input.activePointer.worldX,
        y: this.scene.input.activePointer.worldY,
      };
    } else {
      const pointer = this.getCurrentPointer();

      if (!pointer.active || pointer.event.target !== this.scene.sys.canvas) {
        return;
      }

      pointer.updateWorldPoint(this.scene.cameras.main);

      position = {
        x: pointer.worldX,
        y:
          pointer.worldY -
          LEVEL_TILE_SIZE.height / this.scene.cameras.main.zoom,
      };
    }

    this.supposedPosition = Level.ToMatrixPosition(position);
  }

  public removeAllBuildings() {
    for (const variant in this.buildings) {
      const buildingsList = this.buildings[variant as BuildingVariant];

      buildingsList?.forEach((building) => {
        building.destroy();
      });

      this.buildings[variant as BuildingVariant] = [];
      this.removeAllListeners(variant);
    }
  }

  private handleKeyboard() {
    this.scene.input.keyboard?.on(
      Phaser.Input.Keyboard.Events.ANY_KEY_UP,
      (event: KeyboardEvent) => {
        if (this.scene.game.world.wave.isGoing) {
          return;
        }
        if (Number(event.key)) {
          this.switchBuildingVariant(Number(event.key) - 1);
        }
      }
    );
  }

  private handlePointer() {
    if (!this.scene.game.device.os.desktop) {
      return;
    }

    this.scene.input.on(
      Phaser.Input.Events.POINTER_UP,
      (pointer: Phaser.Input.Pointer) => {
        if (!this.isBuild) {
          return;
        }

        if (pointer.button === 0) {
          this.build();
        } else if (pointer.button === 2) {
          this.unsetBuildingVariant();
        }
      }
    );
  }

  private handleTutorial() {
    this.scene.game.tutorial.bind(TutorialStep.BUILD_TOWER_FIRE, {
      beg: () => {
        this.scene.setTimePause(true);
      },
      end: () => {
        this.scene.setTimePause(false);
        this.clearBuildingVariant();
      },
    });

    this.scene.game.tutorial.bind(TutorialStep.BUILD_STAKING, {
      beg: () => {
        this.scene.setTimePause(true);
      },
      end: () => {
        this.scene.setTimePause(false);
      },
    });

    this.scene.game.screen.events.on(Phaser.Interface.Events.MOUNT, () => {
      this.scene.game.tutorial.start(TutorialStep.BUILD_TOWER_FIRE);
    });
  }
}
