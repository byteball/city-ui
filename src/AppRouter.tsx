import { FC, ReactElement } from "react";
import { Route, Routes } from "react-router";

import { Layout } from "./components/layout/layout";
import { ClaimRedirectPage, FaqPage, GovernancePage, MainPage, NotFound, UserPage } from "./pages";

interface IAppRouterProps {
  children?: ReactElement;
}

export const AppRouter: FC<IAppRouterProps> = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<MainPage />} />
      <Route path="/user/:address" element={<UserPage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/gover" element={<GovernancePage />} />
      <Route path="/not-found" element={<NotFound />} />
      <Route path="/claim/:nums" element={<ClaimRedirectPage />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

