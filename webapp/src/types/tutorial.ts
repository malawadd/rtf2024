import EventEmitter from "events";

export interface ITutorial extends EventEmitter {
  /**
   * State of enable.
   */
  readonly isEnabled: boolean;

  /**
   * Steps states.
   */
  progress: Partial<Record<TutorialStep, TutorialStepState>>;

  /**
   * Remove all listeners and reset states.
   */
  reset(): void;

  /**
   * Enable tutorial.
   */
  enable(): void;

  /**
   * Disable tutorial.
   */
  disable(): void;

  /**
   * Start tutorial step.
   * @param step - Step
   */
  start(step: TutorialStep): void;

  /**
   * Pause tutorial step.
   * @param step - Step
   */
  pause(step: TutorialStep): void;

  /**
   * Complete tutorial step.
   * @param step - Step
   */
  complete(step: TutorialStep): void;

  /**
   * Check step state.
   * @param step - Step
   */
  state(step: TutorialStep): TutorialStepState;

  /**
   * Bind callbacks on tutorial step progress.
   * @param step - Step to bind
   * @param callback - Callbacks functions
   */
  bind(step: TutorialStep, callbacks: TutorialBindCallbacks): () => void;

  /**
   * Bind callbacks on tutorial any progress.
   * @param callback - Callbacks functions
   */
  bindAll(
    callbacks: TutorialBindAllCallbacks | AttackerTutorialBindAllCallbacks
  ): () => void;
}
export type TutorialBindCallbacks = {
  beg?: () => void;
  end?: () => void;
};

export type TutorialBindAllCallbacks = {
  beg?: (step: TutorialStep) => void;
  end?: (step: TutorialStep) => void;
};

export enum TutorialStep {
  STOP_BUILD = "STOP_BUILD",
  BUILD_TOWER_FIRE = "BUILD_TOWER_FIRE",
  BUILD_AMMUNITION = "BUILD_AMMUNITION",
  BUILD_STAKING = "BUILD_STAKING",
  BUILD_RADAR = "BUILD_RADAR",
  BUY_AMMO = "BUY_AMMO",
  BUILD_STAIR = "BUILD_STAIR",
  UPGRADE_BUILDING = "UPGRADE_BUILDING",
  RELOAD_TOWER = "RELOAD_TOWER",
  UPGRADE_SKILL = "UPGRADE_SKILL",
  RESOURCES = "RESOURCES",
}

export enum TutorialStepState {
  IDLE = "IDLE",
  IN_PROGRESS = "IN_PROGRESS",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
}

export enum TutorialEvents {
  BEG = "beg",
  END = "end",
}

export type AttackerTutorialBindAllCallbacks = {
  beg?: (step: AttackerTutorialStep) => void;
  end?: (step: AttackerTutorialStep) => void;
};

export enum AttackerTutorialStep {
  REDCANDLE = "REDCANDLE",
  SONICBAT = "SONICBAT",
  NOUNSVEHICLE = "NOUNSVEHICLE",
  GREENCANDLE = "GREENCANDLE",
  GNOSISTRUCK = "GNOSISTRUCK",
  BOSS = "BOSS",
  AAVEDJ = "AAVEDJ",
  GITCOINFIGHTER = "GITCOINFIGHTER",
  BEARMONSTER = "BEARMONSTER",
}
