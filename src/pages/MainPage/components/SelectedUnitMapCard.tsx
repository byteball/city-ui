import moment from "moment";

import { InfoPanel } from "@/components/ui/_info-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ICoordinates } from "@/global";
import { toLocalString } from "@/lib";
import { useAaStore } from "@/store/aa-store";
import { mapUnitsByCoordinatesSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

import appConfig from "@/appConfig";

export const SelectedUnitMapCard = () => {
  const selectedMapUnitCoordinates = useSettingsStore((state) => state.selectedMapUnit);

  const [selectedMapUnit] = useAaStore((state) => mapUnitsByCoordinatesSelector(state, selectedMapUnitCoordinates as ICoordinates | null));

  const stateLoaded = useAaStore((state) => state.loaded);
  const symbol = useSettingsStore((state) => state.symbol);
  const asset = useSettingsStore((state) => state.asset);
  const decimals = useSettingsStore((state) => state.decimals);
  const inited = useSettingsStore((state) => state.inited);

  const loading = !inited || !stateLoaded || !asset || decimals === null;

  const decimalsPow = 10 ** (decimals ?? 0);

  const formattedTotalAmount = toLocalString(selectedMapUnit?.amount / decimalsPow);

  const owner = selectedMapUnit?.owner;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selected</CardTitle>
        <CardDescription>Click on the house to see all the information about it.</CardDescription>
      </CardHeader>

      {selectedMapUnitCoordinates ? (
        <CardContent>
          <InfoPanel>
            <InfoPanel.Item label="Type" loading={loading}>
              {selectedMapUnit?.type}
            </InfoPanel.Item>

            <InfoPanel.Item label="Amount" loading={loading}>
              {formattedTotalAmount} {symbol}
            </InfoPanel.Item>

            <InfoPanel.Item label="Plot number" loading={loading}>
              {selectedMapUnit?.plot_num}
            </InfoPanel.Item>

            <InfoPanel.Item label="Created at" loading={loading}>
              {moment.unix(selectedMapUnit?.ts).format("YYYY-MM-DD HH:mm")}
            </InfoPanel.Item>

            {selectedMapUnit?.username && (
              <InfoPanel.Item label="Username" loading={loading}>
                {selectedMapUnit?.username}
              </InfoPanel.Item>
            )}

            {loading && <Skeleton className="w-full h-[50px]" />}

            {owner && (
              <InfoPanel.Item label="Owner" loading={loading || !owner}>
                <a
                  className="text-blue-400 block truncate max-w-[150px]"
                  href={`https://${appConfig.TESTNET ? "testnet" : ""}explorer.obyte.org/address/${owner}`}
                >
                  {owner}
                </a>
              </InfoPanel.Item>
            )}
          </InfoPanel>
        </CardContent>
      ) : (
        <CardContent className="text-primary">No plot selected</CardContent>
      )}
    </Card>
  );
};

