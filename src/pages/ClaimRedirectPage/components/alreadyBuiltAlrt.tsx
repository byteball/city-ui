import { CheckCircleIcon } from "lucide-react";
import { FC } from "react";

import { getRoads } from "@/engine/utils/getRoads";
import { IHouse, IPlot } from "@/global";
import { IMatch } from "@/lib/getMatches";
import { useAaStore } from "@/store/aa-store";
import { mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";

interface AlreadyBuiltAlertProps {
  plot1_num: number;
  plot2_num: number;
  match: IMatch;
}

export const AlreadyBuiltAlert: FC<AlreadyBuiltAlertProps> = ({ plot1_num, plot2_num, match }) => {
  const aaState = useAaStore((state) => state);
  const mapUnits = mapUnitsSelector(aaState);
  const mayor: string = aaState.state.city_city?.mayor!;
  const roads = getRoads(mapUnits, String(mayor));

  const newPlots = mapUnits.filter((unit) => unit.type === "plot" && match.built_ts === unit.ts) as IPlot[];

  const [house1, house2] = mapUnits.filter((unit) => unit.type === "house" && (unit.plot_num === plot1_num || unit.plot_num === plot2_num)) as IHouse[];

  // const [address1] = getAddressFromNearestRoad(
  //   roads,
  //   {
  //     x: house1.x,
  //     y: house1.y,
  //   },
  //   house1.plot_num
  // );

  // const [address2] = getAddressFromNearestRoad(
  //   roads,
  //   {
  //     x: house2.x,
  //     y: house2.y,
  //   },
  //   house2.plot_num
  // );

  if (!house1 || !house2) {
    return <div className="text-lg text-center min-h-[75vh] mt-10">
      Something wrong, please contact discord support
    </div>;
  }

  // TODO: add map
  return (<div className="text-lg text-center min-h-[75vh] mt-10">
    <CheckCircleIcon className="mx-auto mb-5 w-14 h-14" />

    <h1 className="mb-5 text-4xl font-extrabold tracking-tight scroll-m-20 lg:text-5xl">You have already claimed your rewards</h1>
  </div>)
}