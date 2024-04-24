import Phaser from "phaser";

import { DIFFICULTY } from "@const/world/difficulty";
import { LEVEL_TILE_SIZE } from "@const/world/level";
import { registerAudioAssets, registerSpriteAssets } from "@lib/assets";
import { progressionLinear } from "@lib/difficulty";
import { Level } from "@game/scenes/world/level";
import { IWorld } from "@type/world";
import { EntityType } from "@type/world/entities";
import {
  CrystalTexture,
  CrystalData,
  CrystalAudio,
  ICrystal,
  CrystalDataPayload,
  CrystalEvents,
} from "@type/world/entities/crystal";
import { TileType, Vector2D } from "@type/world/level";
import { ITile } from "@type/world/level/tile-matrix";

export class Crystal
  extends Phaser.GameObjects.Image
  implements ICrystal, ITile
{
  readonly scene: IWorld;

  readonly tileType: TileType = TileType.CRYSTAL;

  readonly positionAtMatrix: Vector2D;

  constructor(scene: IWorld, { positionAtMatrix, variant = 0 }: CrystalData) {
    const tilePosition = { ...positionAtMatrix, z: 1 };
    const positionAtWorld = Level.ToWorldPosition(tilePosition);

    super(
      scene,
      positionAtWorld.x,
      positionAtWorld.y,
      CrystalTexture.CRYSTAL,
      variant
    );
    scene.addEntity(EntityType.CRYSTAL, this);

    this.positionAtMatrix = positionAtMatrix;
    if (this.scene.game.device.os.desktop) {
      this.setInteractive({
        pixelPerfect: true,
      });

      this.handlePointer();
    }

    this.setDepth(Level.GetTileDepth(positionAtWorld.y, tilePosition.z));
    this.setOrigin(0.5, LEVEL_TILE_SIZE.origin);
    this.scene.level.putTile(this, tilePosition);
  }

  public pickup() {
    const resources = this.getResourcesAmount();

    this.scene.player.giveResources(resources);

    this.scene
      .getEntitiesGroup(EntityType.CRYSTAL)
      .emit(CrystalEvents.PICKUP, this, resources);
    this.scene.sound.play(CrystalAudio.PICKUP);
    if (this.scene.game.isPVP) {
      this.scene.game.network.sendCrystalPickupInfo(this.positionAtMatrix);
    }
    this.destroy();
  }

  private getResourcesAmount() {
    const amount = progressionLinear({
      defaultValue: DIFFICULTY.CRYSTAL_RESOURCES,
      scale: DIFFICULTY.CRYSTAL_RESOURCES_GROWTH,
      level: this.scene.wave.number,
    });

    return Phaser.Math.Between(
      amount - Math.floor(amount * 0.25),
      amount + Math.floor(amount * 0.25)
    );
  }

  public getDataPayload(): CrystalDataPayload {
    return {
      position: this.positionAtMatrix,
    };
  }

  private handlePointer() {
    this.on(Phaser.Input.Events.POINTER_OVER, () => {
      this.addShader("OutlineShader", {
        size: 4.0,
        color: 0xffffff,
      });
    });

    this.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.removeShader("OutlineShader");
    });
  }
}

registerAudioAssets(CrystalAudio);
registerSpriteAssets(CrystalTexture, LEVEL_TILE_SIZE);
