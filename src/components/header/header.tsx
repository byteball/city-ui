import { FC } from "react";
import { Link, NavLink } from "react-router";

import { useSettingsStore } from "@/store/settings-store";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { AddWalletAddress } from "../dialogs/AddWalletAddress";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

interface IHeaderProps {}

const navigation = [
  { name: "Home", href: "/" },
  { name: "Market", href: "/market" },
  { name: "Governance", href: "/governance" },
  { name: "F.A.Q.", href: "/faq" },
];

export const Header: FC<IHeaderProps> = () => {
  const walletAddress = useSettingsStore((state) => state.walletAddress);

  const resetSelectedUnit = (href: string) => {
    console.log("href", href);
    if (href === "/") {
      useSettingsStore.getState().setSelectedMapUnit(null);
    } else if (href === "/market") {
      useSettingsStore.getState().setSelectedMarketPlot(null);
    }
  };

  return (
    <header>
      <nav aria-label="Global" className="flex items-center justify-between md:py-6">
        <div className="flex lg:flex-1">
          <NavLink
            to="/"
            onClick={() => resetSelectedUnit("/")}
            replace
            end
            className="-m-1.5 p-1.5 flex space-x-4 items-center"
          >
            <span className="sr-only">Obyte City</span>
            <img alt="City AA" src="/logo-inv.svg" className="w-auto h-8" />
            <span className="font-semibold text-white text-sm/6">Obyte City</span>
          </NavLink>
        </div>
        <div className="flex lg:hidden">
          <Dialog>
            <DialogTrigger asChild>
              <button type="button" className="inline-flex items-center justify-center p-4 text-gray-400 rounded-md">
                <span className="sr-only">Open main menu</span>
                <Bars3Icon aria-hidden="true" className="size-8" />
              </button>
            </DialogTrigger>

            <DialogContent className="max-w-[300px]">
              <DialogHeader>
                <DialogTitle>Menu</DialogTitle>
              </DialogHeader>

              {navigation.map((item) => (
                <DialogClose asChild key={item.name}>
                  <NavLink
                    to={item.href}
                    onClick={() => resetSelectedUnit(item.href)}
                    className="inline-block px-4 py-2 font-semibold text-white rounded-xl bg-foreground/10 text-sm/6"
                  >
                    {item.name}
                  </NavLink>
                </DialogClose>
              ))}

              <div className="flex flex-col gap-4 mt-8">
                {walletAddress ? (
                  <DialogClose asChild>
                    <NavLink
                      className="inline-block px-4 py-2 font-semibold text-white rounded-xl bg-foreground/10 text-sm/6"
                      to={`/user/${walletAddress}`}
                    >
                      My profile
                    </NavLink>
                  </DialogClose>
                ) : null}

                <AddWalletAddress>
                  <Button variant="default">Add wallet</Button>
                </AddWalletAddress>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              onClick={() => resetSelectedUnit(item.href)}
              to={item.href}
              className="font-semibold text-white text-sm/6"
            >
              {item.name}
            </NavLink>
          ))}
        </div>
        <div className="items-center hidden gap-4 lg:flex lg:flex-1 lg:justify-end">
          {walletAddress ? <Link to={`/user/${walletAddress}`}>My profile</Link> : null}
          <AddWalletAddress>
            <Button variant="default">Add wallet</Button>
          </AddWalletAddress>
        </div>
      </nav>
    </header>
  );
};

