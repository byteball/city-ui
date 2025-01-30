import { useRef } from "react";
import { IRefPhaserGame } from "./game/PhaserGame";

function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    return (
        <div id="app">
            <div className="text-3xl font-bold text-green-500 underline">test</div>
            {/* <PhaserGame ref={phaserRef} /> */}
        </div>
    );
}

export default App;

