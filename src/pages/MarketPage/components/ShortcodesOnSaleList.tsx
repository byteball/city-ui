import { FC, useMemo } from "react";

import { BuyShortcodeDialog } from "@/components/dialogs/BuyShortcodeDialog";
import { QRButton } from "@/components/ui/_qr-button";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAaStore } from "@/store/aa-store";
import { shortcodeSellOrdersSelector } from "@/store/selectors/shortcodeSellOrdersSelector";
import { useSettingsStore } from "@/store/settings-store";

import { generateLink, toLocalString } from "@/lib";

import appConfig from "@/appConfig";

interface IShortcodesOnSaleListProps { }

export const ShortcodesOnSaleList: FC<IShortcodesOnSaleListProps> = () => {
  const walletAddress = useSettingsStore((state) => state.walletAddress);
  const sellOrders = useAaStore(shortcodeSellOrdersSelector);
  const mySellOrders = useMemo(
    () => sellOrders.filter((order) => order.owner === walletAddress),
    [sellOrders, walletAddress]
  );

  const { decimals, symbol } = useSettingsStore((state) => state);

  const decimalsPow = 10 ** (decimals ?? 0);

  if (sellOrders.length === 0) return <div className="text-muted-foreground">No shortcodes for sale</div>;

  return (
    <ScrollArea className="h-full min-h-[400px]" type="always">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="flex justify-between w-full mb-4">
          <TabsTrigger className="w-[50%]" value="all">
            All shortcodes
          </TabsTrigger>

          <TabsTrigger disabled={!walletAddress} className="w-[50%]" value="my">
            My shortcodes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div>
            {sellOrders.map(({ name, price, houseNum, owner }) => (
              <div key={name} className="flex items-center justify-between p-4 mb-2 border rounded-md">
                <div className="font-bold">{name}</div>
                <BuyShortcodeDialog sellerHouseNum={houseNum} shortcode={name} price={price}>
                  <Button disabled={!walletAddress || owner === walletAddress}>
                    Buy for {toLocalString(price / decimalsPow)} {symbol}
                  </Button>
                </BuyShortcodeDialog>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my">
          {mySellOrders.length ? (
            <div>
              {mySellOrders.map(({ name, houseNum }) => (
                <div key={name + houseNum} className="flex items-center justify-between p-4 mb-2 border rounded-md">
                  <div className="font-bold">{name}</div>
                  <QRButton
                    href={generateLink({
                      amount: 10000,
                      data: {
                        house_num: houseNum,
                        edit_house: 1,
                        sell_shortcode: 1,
                        shortcode_price: 0,
                      },
                      from_address: walletAddress!,
                      aa: appConfig.AA_ADDRESS,
                      asset: "base",
                      is_single: true,
                    })}
                  >
                    Withdraw from sale
                  </QRButton>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">You don't sell your shortcodes</div>
          )}
        </TabsContent>
      </Tabs>
    </ScrollArea>
  );
};

