import { removeFailure, throwFailure } from "@lib/state";
import { FailureType } from "@type/states";

import pkg from "../package.json";

import { Game } from "./game";

console.clear();
console.log(
  [
    `Created by ${pkg.author.name} / ${pkg.author.url}`,
    `Version ${pkg.version}`,
  ].join("\n")
);

function checkScreenOrientation(event?: MediaQueryListEvent) {
  if (event ? event.matches : window.innerWidth >= window.innerHeight) {
    removeFailure(FailureType.BAD_SCREEN_SIZE);
  } else {
    throwFailure(FailureType.BAD_SCREEN_SIZE);
  }
}

checkScreenOrientation();
window
  .matchMedia("(orientation: landscape)")
  .addEventListener("change", checkScreenOrientation);

const game = new Game();

if (IS_DEV_MODE) {
  window.GAME = game;
}
