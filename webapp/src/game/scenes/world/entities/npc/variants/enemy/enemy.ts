import Phaser from "phaser";

import { DIFFICULTY } from "@const/world/difficulty";
import {
  ENEMY_PATH_BREAKPOINT,
  ENEMY_TEXTURE_META,
} from "@const/world/entities/enemy";
import { PLAYER_SUPERSKILLS } from "@const/world/entities/player";
import { LEVEL_TILE_SIZE } from "@const/world/level";
import { Building } from "@game/scenes/world/entities/building";
import { NPC } from "@game/scenes/world/entities/npc";
import { registerSpriteAssets } from "@lib/assets";
import { progressionLinear, progressionQuadratic } from "@lib/difficulty";
import { excludePosition } from "@lib/utils";
import { Effect, Particles } from "@game/scenes/world/effects";
import { Level } from "@game/scenes/world/level";
import { GameFlag, GameSettings } from "@type/game";
import { IWorld, WorldEvents } from "@type/world";
import { EffectTexture, ParticlesTexture } from "@type/world/effects";
import { EntityType } from "@type/world/entities";
import { NPCEvent } from "@type/world/entities/npc";
import {
  IEnemyTarget,
  EnemyData,
  EnemyTexture,
  IEnemy,
  EnemyVariant,
} from "@type/world/entities/npc/enemy";
import { PlayerSuperskill } from "@type/world/entities/player";
import { TileType, Vector2D } from "@type/world/level";

export class Enemy extends NPC implements IEnemy {
  readonly variant: EnemyVariant;

  private damage: number;

  private might: number;

  private damageTimer: Nullable<Phaser.Time.TimerEvent> = null;

  private score: number;

  private isOverlapTarget: boolean = false;

