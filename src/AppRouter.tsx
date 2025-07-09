import { FC, ReactElement } from "react";
import { Route, Routes } from "react-router";

import { Layout } from "./components/layout/layout";
import { usePageTracking } from "./hooks/use-page-tracking";
import { ClaimRedirectPage, FaqPage, GovernancePage, LeaderboardPage, MainPage, MarketPage, NotFound, UserPage } from "./pages";

interface IAppRouterProps {
  children?: ReactElement;
}

export const AppRouter: FC<IAppRouterProps> = () => {
  usePageTracking();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/user/:address" element={<UserPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/governance" element={<GovernancePage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="/claim/:nums" element={<ClaimRedirectPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
};

