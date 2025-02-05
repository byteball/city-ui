import { FC, ReactElement } from "react";
import { Route, Routes } from "react-router";

import { Layout } from "./components/layout/layout";
import MainPage from "./pages/MainPage";

interface IAppRouterProps {
  children?: ReactElement;
}

export const AppRouter: FC<IAppRouterProps> = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<MainPage />} />
    </Route>
  </Routes>
);

