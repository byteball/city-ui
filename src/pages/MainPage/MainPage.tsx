import { BuyNewPlotCard, GameCard, SelectedUnitMapCard } from "./components";

export default () => (
  <div className="grid grid-cols-3 gap-8 md:grid-cols-5">
    <div className="col-span-3">
      <GameCard />
    </div>
    <div className="col-span-2">
      <div className="grid grid-cols-1 gap-8">
        <SelectedUnitMapCard />
        <BuyNewPlotCard />
      </div>
    </div>
  </div>
);

