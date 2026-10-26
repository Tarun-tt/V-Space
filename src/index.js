import React from "react";
import "./index.css";
import App from "./App";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

class WebComponent extends HTMLElement {
  connectedCallback() {
    if (this._rootCreated) {
      return;
    }
    this._rootCreated = true;
    const root = createRoot(this);
    root.render(
      <HashRouter>
        <App route={this.getAttribute("route") || "/"} />
      </HashRouter>,
    );
  }
}
const ELEMENT_NAME = "my-space";
// const ELEMENT_NAME = "my-spaceform";

if (!customElements.get(ELEMENT_NAME)) {
  customElements.define(ELEMENT_NAME, WebComponent);
}
