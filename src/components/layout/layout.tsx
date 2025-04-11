import { FC } from "react";
import { Outlet } from "react-router";

import { useApplyRefData } from "@/hooks/use-apply-ref-data";
import { Footer } from "../footer/footer";
import { Header } from "../header/header";
import { Toaster } from "../ui/toaster";

interface ILayoutProps {
  children?: React.ReactNode;
}

export const Layout: FC<ILayoutProps> = () => {
  useApplyRefData();

  return (
    <div className="min-w-full min-h-full bg-background-dark">
      <Toaster />

      <div className="mb-8 border-b">
        <div className="container mx-auto sm:px-4 lg:px-6">
          <Header />
        </div>
      </div>

      <div className="container mx-auto sm:px-4 lg:px-6">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
};

