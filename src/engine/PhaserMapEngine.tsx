import { forwardRef, memo, useEffect, useLayoutEffect, useRef } from "react";

import { IEngineOptions } from "@/global";
import { EventBus } from "./EventBus";
import StartMapEngine from "./main";

export interface IRefPhaserMapEngine {
  engine: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface IProps {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
  engineOptions?: IEngineOptions;
}

export const PhaserMapEngine = memo(
  forwardRef<IRefPhaserMapEngine, IProps>(function PhaserMapEngine({ currentActiveScene, engineOptions }, ref) {
    const engine = useRef<Phaser.Game | null>(null!);

    useLayoutEffect(() => {
      if (engine.current === null) {
        engine.current = StartMapEngine("engine-container", engineOptions);

        if (typeof ref === "function") {
          ref({ engine: engine.current, scene: null });
        } else if (ref) {
          ref.current = { engine: engine.current, scene: null };
        }
      }

      return () => {
        if (engine.current) {
          engine.current.destroy(true);
          if (engine.current !== null) {
            engine.current = null;
          }
        }
      };
    }, [ref, engineOptions]);

    useEffect(() => {
      if (engine.current) {
        EventBus.emit("update-engine-options", engineOptions);
      }
    }, [engineOptions]);

    useEffect(() => {
      const callback = (scene: Phaser.Scene) => {
        if (currentActiveScene) {
          currentActiveScene(scene);
        }
      };

      EventBus.on("current-scene-ready", callback);

      return () => {
        EventBus.off("current-scene-ready", callback);
      };
    }, [currentActiveScene]);

    return <div id="engine-container"></div>;
  })
);

PhaserMapEngine.displayName = "PhaserMapEngine";
