import { FC } from "react";
import { Outlet } from "react-router";

import { Footer } from "../footer/footer";
import { Header } from "../header/header";
import { ScrollToTop } from "../scroll-to-top";
import { Toaster } from "../ui/toaster";

interface ILayoutProps {
  children?: React.ReactNode;
}

export const Layout: FC<ILayoutProps> = () => (
  <div className="relative w-full min-h-full overflow-hidden bg-background-dark">
    <Toaster />
    <ScrollToTop />

    <div className="mb-8 border-b">
      <div className="container mx-auto sm:px-4 lg:px-6">
        <Header />
      </div>
    </div>

    <div className="container w-full mx-auto lg:px-6">
      <Outlet />
    </div>

    <Footer />
  </div>
);

