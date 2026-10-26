import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import App from "./App";
import { theme } from "./theme/theme";
import "./index.css";
import "./App.css";

const printStyle = document.createElement("style");
printStyle.textContent = `
@page {
  margin: 10mm 10mm 20mm 10mm;
  @top-center { content: none; }
  @bottom-center {
    content: "Page " counter(page) " of " counter(pages);
    font-size: 11px;
    color: #333;
  }
}
@media print {
  html, body { margin: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;
document.head.appendChild(printStyle);

import "dayjs/locale/en-gb";

dayjs.locale("en-gb");
dayjs.extend(customParseFormat);
// ============================================================
// Global print CSS — no top header, "Page X of Y" in the footer
// ============================================================
const globalPrintStyle = `
  @page {
    margin: 10mm 10mm 20mm 10mm;

    /* Suppress the browser's built-in top header text
       ("10/5/26, 3:51 PM ... page title") where supported. */
    @top-center {
      content: none;
    }

    /* Page X of Y at the bottom of every page (supported by
       paged-media engines; browsers that don't support @page
       margin boxes simply ignore it). */
    @bottom-center {
      content: "Page " counter(page) " of " counter(pages);
      font-size: 11px;
      font-family: "Source Sans 3", sans-serif;
      color: #333;
    }
  }

  @media print {
    html,
    body {
      margin: 0 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`;
const renderApp = (container, route) => {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <style>{globalPrintStyle}</style>
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale="en-gb"
          dateFormats={{
            monthAndYear: "MM/YYYY",
            year: "YYYY",
            normalDate: "DD/MM/YYYY",
            shortDate: "DD/MM/YYYY",
            month: "MMMM",
          }}
        >
          <HashRouter>
            <App route={route} />
          </HashRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </React.StrictMode>,
  );
};

class WebComponent extends HTMLElement {
  constructor() {
    super();
    this._root = null;
    this._rootCreated = false;
  }

  connectedCallback() {
    if (this._rootCreated) {
      return;
    }

    try {
      this._rootCreated = true;
      const route = this.getAttribute("route") || "/";
      renderApp(this, route);
    } catch (error) {
      console.error("Error rendering Complaint Web Component:", error);
      this.innerHTML = `<div style="color: red; padding: 20px;">Error loading complaint form: ${error.message}</div>`;
    }
  }

  disconnectedCallback() {
    if (this._root) {
      this._root.unmount();
      this._rootCreated = false;
    }
  }
}

const ELEMENT_NAME = "my-space";
// const ELEMENT_NAME = "my-spaceform";

const isDevelopment = import.meta.env.DEV;

if (isDevelopment) {
  let rootElement = document.getElementById("root");
  if (!rootElement) {
    rootElement = document.createElement("div");
    rootElement.id = "root";
    document.body.appendChild(rootElement);
  }

  rootElement.innerHTML = "";

  renderApp(rootElement, "/my-space");
  // renderApp(rootElement, "/my-spaceform");
} else {
  if (!customElements.get(ELEMENT_NAME)) {
    customElements.define(ELEMENT_NAME, WebComponent);
  }
}
