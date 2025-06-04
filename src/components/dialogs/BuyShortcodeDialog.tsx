import { FC, useState } from "react";

import { useAaStore } from "@/store/aa-store";
import { mapUnitsByOwnerAddressSelector, mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

import { InfoPanel } from "../ui/_info-panel";
import { QRButton } from "../ui/_qr-button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import { getRoads } from "@/engine/utils/getRoads";
import { ICity } from "@/global";
import { generateLink, toLocalString } from "@/lib";
import { getAddressFromNearestRoad } from "@/lib/getAddressCoordinate";

import appConfig from "@/appConfig";

interface IBuyShortcodeDialogProps {
  children: React.ReactNode;
  sellerHouseNum: number;
  shortcode: string;
  price: number;
}

export const BuyShortcodeDialog: FC<IBuyShortcodeDialogProps> = ({ children, price, shortcode, sellerHouseNum }) => {
  const [newOwnerHouseNum, setNewOwnerHouseNum] = useState<string | undefined>(undefined);
  const walletAddress = useSettingsStore((state) => state.walletAddress!);
  const aaState = useAaStore((state) => state);
  const mapUnits = mapUnitsSelector(aaState);
  const { loaded } = aaState;
  const userUnits = useAaStore((state) => mapUnitsByOwnerAddressSelector(state, walletAddress));
  const userHouses = userUnits.filter((u) => u.type === "house");
  const cityStats = aaState.state.city_city as ICity;

  const roads = getRoads(mapUnits, String(cityStats?.mayor));

  const { symbol, decimals, inited, asset } = useSettingsStore();

  const decimalsFactor = 10 ** decimals!;

  const houseHandleChange = (value: string) => {
    setNewOwnerHouseNum(value);
  };

  return (
    <Dialog>
      <DialogTrigger asChild disabled={!inited || !loaded}>
        {children}
      </DialogTrigger>

      <DialogContent className="z-50">
        <DialogHeader>
          <DialogTitle>Buy shortcode {shortcode}</DialogTitle>
          <DialogDescription>
            <p className="text-sm text-muted-foreground">Please choose your house this shortcode will be attached to</p>
          </DialogDescription>
        </DialogHeader>
        {loaded && userHouses.length > 0 ? (
          <div>
            <Select
              onValueChange={houseHandleChange}
              defaultValue={newOwnerHouseNum ? newOwnerHouseNum.toString() : undefined}
              disabled={!inited}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your house" />
              </SelectTrigger>
              <SelectContent>
                {userHouses.map(({ house_num, x, y }) => (
                  <SelectItem key={house_num.toString()} value={house_num.toString()}>
                    {getAddressFromNearestRoad(roads, { x, y }, house_num)?.[0] ?? `House ${house_num}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <InfoPanel className="mt-4">
              <InfoPanel.Item label="Price" loading={!inited}>
                {toLocalString(price / decimalsFactor)} {symbol}
              </InfoPanel.Item>
              <InfoPanel.Item label="Shortcode" loading={!inited}>
                {shortcode}
              </InfoPanel.Item>
            </InfoPanel>
          </div>
        ) : (
          <div className="text-yellow-600">You can’t buy a shortcode without owning a house</div>
        )}
        <QRButton
          href={generateLink({
            asset: asset!,
            amount: price,
            data: {
              seller_house_num: sellerHouseNum,
              my_house_num: Number(newOwnerHouseNum),
              p2p_buy_shortcode: 1,
            },
            from_address: walletAddress!,
            aa: appConfig.AA_ADDRESS,
            is_single: true,
          })}
          disabled={!newOwnerHouseNum || !loaded}
        >
          Buy
        </QRButton>
      </DialogContent>
    </Dialog>
  );
};

