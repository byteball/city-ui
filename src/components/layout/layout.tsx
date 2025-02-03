import { FC } from "react";
import { Outlet } from "react-router";

import { Footer } from "../footer/footer";
import { Header } from "../header/header";
import { ThemeProvider } from "../theme-provider";

interface ILayoutProps {
  children?: React.ReactNode;
}

export const Layout: FC<ILayoutProps> = () => {
  return (
    <ThemeProvider>
      <div className="min-w-full min-h-full bg-background-dark">
        <div className="mb-8">
          <Header />
        </div>

        <div className="container mx-auto sm:px-6 lg:px-8">
          <Outlet />
        </div>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

