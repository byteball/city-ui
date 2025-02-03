import { useRef } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";

function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    return (
        <div id="app" className="w-[600px] h-[600px]">
            <PhaserGame ref={phaserRef} />
        </div>
    );
}

export default App;

