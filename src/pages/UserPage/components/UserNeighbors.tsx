import { groupBy } from "lodash";
import { FC, useMemo } from "react";
import { Link } from "react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NeighborContacts } from "./NeighborContacts";

import { useAaStore } from "@/store/aa-store";
import { getUserAttestations } from "@/store/cache-store";
import { mapUnitsByOwnerAddressSelector, mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";

import { getMatches } from "@/lib/getMatches";

import { IHouse } from "@/global";

interface IUserNeighborsProps {
  address: string;
}

export const UserNeighbors: FC<IUserNeighborsProps> = ({ address }) => {
  const userUnits = useAaStore((state) => mapUnitsByOwnerAddressSelector(state, address));
  const aaState = useAaStore((state) => state);
  const matches = useMemo(() => getMatches(aaState), [aaState]);

  const neighborPlots = useMemo(() => userUnits
    .filter((u) => u.type === "house")
    .map((h) => matches.get(h.plot_num))
    .filter((m) => m?.built_ts)
    .map((h) => h?.neighbor_plot),
    [userUnits, matches]);

  const neighborsHouses = useMemo(
    () =>
      groupBy(mapUnitsSelector(aaState).filter(
        (u) => u.type === "house" && neighborPlots.includes(u.plot_num)
      ) as IHouse[], "owner"),
    [neighborPlots, aaState]
  );

  const neighborAddresses = Object.keys(neighborsHouses).sort((a, b) => neighborsHouses[b].length - neighborsHouses[a].length);

  return <div className="mt-8">
    <div className="flex flex-col items-start justify-between md:flex-row">
      <div className="mb-4 md:mb-0">
        <h2 className="text-xl font-semibold">
          Neighbors <span className="text-muted-foreground">({neighborAddresses.length})</span>
        </h2>
      </div>
    </div>

    <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-4 auto-rows-auto">
      {neighborAddresses.map((address) => {
        // @ts-ignore
        const nameField = aaState.state[`user_${address}`]?.name as string | undefined;

        const attestations = getUserAttestations(address)?.map((a) => a.value).sort((a, b) => a.length - b.length);

        const shortestAttestation = attestations ? attestations[0] : null;

        return <Link
          className="flex flex-grow-0 w-full h-full"
          to={`/user/${address}`}
          key={address}
        >
          <Card className="flex flex-col flex-1">
            <CardHeader className="pb-2 space-y-0 ">
              <CardTitle>
                {(!nameField && !shortestAttestation)
                  ? <Skeleton className="w-full h-5" />
                  : <div className="text-sm font-semibold">{nameField ?? shortestAttestation ?? `User ${address.slice(0, 6)}...`}</div>}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <NeighborContacts address={address} />
            </CardContent>
          </Card>
        </Link>
      })}
    </div>
  </div>
}