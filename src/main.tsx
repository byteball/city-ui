import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";

import "./globals.css";

import { AppRouter } from "./AppRouter";
import "./services/obyteWsClient"; // obyte client

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </React.StrictMode>
);