  constructor(
    scene: IWorld,
    { positionAtMatrix, texture, variant, score, multipliers }: EnemyData
  ) {
    super(scene, {
      texture,
      positionAtMatrix,
      frameRate: ENEMY_TEXTURE_META[texture].frameRate,
      pathFindTriggerDistance: ENEMY_PATH_BREAKPOINT,
      health: progressionQuadratic({
        defaultValue:
          DIFFICULTY.ENEMY_HEALTH *
          multipliers.health *
          scene.game.getDifficultyMultiplier(),
        scale: DIFFICULTY.ENEMY_HEALTH_GROWTH,
        level: scene.wave.number,
        retardationLevel: DIFFICULTY.ENEMY_HEALTH_GROWTH_RETARDATION_LEVEL,
      }),
      speed: progressionLinear({
        defaultValue: DIFFICULTY.ENEMY_SPEED * multipliers.speed,
        scale: DIFFICULTY.ENEMY_SPEED_GROWTH,
        level: scene.wave.number,
        maxLevel: DIFFICULTY.ENEMY_SPEED_GROWTH_MAX_LEVEL,
      }),
    });
    scene.addEntity(EntityType.ENEMY, this);

    this.damage = progressionQuadratic({
      defaultValue:
        DIFFICULTY.ENEMY_DAMAGE *
        multipliers.damage *
        scene.game.getDifficultyMultiplier(),
      scale: DIFFICULTY.ENEMY_DAMAGE_GROWTH,
      level: scene.wave.number,
    });
    this.variant = variant;
    this.score = score ?? 1;
    this.gamut = ENEMY_TEXTURE_META[texture].size.gamut;
    this.might =
      (multipliers.health + multipliers.damage + multipliers.speed) / 3;

    this.body.setCircle(this.width * 0.5 - 2);
    this.body.setOffset(2, 2);

    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers(texture, {}),
      frameRate: ENEMY_TEXTURE_META[texture].frameRate,
      repeat: -1,
      delay: Math.random() * 500,
    });
    this.anims.play("idle");

    this.addIndicator({
      color: 0xdb2323,
      value: () => this.live.health / this.live.maxHealth,
    });

    this.handlePlayerSuperskill();

    this.setTilesCollision([TileType.BUILDING], (tile) => {
      if (tile instanceof Building) {
        const shield =
          this.scene.player.activeSuperskills[PlayerSuperskill.SHIELD];

        if (!shield) {
          this.attack(tile);
        }
      }
    });

    this.on(NPCEvent.PATH_NOT_FOUND, this.onPathNotFound.bind(this));

    this.on(Phaser.GameObjects.Events.DESTROY, () => {
      if (this.damageTimer) {
        this.damageTimer.destroy();
      }
    });
  }

  public update() {
    super.update();

    if (this.isOverlapTarget) {
      this.setVelocity(0, 0);
    } else if (this.isPathPassed) {
      this.moveTo(this.scene.player.getPositionOnGround());
    }

    this.isOverlapTarget = false;
  }

  public activate() {
    super.activate();

    this.addSpawnEffect();
  }

  public overlapTarget() {
    this.isOverlapTarget = true;
  }

  public attack(target: IEnemyTarget) {
    if (this.isFreezed() || target.live.isDead()) {
      return;
    }

    target.live.damage(this.damage);

    this.freeze(1000);
  }

  private onPathNotFound(originPosition: Vector2D) {
    excludePosition(this.scene.enemySpawnPositions, originPosition);

    const positionAtMatrix = this.scene.getEnemySpawnPosition();
    const position = Level.ToWorldPosition({ ...positionAtMatrix, z: 0 });

    this.setPosition(position.x, position.y);
  }

  public onDead() {
    const experience = progressionQuadratic({
      defaultValue: DIFFICULTY.ENEMY_KILL_EXPERIENCE * this.might,
      scale: DIFFICULTY.ENEMY_KILL_EXPERIENCE_GROWTH,
      level: this.scene.wave.number,
    });

    this.scene.player.giveExperience(experience);
    this.scene.player.giveScore(this.score);
    this.scene.player.incrementKills();

    this.addBloodEffect();

    super.onDead();
  }

  private addOngoingDamage(damage: number, duration: number) {
    const delay = 100;
    const momentDamage = damage / (duration / delay);

    this.damageTimer = this.scene.time.addEvent({
      delay,
      repeat: duration / delay,
      callback: () => {
        this.live.damage(momentDamage);

        if (this.damageTimer?.repeatCount === 0) {
          this.damageTimer.destroy();
          this.damageTimer = null;
        }
      },
    });
  }

  private addFireEffect(duration: number) {
    if (!this.scene.game.isSettingEnabled(GameSettings.EFFECTS)) {
      return;
    }

    new Particles(this, {
      key: "fire",
      texture: ParticlesTexture.GLOW,
      params: {
        follow: this,
        followOffset: this.getBodyOffset(),
        duration,
        color: [0xfacc22, 0xf89800, 0xf83600, 0x9f0404],
        colorEase: "quad.out",
        lifespan: this.displayWidth * 25,
        angle: {
          min: -100,
          max: -80,
        },
        scale: {
          start: (this.displayWidth * 1.25) / 100,
          end: 0,
          ease: "sine.out",
        },
        speed: 80,
        advance: 200,
        blendMode: "ADD",
      },
    });
  }

  private addBloodEffect() {
    if (
      !this.currentBiome?.solid ||
      !this.scene.game.isSettingEnabled(GameSettings.EFFECTS) ||
      this.scene.game.isFlagEnabled(GameFlag.NO_BLOOD)
    ) {
      return;
    }

    const position = this.getPositionOnGround();
    const effect = new Effect(this.scene, {
      texture: EffectTexture.BLOOD,
      position,
      staticFrame: Phaser.Math.Between(0, 3),
      depth: Level.GetDepth(position.y, 0, LEVEL_TILE_SIZE.height * 0.5),
    });

    this.scene.level.effectsOnGround.push(effect);
  }

  private addSpawnEffect() {
    if (this.scene.game.isSettingEnabled(GameSettings.EFFECTS)) {
      new Particles(this, {
        key: "spawn",
        texture: ParticlesTexture.GLOW,
        positionAtWorld: this.body.center,
        params: {
          duration: 400,
          lifespan: { min: 150, max: 250 },
          scale: { start: 0.25, end: 0.0 },
          speed: 100,
          quantity: 2,
          tint: 0x00000,
        },
      });
    }

    const originalScale = this.scale;

    this.freeze(750);
    this.container.setAlpha(0.0);
    this.setScale(0.1);
    this.scene.tweens.add({
      targets: this,
      scale: originalScale,
      duration: 750,
      onComplete: () => {
        this.container.setAlpha(1.0);
      },
    });
  }

  private handlePlayerSuperskill() {
    const handler = (type: PlayerSuperskill) => {
      const { duration } = PLAYER_SUPERSKILLS[type];

      switch (type) {
        case PlayerSuperskill.FROST: {
          this.freeze(duration, true);
          break;
        }
        case PlayerSuperskill.FIRE: {
          this.addFireEffect(duration);
          this.addOngoingDamage(this.live.maxHealth * 0.5, duration);
          break;
        }
      }
    };

    this.scene.events.on(WorldEvents.USE_SUPERSKILL, handler);
    this.on(Phaser.GameObjects.Events.DESTROY, () => {
      this.scene.events.off(WorldEvents.USE_SUPERSKILL, handler);
    });
  }
}

registerSpriteAssets(
  EnemyTexture,
  (texture) => ENEMY_TEXTURE_META[texture].size
);
