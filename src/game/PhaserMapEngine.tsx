import { forwardRef, memo, useEffect, useLayoutEffect, useRef } from "react";

import { IGameOptions } from "@/global";
import { EventBus } from "./EventBus";
import StartMapEngine from "./main";

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface IProps {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
  engineOptions?: IGameOptions;
}

export const PhaserMapEngine = memo(
  forwardRef<IRefPhaserGame, IProps>(function PhaserMapEngine({ currentActiveScene, engineOptions }, ref) {
    const game = useRef<Phaser.Game | null>(null!);

    useLayoutEffect(() => {
      if (game.current === null) {
        game.current = StartMapEngine("game-container", engineOptions);

        if (typeof ref === "function") {
          ref({ game: game.current, scene: null });
        } else if (ref) {
          ref.current = { game: game.current, scene: null };
        }
      }

      return () => {
        if (game.current) {
          game.current.destroy(true);
          if (game.current !== null) {
            game.current = null;
          }
        }
      };
    }, [ref, engineOptions]);

    useEffect(() => {
      EventBus.on("current-scene-ready", (scene_instance: Phaser.Scene) => {
        if (currentActiveScene && typeof currentActiveScene === "function") {
          currentActiveScene(scene_instance);
        }

        if (typeof ref === "function") {
          ref({ game: game.current, scene: scene_instance });
        } else if (ref) {
          ref.current = { game: game.current, scene: scene_instance };
        }
      });
      return () => {
        EventBus.removeListener("current-scene-ready");
      };
    }, [currentActiveScene, ref]);

    useEffect(() => {
      if (game.current) {
        EventBus.emit("update-game-options", engineOptions);
      }
    }, [engineOptions]);

    return <div id="game-container"></div>;
  })
);

PhaserMapEngine.displayName = "PhaserMapEngine";
