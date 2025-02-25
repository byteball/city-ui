import { FC } from "react";
import { NavLink } from "react-router";

import { AddWalletAddress } from "../dialogs/AddWalletAddress";
import { Button } from "../ui/button";

interface IHeaderProps {}

const navigation = [
  { name: "Home", href: "/" },
  { name: "How it works", href: "/how" },
  { name: "Governance", href: "/gover" },
  { name: "F.A.Q.", href: "/faq" },
];

export const Header: FC<IHeaderProps> = () => {
  return (
    <header className="border-b">
      <nav aria-label="Global" className="flex items-center justify-between p-6 mx-auto max-w-7xl lg:px-8">
        <div className="flex lg:flex-1">
          <NavLink to="/" className="-m-1.5 p-1.5 flex space-x-4 items-center">
            <span className="sr-only">Obyte City</span>
            <img alt="City AA" src="/logo-inv.svg" className="w-auto h-8" />
            <span className="font-semibold text-white text-sm/6">Obyte City</span>
          </NavLink>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            // onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
          >
            <span className="sr-only">Open main menu</span>
            {/* <Bars3Icon aria-hidden="true" className="size-6" /> */}
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <NavLink key={item.name} to={item.href} className="font-semibold text-white text-sm/6">
              {item.name}
            </NavLink>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <AddWalletAddress>
            <Button variant="default">Add wallet</Button>
          </AddWalletAddress>
        </div>
      </nav>
    </header>
  );
};

