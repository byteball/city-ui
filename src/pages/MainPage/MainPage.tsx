import { BuyNewPlotCard, GameCard, SelectedUnitMapCard } from "./components";

export default () => (
  <div className="grid gap-6 px-4 md:px-0 md:grid-cols-5">
    <div className="md:col-span-3">
      <GameCard />
    </div>
    <div className="md:col-span-2">
      <div className="grid grid-cols-1 gap-8">
        <SelectedUnitMapCard />
        <BuyNewPlotCard />
      </div>
    </div>
  </div>
);

