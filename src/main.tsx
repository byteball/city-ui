import { NuqsAdapter } from "nuqs/adapters/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";

import { AppRouter } from "./AppRouter";

import checkAppConfig from "./lib/checkAppConfig";

import "./services/obyteWsClient"; // obyte client

import "./globals.css";

checkAppConfig();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <NuqsAdapter>
        <AppRouter />
      </NuqsAdapter>
    </BrowserRouter>
  </React.StrictMode>
);

