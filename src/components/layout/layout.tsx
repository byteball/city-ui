import { FC } from "react";
import { Outlet } from "react-router";

import { Footer } from "../footer/footer";
import { Header } from "../header/header";
import { Toaster } from "../ui/toaster";

interface ILayoutProps {
  children?: React.ReactNode;
}

export const Layout: FC<ILayoutProps> = () => (
  <div className="min-w-full min-h-full bg-background-dark">
    <Toaster />
    <div className="mb-8">
      <Header />
    </div>

    <div className="container mx-auto sm:px-6 lg:px-8">
      <Outlet />
    </div>

    <Footer />
  </div>
);

