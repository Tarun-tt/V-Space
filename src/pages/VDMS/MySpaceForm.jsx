import React, {
  useState,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
  useMemo,
  useContext,
  memo,
} from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  RadioGroup,
  Radio,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import {
  CustomAutocomplete,
  CustomTextField,
  RichTextEditor,
  useToast,
} from "../../components/common";
import { boiBorder, boiTableHeaderBg } from "../../theme/theme";
import {
  BANKING_ARRANGEMENT_OPTS,
  CONSTITUTION_OPTS,
  NATURE_OF_ACTIVITY_OPTS,
  getIdentifiedPersonTemplate,
  getPromoterTemplate,
  getSanctionAuthTemplate,
  getOtherLoanTemplate,
  getConnectedAccountTemplate,
  getGuarantorTemplate,
  getPrimarySecurityTemplate,
  getCollateralSecurityTemplate,
} from "./MySpace";

// ======================= CONSTANTS =======================
const DATE_FORMAT = "DD/MM/YYYY";
const yesNoOptions = ["Yes", "No"];
const yesNoNAOptions = ["Yes", "No", "N/A"];

// ======================= STYLE TOKENS (shared with FSP & VettingForm) =======================
const labelCell = {
  width: "30%",
  bgcolor: boiTableHeaderBg,
  fontWeight: 700,
  fontSize: 13,
  border: `1px solid ${boiBorder}`,
  verticalAlign: "top",
  padding: "8px 12px",
  fontFamily: "Arial",
};

const valueCell = {
  border: `1px solid ${boiBorder}`,
  p: 0,
  padding: 0,
  verticalAlign: "top",
};

const valueTextView = {
  border: `1px solid ${boiBorder}`,
  padding: "8px 12px",
  fontSize: 13,
  verticalAlign: "top",
  fontFamily: "Arial",
};

const gridHeadCell = {
  fontWeight: 700,
  fontSize: 12.5,
  border: `1px solid ${boiBorder}`,
  bgcolor: boiTableHeaderBg,
  padding: "8px 10px",
  fontFamily: "Arial",
};

const gridCell = {
  fontSize: 13,
  border: `1px solid ${boiBorder}`,
  padding: "6px 8px",
  verticalAlign: "top",
  fontFamily: "Arial",
};

// Styles for RichTextEditor read-only output (matching VettingForm exactly)
const rteReadonlyStyle = `
  .rte-readonly-content {
    font-size: 13px;
    line-height: 1.65;
    color: #1c2530;
    word-wrap: break-word;
    overflow-wrap: break-word;
    overflow: visible;
  }
  .rte-readonly-content p { margin: 0.5em 0; }
  .rte-readonly-content p:empty { display: none; }
  .rte-readonly-content p > br:only-child {
    line-height: 0; font-size: 0; margin: 0; padding: 0; display: block; height: 0;
  }
  .rte-readonly-content h1 { font-size: 2em; font-weight: 700; margin: 0.5em 0; line-height: 1.2; }
  .rte-readonly-content h2 { font-size: 1.7em; font-weight: 700; margin: 0.5em 0; line-height: 1.2; }
  .rte-readonly-content h3 { font-size: 1.45em; font-weight: 600; margin: 0.5em 0; line-height: 1.3; }
  .rte-readonly-content h4 { font-size: 1.2em; font-weight: 600; margin: 0.5em 0; line-height: 1.3; }
  .rte-readonly-content h5 { font-size: 1.08em; font-weight: 600; margin: 0.5em 0; line-height: 1.4; }
  .rte-readonly-content h6 { font-size: 1em; font-weight: 600; margin: 0.5em 0; line-height: 1.4; }
  .rte-readonly-content ul, .rte-readonly-content ol { margin: 0.5em 0; padding-left: 1.7em; }
  .rte-readonly-content li { margin: 0.25em 0; }
  .rte-readonly-content a { color: #007DC5; text-decoration: underline; }
  .rte-readonly-content mark { background-color: #ffe066; color: inherit; border-radius: 2px; padding: 0 1px; }
  .rte-readonly-content hr { border: none; border-top: 2px solid #dde3e8; margin: 1.4em 0; }
  .rte-readonly-content img { max-width: 100%; height: auto; display: block; margin: 1em 0; border-radius: 6px; }
  .rte-readonly-content blockquote {
    margin: 1em 0; padding: 10px 16px; border-left: 4px solid #007DC5;
    background-color: #f8f9fb; font-style: italic; border-radius: 0 6px 6px 0;
  }
  .rte-readonly-content pre {
    margin: 1em 0; padding: 12px 16px; background-color: #f1f4f7;
    border: 1px solid #dde3e8; border-radius: 6px; overflow-x: auto;
    font-family: "SFMono-Regular", Consolas, "Courier New", monospace;
    font-size: 13.5px; line-height: 1.5;
  }
  .rte-readonly-content code {
    background-color: #f1f4f7; padding: 2px 6px; border-radius: 4px;
    font-family: "SFMono-Regular", Consolas, "Courier New", monospace;
    font-size: 13px;
  }

  /* ------- Table wrapper: kill extra spacing after table ------- */
  .rte-readonly-content .rte-table-wrapper {
    margin: 0.5em 0 !important;
    display: block;
    overflow: visible !important;
    width: 100% !important;
    padding: 0;
    box-sizing: border-box;
  }
  .rte-readonly-content .rte-table-wrapper table {
    border-collapse: collapse !important;
    width: 100% !important;
    margin: 0 !important;
    border: 1px solid #000000 !important;
    table-layout: auto;
  }
  .rte-readonly-content .rte-table-wrapper table td,
  .rte-readonly-content .rte-table-wrapper table th {
    border: 1px solid #000000 !important;
    padding: 6px 10px;
    text-align: left;
    vertical-align: top;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  .rte-readonly-content .rte-table-wrapper table th {
    background-color: #f8f9fb;
    font-weight: 600;
  }

  /* Collapse the empty <p><br></p> that the editor leaves after a table */
  .rte-readonly-content .rte-table-wrapper + p { margin-top: 0.25em; }
  .rte-readonly-content .rte-table-wrapper + p:empty { display: none; }
  .rte-readonly-content .rte-table-wrapper + p > br:only-child { display: none; }
  .rte-readonly-content .rte-table-wrapper + p:has(> br:only-child) { display: none; }

  /* Defensive: hide resize handles if any leaked through the sanitizer */
  .rte-readonly-content .rte-table-resize-handle,
  .rte-readonly-content .rte-table-resize-handle-left,
  .rte-readonly-content .rte-table-resize-handle-bottom { display: none !important; }
`;

// ======================= UTILITIES =======================
const disableFutureDates = (date) => dayjs(date).isAfter(dayjs(), "day");

const toDayjs = (value) => {
  if (!value) return null;
  if (dayjs.isDayjs(value)) return value;
  const parsedFmt = dayjs(value, DATE_FORMAT);
  if (parsedFmt.isValid()) return parsedFmt;
  return dayjs(value);
};

const formatDate = (value) => {
  if (!value) return "";
  const d = dayjs(value);
  return d.isValid() ? d.format(DATE_FORMAT) : value;
};
const calcTotal = (vals) => {
  let sum = 0;
  let hasAny = false;
  vals.forEach((raw) => {
    if (raw === undefined || raw === null || raw === "") return;
    const n = parseFloat(raw);
    if (!isNaN(n)) {
      sum += n;
      hasAny = true;
    }
  });
  return hasAny ? String(sum) : "";
};
const safeVal = (e) => {
  if (e == null) return "";
  if (typeof e === "string" || typeof e === "number") return String(e);
  if (e?.target !== undefined) return e.target?.value ?? "";
  return "";
};

const fixRteTableBorders = (html) => {
  if (!html || typeof html !== "string") return html || "-";
  return html
    .replace(
      /<table(\b[^>]*)>/gi,
      (_, attrs) =>
        `<table${attrs} style="border-collapse:collapse;border:1px solid #000000;width:100%;table-layout:auto;word-wrap:break-word;">`,
    )
    .replace(
      /<(td|th)(\b[^>]*)>/gi,
      (_, tag, attrs) =>
        `<${tag}${attrs} style="border:1px solid #000000;padding:6px 8px;word-wrap:break-word;word-break:break-word;">`,
    );
};

// ======================= PRINT DOM HELPER (ported from VettingForm) =======================
function printDomNode(node) {
  if (!node) return;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(
    "<!DOCTYPE html><html><head><title></title></head><body></body></html>",
  );
  doc.close();

  document
    .querySelectorAll('style, link[rel="stylesheet"]')
    .forEach((styleNode) => {
      doc.head.appendChild(styleNode.cloneNode(true));
    });

  const resetStyle = doc.createElement("style");
  resetStyle.textContent = `
    @page {
      size: A4 portrait;
 
        margin: 4mm 12mm 20mm 12mm;



    /* Footer (bottom margin area) with page numbers */
    @bottom-center {
      content: "Page " counter(page) " of " counter(pages);
      font-size: 10px;
      font-family: Arial, sans-serif;
      color: #333;
    }
      
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    body {
          // padding: 10mm 8mm 12mm 8mm;
            padding: 12mm 8mm 0 8mm;
      box-sizing: border-box;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    button, .MuiIconButton-root, .print-hide, .no-print, .no-print-action-cell {
      display: none !important;
    }
    .MuiAutocomplete-endAdornment {
      display: none !important;
    }
    table {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
      border-collapse: collapse !important;
      page-break-inside: auto !important;
    }
    tr {
      page-break-inside: avoid !important;
    }
    td, th {
      word-break: break-word !important;
      overflow-wrap: break-word !important;
    }
          /* ---------- Global print spacing for headings & tables ---------- */
    /* Every table gets breathing room above and below */
    table {
      margin-top: 10px !important;
      margin-bottom: 14px !important;
    }

    /* Typography headings (section titles, sub headings, plain text) */
    .MuiTypography-root {
      margin-top: 8px !important;
      margin-bottom: 8px !important;
    }

    /* Bold section titles inside tables (thead/th and styled divs) */
    th {
      padding-top: 8px !important;
      padding-bottom: 8px !important;
    }

    /* Numbered headings rendered as raw <p> or <div> outside MUI Typography */
    p {
      margin-top: 6px !important;
      margin-bottom: 6px !important;
    }

    /* Make sure consecutive tables have a visible gap */
    table + table {
      margin-top: 14px !important;
    }

    /* Keep headings from being glued to following tables */
    .MuiTypography-root + table {
      margin-top: 12px !important;
    }

    /* RTE blocks also get spacing */
    .rte-readonly-content {
      margin-top: 8px !important;
      margin-bottom: 14px !important;
    }

    /* Sub headings inside RTE (h1–h6) */
    .rte-readonly-content h1,
    .rte-readonly-content h2,
    .rte-readonly-content h3,
    .rte-readonly-content h4,
    .rte-readonly-content h5,
    .rte-readonly-content h6 {
      margin-top: 10px !important;
      margin-bottom: 6px !important;
    }
    .MuiBox-root {
      overflow: visible !important;
    }
    .MuiInputBase-root,
    .MuiOutlinedInput-root,
    .MuiTextField-root,
    .MuiInputBase-root fieldset,
    .MuiOutlinedInput-notchedOutline {
      border: none !important;
      border-color: transparent !important;
      box-shadow: none !important;
      background: transparent !important;
    }
    .MuiInputBase-input {
      padding: 4px 0 !important;
      font-size: 13px !important;
      font-family: Arial !important;
    }
    .MuiInputBase-input::placeholder,
    input::placeholder,
    textarea::placeholder {
      color: transparent !important;
      opacity: 0 !important;
    }
    .MuiInputLabel-root,
    .MuiFormLabel-root {
      display: none !important;
    }
    .abbff-part-banner {
      page-break-before: always !important;
      break-before: page !important;
    }
    .abbff-part-banner:first-of-type {
      page-break-before: auto !important;
      break-before: auto !important;
    }
    /* Preserve RTE table borders in print */
    .rte-editor table, .rte-readonly-content table {
      border-collapse: collapse !important;
      border: 1px solid #000000 !important;
      width: 100% !important;
    }
    .rte-editor table td, .rte-editor table th,
    .rte-readonly-content table td, .rte-readonly-content table th {
      border: 1px solid #000000 !important;
      padding: 6px 8px !important;
    }
    .rte-editor table *, .rte-readonly-content table * {
      border-color: #000000 !important;
    }
    /* RTE table wrappers: keep resized width, cap at parent cell width */
    .rte-readonly-content .rte-table-wrapper {
      display: block !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
      max-width: 100% !important;
    }
    .rte-readonly-content .rte-table-wrapper table {
      width: 100% !important;
      max-width: 100% !important;
    }
    td:has(.rte-readonly-content),
    th:has(.rte-readonly-content) {
      overflow: hidden !important;
    }
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      .print-page-break, .abbff-part-banner {
        page-break-before: always !important;
        break-before: page !important;
      }
      .abbff-part-banner:first-of-type {
        page-break-before: auto !important;
        break-before: auto !important;
      }
      /* Preserve RTE table borders in @media print */
      .rte-editor table, .rte-readonly-content table {
        border-collapse: collapse !important;
        border: 1px solid #000000 !important;
      }
      table {
        min-width: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
        table-layout: fixed !important;
      }
              /* Re-assert print spacing so they survive @media print cascade */
      table {
        margin-top: 10px !important;
        margin-bottom: 14px !important;
      }
      .MuiTypography-root {
        margin-top: 8px !important;
        margin-bottom: 8px !important;
      }
      p {
        margin-top: 6px !important;
        margin-bottom: 6px !important;
      }
      .rte-readonly-content {
        margin-top: 8px !important;
        margin-bottom: 14px !important;
      }
      .rte-editor table td, .rte-editor table th,
      .rte-readonly-content table td, .rte-readonly-content table th {
        border: 1px solid #000000 !important;
        padding: 4px 6px !important;
      }
     .rte-readonly-content {
    max-width: 100% !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
  }
  .rte-readonly-content .rte-table-wrapper {
    display: block !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
    max-width: 100% !important;
    width: 100% !important;
    margin-left: 0 !important;
  }
  .rte-readonly-content .rte-table-wrapper table {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    table-layout: fixed !important;
  }
  td:has(.rte-readonly-content),
  th:has(.rte-readonly-content) {
    overflow: hidden !important;
  }
   
    }
  `;
  doc.head.appendChild(resetStyle);

  const preserveStyles = (sourceNode, clonedNode) => {
    if (sourceNode.nodeType !== 1) return;
    const tagName = sourceNode.tagName?.toLowerCase();

    if (tagName === "fieldset" || tagName === "legend") {
      clonedNode.style.border = "none";
      clonedNode.style.borderWidth = "0";
      clonedNode.style.padding = "0";
      clonedNode.style.margin = "0";
      if (tagName === "legend") {
        clonedNode.style.display = "none";
      }
    }
    if (tagName === "input" || tagName === "textarea") {
      clonedNode.style.border = "none";
      clonedNode.style.outline = "none";
      clonedNode.style.background = "transparent";
      clonedNode.style.padding = "4px 0";
      clonedNode.style.fontSize = "13px";
      clonedNode.style.fontFamily = "Arial";
      clonedNode.style.resize = "none";
      clonedNode.style.overflow = "visible";
      clonedNode.style.height = "auto";
      clonedNode.setAttribute("placeholder", "");
    }
    if (sourceNode.classList) {
      const cl = sourceNode.classList;
      if (
        cl.contains("MuiInputBase-root") ||
        cl.contains("MuiOutlinedInput-root") ||
        cl.contains("MuiTextField-root")
      ) {
        clonedNode.style.border = "none";
        clonedNode.style.borderColor = "transparent";
        clonedNode.style.boxShadow = "none";
        clonedNode.style.background = "transparent";
      }
      if (cl.contains("MuiOutlinedInput-notchedOutline")) {
        clonedNode.style.border = "none";
        clonedNode.style.borderWidth = "0";
      }
      if (
        cl.contains("MuiInputLabel-root") ||
        cl.contains("MuiFormLabel-root")
      ) {
        clonedNode.style.display = "none";
      }
      // Fix RTE readonly wrapper: reset any offset/margin that causes left-cut
      if (cl.contains("rte-readonly-content")) {
        clonedNode.style.margin = "0";
        clonedNode.style.marginLeft = "0";
        clonedNode.style.padding = "0";
        clonedNode.style.position = "static";
        clonedNode.style.left = "auto";
        clonedNode.style.transform = "none";
        clonedNode.style.width = "100%";
        clonedNode.style.maxWidth = "100%";
        clonedNode.style.boxSizing = "border-box";
        clonedNode.style.overflow = "visible";
        clonedNode.style.border = "none";
        return;
      }
      if (cl.contains("rte-table-wrapper")) {
        // Preserve resize dimensions — do NOT reset here; handled after importNode
        clonedNode.style.overflow = "visible";
        return;
      }
    }

    const computed = window.getComputedStyle(sourceNode);
    const display = computed.display;
    const textAlign = computed.textAlign;
    const justifyContent = computed.justifyContent;
    const flexWrap = computed.flexWrap;
    const flexDirection = computed.flexDirection;
    const alignItems = computed.alignItems;
    const gap = computed.gap;
    const fontWeight = computed.fontWeight; // <-- NEW
    const fontSize = computed.fontSize;

    if (display === "flex" || display === "inline-flex") {
      clonedNode.style.display = display;
      clonedNode.style.flexWrap = flexWrap;
      clonedNode.style.flexDirection = flexDirection;
      clonedNode.style.alignItems = alignItems;
      clonedNode.style.justifyContent = justifyContent;
      if (gap && gap !== "normal") clonedNode.style.gap = gap;
    } else if (display === "inline-block") {
      clonedNode.style.display = "inline-block";
    }
    if (textAlign === "center") {
      clonedNode.style.textAlign = "center";
    }
    if (fontWeight) {
      clonedNode.style.fontWeight = fontWeight;
    }
    // Preserve font size so relative boldness/scale matches the form view
    if (fontSize) {
      clonedNode.style.fontSize = fontSize;
    }
    const width = sourceNode.style?.width;
    if (width) {
      clonedNode.style.width = width;
    }

    const sourceChildren = sourceNode.children;
    const clonedChildren = clonedNode.children;
    for (
      let i = 0;
      i < sourceChildren.length && i < clonedChildren.length;
      i++
    ) {
      preserveStyles(sourceChildren[i], clonedChildren[i]);
    }
  };

  const importedNode = doc.importNode(node, true);
  preserveStyles(node, importedNode);

  // Remove buttons, delete icons, and actions columns
  importedNode
    .querySelectorAll(
      "button, .MuiIconButton-root, .no-print, .no-print-action-cell",
    )
    .forEach((el) => el.remove());

  // Restore resized widths on RTE table wrappers (read from live DOM before import)
  // Restore resized widths on RTE table wrappers (read from live DOM before import)
  const rteWrapperData = [];
  node
    .querySelectorAll(".rte-readonly-content .rte-table-wrapper")
    .forEach((wrapper) => {
      const table = wrapper.querySelector("table");
      const w =
        wrapper.style.width ||
        (table && table.getAttribute("data-width")) ||
        wrapper.getAttribute("data-width");
      const ml =
        wrapper.style.marginLeft ||
        (table && table.getAttribute("data-margin-left")) ||
        wrapper.getAttribute("data-margin-left");
      rteWrapperData.push({ w, ml });
    });
  // Apply collected resize data to the imported clones.
  // Preserve the resized width, but cap it at the parent cell width so a
  // resized table can never overlap the next column.
  const importedWrappers = importedNode.querySelectorAll(
    ".rte-readonly-content .rte-table-wrapper",
  );
  importedWrappers.forEach((wrapper, i) => {
    const table = wrapper.querySelector("table");
    const { w, ml } = rteWrapperData[i] || {};

    // Width: honour the stored resize, fall back to 100% when unset.
    wrapper.style.setProperty(
      "width",
      w && String(w).trim() ? w : "100%",
      "important",
    );
    // Hard cap — never wider than the cell.
    wrapper.style.setProperty("max-width", "100%", "important");
    wrapper.style.setProperty("min-width", "0", "important");
    wrapper.style.setProperty("box-sizing", "border-box", "important");
    wrapper.style.setProperty("overflow", "hidden", "important");

    // Preserve the repositioning margin-left.
    if (ml && parseFloat(ml) > 0) {
      wrapper.style.setProperty("margin-left", ml, "important");
    } else {
      wrapper.style.setProperty("margin-left", "0", "important");
    }

    if (table) {
      // The inner table fills the wrapper (which itself is the resized box).
      table.style.setProperty("width", "100%", "important");
      table.style.setProperty("max-width", "100%", "important");
      table.style.setProperty("min-width", "0", "important");
      table.style.setProperty("table-layout", "fixed", "important");
    }
  });
  importedWrappers.forEach((wrapper) => {
    const table = wrapper.querySelector("table");

    // Clamp: the wrapper fills its parent, never grows past it.
    wrapper.style.setProperty("width", "100%", "important");
    wrapper.style.setProperty("max-width", "100%", "important");
    wrapper.style.setProperty("min-width", "0", "important");
    wrapper.style.setProperty("margin-left", "0", "important");
    wrapper.style.setProperty("overflow", "hidden", "important");
    wrapper.style.setProperty("box-sizing", "border-box", "important");

    if (table) {
      table.style.setProperty("width", "100%", "important");
      table.style.setProperty("max-width", "100%", "important");
      table.style.setProperty("min-width", "0", "important");
      table.style.setProperty("table-layout", "fixed", "important");
    }
  });
  importedWrappers.forEach((wrapper) => {
    const table = wrapper.querySelector("table");

    // Clamp: the wrapper fills its parent, never grows past it.
    wrapper.style.setProperty("width", "100%", "important");
    wrapper.style.setProperty("max-width", "100%", "important");
    wrapper.style.setProperty("min-width", "0", "important");
    wrapper.style.setProperty("margin-left", "0", "important");
    wrapper.style.setProperty("overflow", "hidden", "important");
    wrapper.style.setProperty("box-sizing", "border-box", "important");

    if (table) {
      table.style.setProperty("width", "100%", "important");
      table.style.setProperty("max-width", "100%", "important");
      table.style.setProperty("min-width", "0", "important");
      table.style.setProperty("table-layout", "fixed", "important");
    }
  });

  // Reset only rte-readonly-content wrappers (not rte-table-wrapper) for positioning
  importedNode.querySelectorAll(".rte-readonly-content").forEach((wrapper) => {
    wrapper.style.setProperty("margin", "0", "important");
    wrapper.style.setProperty("padding", "0", "important");
    wrapper.style.setProperty("position", "static", "important");
    wrapper.style.setProperty("left", "auto", "important");
    wrapper.style.setProperty("transform", "none", "important");
    wrapper.style.setProperty("width", "100%", "important");
    wrapper.style.setProperty("max-width", "100%", "important");
    wrapper.style.setProperty("box-sizing", "border-box", "important");
    wrapper.style.setProperty("overflow", "visible", "important");
    wrapper.style.setProperty("border", "none", "important");
  });

  // Force inline borders on all tables inside RTE content (overrides any reset)
  importedNode
    .querySelectorAll(".rte-editor table, .rte-readonly-content table")
    .forEach((table) => {
      table.style.setProperty("border-collapse", "collapse", "important");
      table.style.setProperty("border", "1px solid #000000", "important");
      table.style.setProperty("width", "100%", "important");
    });
  importedNode
    .querySelectorAll(
      ".rte-editor table td, .rte-editor table th, .rte-readonly-content table td, .rte-readonly-content table th",
    )
    .forEach((cell) => {
      cell.style.setProperty("border", "1px solid #000000", "important");
      cell.style.setProperty("padding", "6px 8px", "important");
    });

  // Ensure all outer tables also have solid borders
  importedNode.querySelectorAll("table").forEach((table) => {
    table.style.setProperty("border-collapse", "collapse", "important");
    table.style.setProperty("border", "1px solid #000000", "important");
  });
  importedNode.querySelectorAll("td, th").forEach((cell) => {
    cell.style.setProperty("border", "1px solid #000000", "important");
  });

  doc.body.appendChild(importedNode);

  const cleanup = () => {
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  };

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(cleanup, 1000);
  }, 350);
}

// ======================= SMALL PRESENTATIONAL HELPERS =======================
const SectionTitle = ({ children, sx = {} }) => (
  <Typography
    sx={{
      fontWeight: 700,
      fontSize: "14px",
      mt: 2,
      mb: 1,
      fontFamily: "Arial",
      ...sx,
    }}
  >
    {children}
  </Typography>
);

const SubHeading = ({ children }) => (
  <Typography
    sx={{
      fontWeight: 600,
      fontSize: "13px",
      mt: 2,
      mb: 1,
      fontFamily: "Arial",
    }}
  >
    {children}
  </Typography>
);

const PartBanner = ({ tag, title }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      bgcolor: boiTableHeaderBg,
      border: `1px solid ${boiBorder}`,
      borderRadius: "6px",
      px: 2,
      py: 1,
      mt: 4,
      mb: 2,
    }}
    className="abbff-part-banner"
  >
    <Box
      sx={{
        bgcolor: "#1a3a5c",
        color: "#fff",
        fontWeight: 800,
        fontSize: 11,
        px: 1,
        py: 0.4,
        borderRadius: "4px",
        letterSpacing: 0.5,
      }}
    >
      {tag}
    </Box>
    {title && (
      <Typography
        sx={{ fontWeight: 700, fontSize: "14px", fontFamily: "Arial" }}
      >
        {title}
      </Typography>
    )}
  </Box>
);

// Context to provide readOnly, isPrinting, and validationErrors without remounting inputs
const FormContext = React.createContext({
  readOnly: false,
  isPrinting: false,
  validationErrors: {},
});

// ======================= STABLE TOP-LEVEL FIELD RENDERERS =======================
// Generic single-value field, memoized so typing in one field never re-renders others
const Field = React.memo(
  function Field({
    value,
    onChangeValue,
    type = "text",
    options = null,
    placeholder,
    multiline = false,
    minRows = 3,
    errorKey,
    sx: customSx,
  }) {
    const { readOnly, isPrinting, validationErrors } =
      React.useContext(FormContext);
    const hasError =
      errorKey && validationErrors ? !!validationErrors[errorKey] : false;
    const errorText =
      errorKey && validationErrors ? validationErrors[errorKey] : undefined;

    if (readOnly || isPrinting) {
      if (type === "date")
        return (
          <Typography sx={valueTextView}>{formatDate(value) || "-"}</Typography>
        );
      return (
        <Typography
          sx={{
            ...valueTextView,
            whiteSpace: multiline ? "pre-wrap" : "normal",
          }}
        >
          {value || "-"}
        </Typography>
      );
    }

    if (type === "date") {
      return (
        <DatePicker
          value={toDayjs(value)}
          onChange={(date) =>
            onChangeValue?.(date ? date.format("YYYY-MM-DD") : "")
          }
          shouldDisableDate={disableFutureDates}
          format={DATE_FORMAT}
          slotProps={{
            textField: {
              size: "small",
              fullWidth: true,
              variant: "outlined",
              sx: {
                "& .MuiOutlinedInput-root": {
                  borderRadius: 0,
                  bgcolor: "background.paper",
                  "& fieldset": { border: "none" },
                },
                "& .MuiInputBase-input": {
                  py: 0.75,
                  px: 1,
                  fontSize: 13,
                  fontFamily: "Arial",
                },
              },
            },
          }}
        />
      );
    }

    if (type === "select" && options) {
      return (
        <CustomAutocomplete
          options={options}
          value={value || null}
          onChange={(_, v) => onChangeValue?.(v)}
          fullWidth
          slotProps={{
            textField: {
              variant: "outlined",
              size: "small",
              sx: {
                "& .MuiOutlinedInput-root": { borderRadius: 0 },
                "& .MuiInputBase-input": {
                  py: 0.75,
                  px: 1,
                  fontSize: 13,
                  fontFamily: "Arial",
                },
              },
            },
          }}
        />
      );
    }

    return (
      <CustomTextField
        cellVariant
        value={value || ""}
        onChange={(e) => onChangeValue?.(e.target.value)}
        placeholder={placeholder}
        multiline={multiline}
        minRows={multiline ? minRows : undefined}
        error={hasError}
        helperText={errorText}
        sx={{
          "& .MuiInputBase-root": {
            borderRadius: multiline ? "8px" : 0,
            border: multiline ? `1px solid ${boiBorder}` : "none",
            backgroundColor: "#ffffff",
          },
          "& .MuiInputBase-input": {
            py: multiline ? undefined : 0.75,
            px: multiline ? undefined : 1,
            padding: multiline ? "10px 12px" : undefined,
            fontSize: 13,
            fontFamily: "Arial",
          },
          ...customSx,
        }}
      />
    );
  },
  (prev, next) => {
    return (
      prev.value === next.value &&
      prev.type === next.type &&
      prev.placeholder === next.placeholder &&
      prev.multiline === next.multiline &&
      prev.minRows === next.minRows &&
      prev.errorKey === next.errorKey &&
      prev.options === next.options &&
      prev.sx === next.sx
    );
  },
);

// Compact field for use inside dense grid tables (officials / promoters / etc.)
const GridField = React.memo(
  function GridField({
    value,
    onChangeValue,
    type = "text",
    options = null,
    placeholder,
    multiline = false,
    minRows = 2,
    sx: customSx,
  }) {
    const { readOnly, isPrinting } = React.useContext(FormContext);

    if (readOnly || isPrinting) {
      if (type === "date")
        return (
          <Typography
            sx={{ fontSize: 12.5, whiteSpace: "pre-wrap", fontFamily: "Arial" }}
          >
            {formatDate(value) || "-"}
          </Typography>
        );
      return (
        <Typography
          sx={{ fontSize: 12.5, whiteSpace: "pre-wrap", fontFamily: "Arial" }}
        >
          {value || "-"}
        </Typography>
      );
    }

    if (type === "date") {
      return (
        <DatePicker
          value={toDayjs(value)}
          onChange={(date) =>
            onChangeValue?.(date ? date.format("YYYY-MM-DD") : "")
          }
          shouldDisableDate={disableFutureDates}
          format={DATE_FORMAT}
          slotProps={{
            textField: {
              size: "small",
              fullWidth: true,
              sx: {
                "& .MuiInputBase-input": {
                  py: 0.5,
                  px: 0.75,
                  fontSize: 12.5,
                  fontFamily: "Arial",
                },
              },
            },
          }}
        />
      );
    }

    if (type === "select" && options) {
      return (
        <CustomAutocomplete
          options={options}
          value={value || null}
          onChange={(_, v) => onChangeValue?.(v)}
          size="small"
          fullWidth
        />
      );
    }

    return (
      <CustomTextField
        cellVariant
        value={value || ""}
        onChange={(e) => onChangeValue?.(e.target.value)}
        placeholder={placeholder}
        multiline={multiline}
        minRows={multiline ? minRows : undefined}
        size="small"
        fullWidth
        sx={{
          "& .MuiInputBase-input": {
            py: 0.5,
            px: 0.75,
            fontSize: 12.5,
            fontFamily: "Arial",
          },
          ...customSx,
        }}
      />
    );
  },
  (prev, next) => {
    return (
      prev.value === next.value &&
      prev.type === next.type &&
      prev.placeholder === next.placeholder &&
      prev.multiline === next.multiline &&
      prev.minRows === next.minRows &&
      prev.options === next.options &&
      prev.sx === next.sx
    );
  },
);

// Rich-text field, memoized so 18 RTE instances are never remounted on keystrokes
const RichField = React.memo(
  function RichField({ value, onChangeValue, placeholder, height = "150px" }) {
    const { readOnly, isPrinting } = React.useContext(FormContext);

    if (readOnly || isPrinting) {
      return (
        <Box
          className="rte-readonly-content"
          sx={{
            fontSize: 13,
            padding: "4px 0",
            minHeight: "20px",
            fontFamily: "Arial",
          }}
          dangerouslySetInnerHTML={{ __html: fixRteTableBorders(value) }}
        />
      );
    }

    return (
      <RichTextEditor
        label=""
        value={value || ""}
        onChange={onChangeValue}
        placeholder={placeholder}
        height={height}
        showStatusBar={false}
      />
    );
  },
  (prev, next) => {
    return (
      prev.value === next.value &&
      prev.placeholder === next.placeholder &&
      prev.height === next.height
    );
  },
);

// A single labelled row inside a two-column table, matching layout.
const LabelRow = ({ label, children, colSpan }) => {
  const { readOnly } = React.useContext(FormContext);
  return (
    <TableRow>
      <TableCell sx={labelCell}>{label}</TableCell>
      <TableCell sx={readOnly ? valueTextView : valueCell} colSpan={colSpan}>
        {children}
      </TableCell>
    </TableRow>
  );
};

// Advice-box member fields (Part A / Part B)
const AdviceMembers = ({
  membersField,
  dateField,
  placeField,
  values = {},
  set,
  setNested,
}) => {
  const { readOnly } = React.useContext(FormContext);
  return (
    <Table size="small" sx={{ border: `1px solid ${boiBorder}`, mt: 1.5 }}>
      <TableBody>
        <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
          {["Member", "Member", "Member", "Member", "Chairman"].map((h, i) => (
            <TableCell
              key={i}
              sx={{
                fontWeight: 700,
                fontSize: 12.5,
                border: `1px solid ${boiBorder}`,
                textAlign: "center",
                fontFamily: "Arial",
              }}
            >
              {h}
            </TableCell>
          ))}
        </TableRow>
        <TableRow>
          {["member1", "member2", "member3", "member4", "chairman"].map((m) => (
            <TableCell
              key={m}
              sx={{ border: `1px solid ${boiBorder}`, p: 0.5 }}
            >
              {readOnly ? (
                <Typography
                  sx={{
                    fontSize: 12.5,
                    textAlign: "center",
                    fontFamily: "Arial",
                  }}
                >
                  {values[membersField]?.[m] || "-"}
                </Typography>
              ) : (
                <CustomTextField
                  cellVariant
                  value={values[membersField]?.[m] || ""}
                  onChange={(e) => setNested?.(membersField, m, e.target.value)}
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: 12.5,
                      textAlign: "center",
                      fontFamily: "Arial",
                    },
                  }}
                />
              )}
            </TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell sx={labelCell} colSpan={1}>
            Date
          </TableCell>
          <TableCell sx={readOnly ? valueTextView : valueCell} colSpan={1}>
            <Field
              value={values[dateField]}
              onChangeValue={(v) => set?.(dateField, v)}
              type="date"
            />
          </TableCell>
          <TableCell sx={labelCell} colSpan={1}>
            Place
          </TableCell>
          <TableCell sx={readOnly ? valueTextView : valueCell} colSpan={2}>
            <Field
              value={values[placeField]}
              onChangeValue={(v) => set?.(placeField, v)}
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

// Static "Advice of ABBFF" block, matching PDF wording
const AdviceBlock = ({
  caseRefField,
  adviceField,
  membersField,
  dateField,
  placeField,
  title,
  copyTo = [],
  richText = false,
  values = {},
  set,
  setNested,
}) => {
  const { readOnly } = React.useContext(FormContext);
  return (
    <Box
      sx={{
        mt: 2,
        mb: 2,
        border: `1px solid ${boiBorder}`,
        borderRadius: "8px",
        p: 2,
        bgcolor: "#fffdf5",
      }}
    >
      <Table size="small" sx={{ border: `1px solid ${boiBorder}`, mb: 1.5 }}>
        <TableBody>
          <LabelRow label="Case Final Ref No.">
            <Field
              value={values[caseRefField]}
              onChangeValue={(v) => set?.(caseRefField, v)}
            />
          </LabelRow>
        </TableBody>
      </Table>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: 13,
          mb: 1,
          textAlign: "center",
          fontFamily: "Arial",
        }}
      >
        {title}
      </Typography>
      {richText ? (
        <RichField
          value={values[adviceField]}
          onChangeValue={(v) => set?.(adviceField, v)}
          placeholder="Enter advice..."
          height="160px"
        />
      ) : readOnly ? (
        <Typography
          sx={{
            whiteSpace: "pre-wrap",
            fontSize: 13,
            p: 1,
            fontFamily: "Arial",
          }}
        >
          {values[adviceField] || "-"}
        </Typography>
      ) : (
        <Field
          value={values[adviceField]}
          onChangeValue={(v) => set?.(adviceField, v)}
          multiline
          minRows={4}
          placeholder="Enter advice..."
        />
      )}
      <AdviceMembers
        membersField={membersField}
        dateField={dateField}
        placeField={placeField}
        values={values}
        set={set}
        setNested={setNested}
      />
      <Typography
        sx={{ fontSize: 12, fontStyle: "italic", mt: 1.5, fontFamily: "Arial" }}
      >
        COPY TO:
      </Typography>
      <Box
        component="ol"
        sx={{ fontSize: 12, pl: 3, m: 0, fontFamily: "Arial" }}
      >
        {copyTo.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </Box>
    </Box>
  );
};

export const ABBFFFormTab = forwardRef(
  (
    {
      values = {},
      onChange,
      readOnly = false,
      onSaveDraft,
      onSubmitForApproval,
      saving,
      submitting,
      validationErrors = {},
      employeeIndex = 0,
      isPrinting: propIsPrinting = false,
      activityLogs = [],
    },
    ref,
  ) => {
    const { error: showError } = useToast();
    const printRef = useRef(null);
    const [localPrinting, setLocalPrinting] = useState(false);
    const isPrinting = propIsPrinting || localPrinting;
    const valuesRef = useRef(values);
    // valuesRef.current = values;
    useEffect(() => {
      valuesRef.current = values;
    }, [values]);

    const set = useCallback(
      (field, value) => {
        const next = { ...valuesRef.current, [field]: value };
        valuesRef.current = next; // <-- critical line
        onChange?.(next);
      },
      [onChange],
    );

    const setNested = useCallback(
      (field, subField, value) => {
        const current = valuesRef.current[field] || {};
        const next = {
          ...valuesRef.current,
          [field]: { ...current, [subField]: value },
        };
        valuesRef.current = next; // <-- critical line
        onChange?.(next);
      },
      [onChange],
    );

    const formContextValue = useMemo(
      () => ({ readOnly, isPrinting, validationErrors }),
      [readOnly, isPrinting, validationErrors],
    );

    // Apply resized table wrapper dimensions to readonly content before printing (matching VettingForm)
    useEffect(() => {
      if (!isPrinting || !printRef.current) return;
      printRef.current
        .querySelectorAll(".rte-readonly-content .rte-table-wrapper")
        .forEach((wrapper) => {
          const table = wrapper.querySelector("table");
          if (!table) return;
          const w =
            table.getAttribute("data-width") ||
            wrapper.getAttribute("data-width");
          const ml =
            table.getAttribute("data-margin-left") ||
            wrapper.getAttribute("data-margin-left");
          if (w) {
            // Keep the resized width, but cap it at the cell width.
            wrapper.style.width = w;
            wrapper.style.maxWidth = "100%";
          }
          if (ml && parseFloat(ml) > 0) wrapper.style.marginLeft = ml;
          else wrapper.style.marginLeft = "0";
          wrapper.style.overflow = "hidden";
          table.style.width = "100%";
        });
    }, [isPrinting]);

    // ======================= DYNAMIC ROW HELPERS (business logic unchanged) =======================
    // ======================= DYNAMIC ROW HELPERS =======================
    // IMPORTANT: all updaters read from valuesRef.current so memoized
    // GridField components never operate on stale arrays.

    // ---------- identifiedPersons ----------
    const identifiedPersons = values.identifiedPersons?.length
      ? values.identifiedPersons
      : [getIdentifiedPersonTemplate()];

    const addPerson = useCallback(() => {
      const cur = valuesRef.current.identifiedPersons || [];
      set("identifiedPersons", [...cur, getIdentifiedPersonTemplate()]);
    }, [set]);

    const removePerson = useCallback(
      (idx) => {
        const cur = valuesRef.current.identifiedPersons || [];
        if (cur.length > 1)
          set(
            "identifiedPersons",
            cur.filter((_, i) => i !== idx),
          );
      },
      [set],
    );

    const updatePerson = useCallback(
      (idx, key, val) => {
        const raw = valuesRef.current.identifiedPersons;
        const cur =
          Array.isArray(raw) && raw.length
            ? raw
            : [getIdentifiedPersonTemplate()];
        set(
          "identifiedPersons",
          cur.map((p, i) => (i === idx ? { ...p, [key]: val } : p)),
        );
      },
      [set],
    );

    // ---------- promotersDirectors ----------
    const promotersDirectors = values.promotersDirectors?.length
      ? values.promotersDirectors
      : [getPromoterTemplate()];

    const addPromoter = useCallback(() => {
      const cur = valuesRef.current.promotersDirectors || [];
      set("promotersDirectors", [...cur, getPromoterTemplate()]);
    }, [set]);

    const removePromoter = useCallback(
      (idx) => {
        const cur = valuesRef.current.promotersDirectors || [];
        if (cur.length > 1)
          set(
            "promotersDirectors",
            cur.filter((_, i) => i !== idx),
          );
      },
      [set],
    );

    const updatePromoter = useCallback(
      (idx, key, val) => {
        const raw = valuesRef.current.promotersDirectors;
        const cur =
          Array.isArray(raw) && raw.length ? raw : [getPromoterTemplate()];
        set(
          "promotersDirectors",
          cur.map((p, i) => (i === idx ? { ...p, [key]: val } : p)),
        );
      },
      [set],
    );

    // ---------- sanctioningAuthorities ----------
    const sanctioningAuthorities = values.sanctioningAuthorities?.length
      ? values.sanctioningAuthorities
      : [getSanctionAuthTemplate()];

    const addSanctionAuth = useCallback(() => {
      const cur = valuesRef.current.sanctioningAuthorities || [];
      set("sanctioningAuthorities", [...cur, getSanctionAuthTemplate()]);
    }, [set]);

    const removeSanctionAuth = useCallback(
      (idx) => {
        const cur = valuesRef.current.sanctioningAuthorities || [];
        if (cur.length > 1)
          set(
            "sanctioningAuthorities",
            cur.filter((_, i) => i !== idx),
          );
      },
      [set],
    );

    const updateSanctionAuth = useCallback(
      (idx, key, val) => {
        const raw = valuesRef.current.sanctioningAuthorities;
        const cur =
          Array.isArray(raw) && raw.length ? raw : [getSanctionAuthTemplate()];
        set(
          "sanctioningAuthorities",
          cur.map((s, i) => (i === idx ? { ...s, [key]: val } : s)),
        );
      },
      [set],
    );

    // ---------- loansFromOtherBanks ----------
    const loansFromOtherBanks = values.loansFromOtherBanks?.length
      ? values.loansFromOtherBanks
      : [getOtherLoanTemplate()];

    const addOtherLoan = useCallback(() => {
      const cur = valuesRef.current.loansFromOtherBanks || [];
      set("loansFromOtherBanks", [...cur, getOtherLoanTemplate()]);
    }, [set]);

    const removeOtherLoan = useCallback(
      (idx) => {
        const cur = valuesRef.current.loansFromOtherBanks || [];
        if (cur.length > 1)
          set(
            "loansFromOtherBanks",
            cur.filter((_, i) => i !== idx),
          );
      },
      [set],
    );

    const updateOtherLoan = useCallback(
      (idx, key, val) => {
        const raw = valuesRef.current.loansFromOtherBanks;
        const cur =
          Array.isArray(raw) && raw.length ? raw : [getOtherLoanTemplate()];
        set(
          "loansFromOtherBanks",
          cur.map((l, i) => (i === idx ? { ...l, [key]: val } : l)),
        );
      },
      [set],
    );

    // ---------- connectedAccounts ----------
    const connectedAccounts = values.connectedAccounts?.length
      ? values.connectedAccounts
      : [getConnectedAccountTemplate()];

    const addConnected = useCallback(() => {
      const cur = valuesRef.current.connectedAccounts || [];
      set("connectedAccounts", [...cur, getConnectedAccountTemplate()]);
    }, [set]);

    const removeConnected = useCallback(
      (idx) => {
        const cur = valuesRef.current.connectedAccounts || [];
        if (cur.length > 1)
          set(
            "connectedAccounts",
            cur.filter((_, i) => i !== idx),
          );
      },
      [set],
    );

    const updateConnected = useCallback(
      (idx, key, val) => {
        const raw = valuesRef.current.connectedAccounts;
        const cur =
          Array.isArray(raw) && raw.length
            ? raw
            : [getConnectedAccountTemplate()];
        set(
          "connectedAccounts",
          cur.map((c, i) => (i === idx ? { ...c, [key]: val } : c)),
        );
      },
      [set],
    );

    // ---------- guarantors ----------
    const guarantors = values.guarantors?.length
      ? values.guarantors
      : [getGuarantorTemplate()];

    const addGuarantor = useCallback(() => {
      const cur = valuesRef.current.guarantors || [];
      set("guarantors", [...cur, getGuarantorTemplate()]);
    }, [set]);

    const removeGuarantor = useCallback(
      (idx) => {
        const cur = valuesRef.current.guarantors || [];
        if (cur.length > 1)
          set(
            "guarantors",
            cur.filter((_, i) => i !== idx),
          );
      },
      [set],
    );

    const updateGuarantor = useCallback(
      (idx, key, val) => {
        const raw = valuesRef.current.guarantors;
        const cur =
          Array.isArray(raw) && raw.length ? raw : [getGuarantorTemplate()];
        set(
          "guarantors",
          cur.map((g, i) => (i === idx ? { ...g, [key]: val } : g)),
        );
      },
      [set],
    );

    // ---------- primarySecurities ----------
    const primarySecurities = Array.isArray(values.primarySecurities)
      ? values.primarySecurities
      : values.primarySecurity &&
          Object.values(values.primarySecurity).some((v) => v)
        ? [values.primarySecurity]
        : [getPrimarySecurityTemplate()];

    const addPrimarySecurity = useCallback(() => {
      const cur = Array.isArray(valuesRef.current.primarySecurities)
        ? valuesRef.current.primarySecurities
        : primarySecurities;
      set("primarySecurities", [...cur, getPrimarySecurityTemplate()]);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [set, primarySecurities]);

    const removePrimarySecurity = useCallback(
      (idx) => {
        const cur = Array.isArray(valuesRef.current.primarySecurities)
          ? valuesRef.current.primarySecurities
          : primarySecurities;
        if (cur.length > 1)
          set(
            "primarySecurities",
            cur.filter((_, i) => i !== idx),
          );
      },
      [set, primarySecurities],
    );

    const updatePrimarySecurity = useCallback(
      (idx, key, val) => {
        const cur = Array.isArray(valuesRef.current.primarySecurities)
          ? valuesRef.current.primarySecurities
          : primarySecurities;
        set(
          "primarySecurities",
          cur.map((p, i) => (i === idx ? { ...p, [key]: val } : p)),
        );
      },
      [set, primarySecurities],
    );

    // ---------- collateralSecurities ----------
    const collateralSecurities = Array.isArray(values.collateralSecurities)
      ? values.collateralSecurities
      : values.collateralSecurity &&
          Object.values(values.collateralSecurity).some((v) => v)
        ? [values.collateralSecurity]
        : [getCollateralSecurityTemplate()];

    const addCollateralSecurity = useCallback(() => {
      const cur = Array.isArray(valuesRef.current.collateralSecurities)
        ? valuesRef.current.collateralSecurities
        : collateralSecurities;
      set("collateralSecurities", [...cur, getCollateralSecurityTemplate()]);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [set, collateralSecurities]);

    const removeCollateralSecurity = useCallback(
      (idx) => {
        const cur = Array.isArray(valuesRef.current.collateralSecurities)
          ? valuesRef.current.collateralSecurities
          : collateralSecurities;
        if (cur.length > 1)
          set(
            "collateralSecurities",
            cur.filter((_, i) => i !== idx),
          );
      },
      [set, collateralSecurities],
    );

    const updateCollateralSecurity = useCallback(
      (idx, key, val) => {
        const cur = Array.isArray(valuesRef.current.collateralSecurities)
          ? valuesRef.current.collateralSecurities
          : collateralSecurities;
        set(
          "collateralSecurities",
          cur.map((c, i) => (i === idx ? { ...c, [key]: val } : c)),
        );
      },
      [set, collateralSecurities],
    );
    const handleEligibilitySubChange = (opt) => {
      const cur = values.eligibilitySubOptions || [];
      set(
        "eligibilitySubOptions",
        cur.includes(opt) ? cur.filter((o) => o !== opt) : [...cur, opt],
      );
    };

    const performPrint = useCallback(() => {
      setLocalPrinting(true);
      setTimeout(() => {
        printDomNode(printRef.current);
        setLocalPrinting(false);
      }, 300);
    }, []);

    // Validation (expose via ref)
    const validateTab = useCallback(() => {
      let isValid = true;
      if (!values.accountName) isValid = false;
      if (!values.bankName) isValid = false;
      if (!values.fraudModusOperandi) isValid = false;
      if (!isValid) showError("Please fill all mandatory fields");
      return isValid;
    }, [values, showError]);

    useImperativeHandle(
      ref,
      () => ({
        validateTab,
        handlePrint: performPrint,
      }),
      [validateTab, performPrint],
    );

    // ======================= GRID (repeating-row) TABLE RENDERERS =======================

    const renderOfficialsTable = () => (
      <Box sx={{ overflowX: "auto", width: "100%" }}>
        <Table
          size="small"
          sx={{
            border: `1px solid ${boiBorder}`,
            mb: 1,
            minWidth: 900,
            tableLayout: "fixed",
          }}
        >
          <TableBody>
            {/* Header Row 1 */}
            <TableRow>
              <TableCell
                sx={{ ...gridHeadCell, width: "5%", textAlign: "center" }}
                rowSpan={2}
              >
                S No
              </TableCell>
              <TableCell sx={{ ...gridHeadCell, width: "30%" }} rowSpan={2}>
                Name &amp; Present Designation, Date of Retirement
              </TableCell>
              <TableCell
                sx={{ ...gridHeadCell, textAlign: "center" }}
                colSpan={2}
              >
                Posting (last 10 years)
              </TableCell>
              <TableCell sx={{ ...gridHeadCell, width: "35%" }} rowSpan={2}>
                Details of punishment imposed in the past, if any
              </TableCell>
              {!readOnly && !isPrinting && (
                <TableCell
                  className="no-print-action-cell"
                  sx={{ ...gridHeadCell, width: "5%", textAlign: "center" }}
                  rowSpan={2}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>

            {/* Header Row 2 */}
            <TableRow>
              <TableCell
                sx={{ ...gridHeadCell, width: "15%", textAlign: "center" }}
              >
                Place
              </TableCell>
              <TableCell
                sx={{ ...gridHeadCell, width: "15%", textAlign: "center" }}
              >
                Period
              </TableCell>
            </TableRow>

            {/* Data Rows */}
            {/* {identifiedPersons.map((p, idx) => (
              <TableRow key={p.id || idx}>
                <TableCell
                  sx={{ ...gridCell, textAlign: "center", fontWeight: 600 }}
                >
                  {idx + 1}
                </TableCell>
                <TableCell sx={gridCell}>
                  <GridField
                    value={p.name}
                    onChangeValue={(v) => updatePerson(idx, "name", v)}
                    placeholder="Name & Designation"
                  />
                  <Box mt={0.5}>
                    <GridField
                      type="date"
                      value={p.dateOfRetirement}
                      onChangeValue={(v) =>
                        updatePerson(idx, "dateOfRetirement", v)
                      }
                    />
                  </Box>
                </TableCell>
                <TableCell sx={gridCell}>
                  <GridField
                    value={p.postingPlace}
                    onChangeValue={(v) => updatePerson(idx, "postingPlace", v)}
                    placeholder="Place"
                  />
                </TableCell>
                <TableCell sx={gridCell}>
                  <GridField
                    value={p.postingPeriod}
                    onChangeValue={(v) => updatePerson(idx, "postingPeriod", v)}
                    placeholder="Period"
                  />
                </TableCell>
                <TableCell sx={gridCell}>
                  <GridField
                    value={p.pastPunishment}
                    onChangeValue={(v) =>
                      updatePerson(idx, "pastPunishment", v)
                    }
                    multiline
                    placeholder="Punishment details"
                  />
                </TableCell>
                {!readOnly && !isPrinting && (
                  <TableCell
                    className="no-print-action-cell"
                    sx={{ ...gridCell, textAlign: "center" }}
                  >
                    {identifiedPersons.length > 1 && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removePerson(idx)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))} */}
            {/* Data Rows */}
            {identifiedPersons.map((p, idx) => (
              <TableRow key={p.id || idx}>
                <TableCell
                  sx={{ ...gridCell, textAlign: "center", fontWeight: 600 }}
                >
                  {idx + 1}
                </TableCell>

                {/* Name & Present Designation, Date of Retirement — text areas */}
                <TableCell sx={gridCell}>
                  <GridField
                    value={p.name}
                    onChangeValue={(v) => updatePerson(idx, "name", v)}
                    placeholder="Name & Designation"
                    multiline
                    minRows={2}
                  />
                  <Box mt={0.5}>
                    <GridField
                      value={p.dateOfRetirement}
                      onChangeValue={(v) =>
                        updatePerson(idx, "dateOfRetirement", v)
                      }
                      placeholder="Date of Retirement"
                      multiline
                      minRows={2}
                    />
                  </Box>
                </TableCell>

                {/* Place — text area */}
                <TableCell sx={gridCell}>
                  <GridField
                    value={p.postingPlace}
                    onChangeValue={(v) => updatePerson(idx, "postingPlace", v)}
                    placeholder="Place"
                    multiline
                    minRows={2}
                  />
                </TableCell>

                {/* Period — text area */}
                <TableCell sx={gridCell}>
                  <GridField
                    value={p.postingPeriod}
                    onChangeValue={(v) => updatePerson(idx, "postingPeriod", v)}
                    placeholder="Period"
                    multiline
                    minRows={2}
                  />
                </TableCell>

                {/* Punishment details — already text area */}
                <TableCell sx={gridCell}>
                  <GridField
                    value={p.pastPunishment}
                    onChangeValue={(v) =>
                      updatePerson(idx, "pastPunishment", v)
                    }
                    multiline
                    minRows={2}
                    placeholder="Punishment details"
                  />
                </TableCell>

                {!readOnly && !isPrinting && (
                  <TableCell
                    className="no-print-action-cell"
                    sx={{ ...gridCell, textAlign: "center" }}
                  >
                    {identifiedPersons.length > 1 && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removePerson(idx)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {/* Add Row Button (hidden during print) */}
            {!readOnly && !isPrinting && (
              <TableRow className="no-print">
                <TableCell
                  colSpan={6}
                  sx={{ border: `1px solid ${boiBorder}`, p: 0.5 }}
                >
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={addPerson}
                    sx={{ textTransform: "none" }}
                  >
                    Add Official
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    );

    // ======================= MAIN RENDER =======================
    return (
      <FormContext.Provider value={formContextValue}>
        <style>{rteReadonlyStyle}</style>
        <style>{`
  @media print {
    @page {
      size: A4 portrait;
      margin: 10mm 10mm 14mm 10mm;
    }
    body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }

  #abbff-print-area table {
    border-collapse: collapse !important;
  }
  #abbff-print-area .rte-readonly-content table {
    border-collapse: collapse !important;
    border: 1px solid #000000 !important;
    width: 100% !important;
  }
  #abbff-print-area .rte-readonly-content table td,
  #abbff-print-area .rte-readonly-content table th {
    border: 1px solid #000000 !important;
    padding: 6px 8px !important;
  }
  /* NEW: clamp any RTE wrapper inside #abbff-print-area */
  #abbff-print-area .rte-readonly-content {
    max-width: 100% !important;
    overflow: hidden !important;
  }
  #abbff-print-area .rte-readonly-content .rte-table-wrapper {
    max-width: 100% !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
  }
  #abbff-print-area .rte-readonly-content .rte-table-wrapper table {
    width: 100% !important;
    max-width: 100% !important;
    table-layout: fixed !important;
  }
  #abbff-print-area td:has(.rte-readonly-content),
  #abbff-print-area th:has(.rte-readonly-content) {
    overflow: hidden !important;
  }
`}</style>
        <Box ref={printRef} id="abbff-print-area">
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${boiBorder}`,
              borderRadius: "8px",
              overflow: "hidden",
              margin: "0 auto",
              bgcolor: "#ffffff",
              p: 3,
            }}
          >
            {/* ===== HEADER ===== */}
            <Typography
              sx={{
                fontWeight: 700,
                textAlign: "center",
                fontSize: "16px",
                mb: 0.5,
              }}
            >
              ANNEXURE - I
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                textAlign: "center",
                fontSize: "14px",
                textDecoration: "underline",
                mb: 1,
              }}
            >
              REFERENCE TO ADVISORY BOARD FOR BANKING AND FINANCIAL FRAUDS
              (ABBFF)
            </Typography>
            <Typography
              sx={{
                fontWeight: 400,
                textAlign: "center",
                fontSize: "12px",
                textDecoration: "underline",
                mb: 2,
              }}
            >
              EXAMINATION OF ROLE OF OFFICIALS / WTDS IN FRAUD ACCOUNTS WITH
              AGGREGATE SANCTIONED LIMIT OF ABOVE Rs.3.00 CRORES &amp; UPTO
              Rs.50.00 CRORES OR OVER Rs.50.00 CRORES.
            </Typography>

            {/* ===== PART A ===== */}
            <PartBanner tag="PART A" />

            {/* <SectionTitle>1. Basic Account Information</SectionTitle> */}
            {/* ===== PART A — Section 1 (4-column layout matching Word image) ===== */}
            <Table
              size="small"
              sx={{
                border: `1px solid ${boiBorder}`,
                mb: 2,
                tableLayout: "fixed",
                width: "100%",
                "& td, & th": { border: `1px solid ${boiBorder}` },
              }}
            >
              <TableBody>
                {/* Row 1 */}
                <TableRow>
                  <TableCell sx={{ ...labelCell, width: "22%" }}>
                    Name of Account
                  </TableCell>
                  <TableCell
                    sx={readOnly ? valueTextView : valueCell}
                    width="28%"
                  >
                    <Field
                      value={values.accountName}
                      onChangeValue={(v) => set("accountName", v)}
                      errorKey={`abbff_${employeeIndex}_accountName`}
                    />
                  </TableCell>
                  <TableCell sx={{ ...labelCell, width: "22%" }}>
                    Name of the Bank/ PSI/ PFI
                  </TableCell>
                  <TableCell
                    sx={readOnly ? valueTextView : valueCell}
                    width="28%"
                  >
                    <Field
                      value={values.bankName}
                      onChangeValue={(v) => set("bankName", v)}
                      errorKey={`abbff_${employeeIndex}_bankName`}
                    />
                  </TableCell>
                </TableRow>

                {/* Row 2 */}
                <TableRow>
                  <TableCell sx={labelCell}>
                    Branch Office/ Circle/ Region
                  </TableCell>
                  <TableCell sx={readOnly ? valueTextView : valueCell}>
                    <Field
                      value={values.branchOffice}
                      onChangeValue={(v) => set("branchOffice", v)}
                      errorKey={`abbff_${employeeIndex}_branchOffice`}
                    />
                  </TableCell>
                  <TableCell sx={labelCell}>Date of initial sanction</TableCell>
                  <TableCell sx={readOnly ? valueTextView : valueCell}>
                    <Field
                      value={values.dateOfInitialSanction}
                      onChangeValue={(v) => set("dateOfInitialSanction", v)}
                      type="date"
                    />
                  </TableCell>
                </TableRow>

                {/* Row 3 */}
                <TableRow>
                  <TableCell sx={labelCell}>Date of NPA</TableCell>
                  <TableCell sx={readOnly ? valueTextView : valueCell}>
                    <Field
                      value={values.dateOfNPA}
                      onChangeValue={(v) => set("dateOfNPA", v)}
                      type="date"
                    />
                  </TableCell>
                  <TableCell sx={labelCell}>
                    Date of Identifying Fraud
                  </TableCell>
                  <TableCell sx={readOnly ? valueTextView : valueCell}>
                    <Field
                      value={values.dateOfFraudIdentification}
                      onChangeValue={(v) => set("dateOfFraudIdentification", v)}
                      type="date"
                    />
                  </TableCell>
                </TableRow>

                {/* Row 4 — Banking arrangement + Total Exposure */}
                <TableRow>
                  <TableCell sx={labelCell}>
                    Banking arrangement viz. Consortium/ Multiple Banking
                    Arrangement (MBA)/ Sole Banking
                  </TableCell>
                  <TableCell sx={readOnly ? valueTextView : valueCell}>
                    <Field
                      value={values.bankingArrangement}
                      onChangeValue={(v) => set("bankingArrangement", v)}
                      type="select"
                      options={BANKING_ARRANGEMENT_OPTS}
                    />
                  </TableCell>
                  <TableCell sx={labelCell}>
                    <Box>
                      Total Exposure of (Rs. In crores)
                      <Box component="div" sx={{ mt: 0.5, fontWeight: 500 }}>
                        a. Reporting Bank
                      </Box>
                      <Box component="div" sx={{ mt: 1, fontWeight: 500 }}>
                        b. Consortium/ MBA
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={readOnly ? valueTextView : valueCell}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        py: 0.5,
                      }}
                    >
                      <Field
                        value={values.totalExposureReportingBank}
                        onChangeValue={(v) =>
                          set("totalExposureReportingBank", v)
                        }
                      />
                      <Field
                        value={values.totalExposureConsortiumMBA}
                        onChangeValue={(v) =>
                          set("totalExposureConsortiumMBA", v)
                        }
                      />
                    </Box>
                  </TableCell>
                </TableRow>

                {/* Row 5 — Comments regarding eligibility (nested table with textfield column) */}
                <TableRow>
                  <TableCell
                    sx={{
                      ...labelCell,
                      verticalAlign: "top",
                      width: "30%",
                      fontWeight: 600,
                    }}
                  >
                    Comments regarding eligibility of the case for submission to
                    ABBFF
                  </TableCell>
                  <TableCell
                    colSpan={3}
                    sx={readOnly ? valueTextView : { ...valueCell, p: 0 }}
                  >
                    <Table
                      size="small"
                      sx={{
                        borderCollapse: "collapse",
                        width: "100%",
                        "& td, & th": { border: `1px solid ${boiBorder}` },
                      }}
                    >
                      <TableBody>
                        {/* Group a) Header + checkbox */}
                        <TableRow>
                          <TableCell
                            sx={{
                              p: 1,
                              fontSize: 13,
                              fontWeight: 600,
                              width: "92%",
                              backgroundColor: "#ffffff",
                              verticalAlign: "middle",
                            }}
                          >
                            a) The case pertains to the category of amount above
                            Rs.50 Crore and
                          </TableCell>
                          <TableCell
                            sx={{
                              p: 0.5,
                              backgroundColor: "#ffffff",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "8%",
                            }}
                          >
                            <Checkbox
                              size="small"
                              disabled={readOnly || isPrinting}
                              checked={!!values.eligibilityChecks?.groupAHeader}
                              onChange={(e) =>
                                setNested(
                                  "eligibilityChecks",
                                  "groupAHeader",
                                  e.target.checked,
                                )
                              }
                            />
                          </TableCell>
                        </TableRow>

                        {/* Group a) Items + checkbox */}
                        {[
                          {
                            key: "declared_on_after_21082019",
                            label:
                              "➢ Declared as Fraud / Reported to RBI on or after 21.08.2019",
                          },
                          {
                            key: "declared_before_reached_DA_on_after",
                            label:
                              "➢ Declared as Fraud / reported to RBI earlier than 21.08.2019 but have reached the DA through IAC and CVO on or after 21.08.2019",
                          },
                        ].map(({ key, label }) => (
                          <TableRow key={key}>
                            <TableCell
                              sx={{
                                p: 1,
                                fontSize: 13,
                                backgroundColor: "#ffffff",
                                pl: 3,
                                verticalAlign: "middle",
                              }}
                            >
                              {label}
                            </TableCell>
                            <TableCell
                              sx={{
                                p: 0.5,
                                backgroundColor: "#ffffff",
                                textAlign: "center",
                                verticalAlign: "middle",
                              }}
                            >
                              <Checkbox
                                size="small"
                                disabled={readOnly || isPrinting}
                                checked={!!values.eligibilityChecks?.[key]}
                                onChange={(e) =>
                                  setNested(
                                    "eligibilityChecks",
                                    key,
                                    e.target.checked,
                                  )
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}

                        {/* Group b) Header + checkbox */}
                        <TableRow>
                          <TableCell
                            sx={{
                              p: 1,
                              fontSize: 13,
                              fontWeight: 600,
                              backgroundColor: "#ffffff",
                              verticalAlign: "middle",
                            }}
                          >
                            b) The case pertains to the category of amount of
                            Rs.3 Crore and upto Rs.50 Crore and
                          </TableCell>
                          <TableCell
                            sx={{
                              p: 0.5,
                              backgroundColor: "#ffffff",
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                          >
                            <Checkbox
                              size="small"
                              disabled={readOnly || isPrinting}
                              checked={!!values.eligibilityChecks?.groupBHeader}
                              onChange={(e) =>
                                setNested(
                                  "eligibilityChecks",
                                  "groupBHeader",
                                  e.target.checked,
                                )
                              }
                            />
                          </TableCell>
                        </TableRow>

                        {/* Group b) Items + checkbox */}
                        {[
                          {
                            key: "declared_on_after_06012022",
                            label:
                              "➢ Declared as Fraud / Reported to RBI on or after 06.01.2022",
                          },
                          {
                            key: "declared_before_reached_DA_on_after_06012022",
                            label:
                              "➢ Declared as Fraud / reported to RBI earlier than 06.01.2022 but have reached the DA through IAC and CVO on or after 06.01.2022",
                          },
                          {
                            key: "declared_before_criminal_complaint_not_filed",
                            label:
                              "➢ Declared as Fraud / Reported to RBI earlier than 06.01.2022 but criminal complaint is yet to be filed with the investigating agencies.",
                          },
                        ].map(({ key, label }) => (
                          <TableRow key={key}>
                            <TableCell
                              sx={{
                                p: 1,
                                fontSize: 13,
                                backgroundColor: "#ffffff",
                                pl: 3,
                                verticalAlign: "middle",
                              }}
                            >
                              {label}
                            </TableCell>
                            <TableCell
                              sx={{
                                p: 0.5,
                                backgroundColor: "#ffffff",
                                textAlign: "center",
                                verticalAlign: "middle",
                              }}
                            >
                              <Checkbox
                                size="small"
                                disabled={readOnly || isPrinting}
                                checked={!!values.eligibilityChecks?.[key]}
                                onChange={(e) =>
                                  setNested(
                                    "eligibilityChecks",
                                    key,
                                    e.target.checked,
                                  )
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <SectionTitle>2. Reporting of Account as Fraud</SectionTitle>
            <Table
              size="small"
              sx={{ border: `1px solid ${boiBorder}`, mb: 2 }}
            >
              <TableBody>
                <LabelRow label="i) Date of Reporting Fraud to RBI">
                  <Field
                    value={values.fraudReportDateRBI}
                    onChangeValue={(v) => set("fraudReportDateRBI", v)}
                    type="date"
                  />
                </LabelRow>
                <LabelRow label="ii) Total Amount Involved (Rs. Cr)">
                  <Field
                    value={values.totalFraudAmount}
                    onChangeValue={(v) => set("totalFraudAmount", v)}
                  />
                </LabelRow>
                <LabelRow label="iii) Date of Occurrence">
                  <Field
                    value={values.fraudOccurrenceDate}
                    onChangeValue={(v) => set("fraudOccurrenceDate", v)}
                    type="date"
                  />
                </LabelRow>
                <LabelRow label="iv) Date of Detection">
                  <Field
                    value={values.fraudDetectionDate}
                    onChangeValue={(v) => set("fraudDetectionDate", v)}
                    type="date"
                  />
                </LabelRow>
                <LabelRow label="v) Reasons for Delay, if any">
                  <RichField
                    value={values.fraudReportingDelayReason}
                    onChangeValue={(v) => set("fraudReportingDelayReason", v)}
                    placeholder="Enter reasons for delay..."
                    height="120px"
                  />
                </LabelRow>
                <LabelRow label="vi) Modus Operandi">
                  <RichField
                    value={values.fraudModusOperandi}
                    onChangeValue={(v) => set("fraudModusOperandi", v)}
                    placeholder="Enter modus operandi..."
                    height="120px"
                  />
                </LabelRow>
                <LabelRow label="vii) Fraud Alleged to Have Been Committed By">
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      py: 0.5,
                    }}
                  >
                    {["Staff", "Customer", "Outsider"].map((option) => {
                      const selected =
                        values.fraudCommittedByActions?.[option] || "";
                      const viewMode = readOnly || isPrinting;

                      return (
                        <Box
                          key={option}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            flexWrap: "nowrap",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 600,
                              fontFamily: "Arial",
                              minWidth: 90,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {option}
                          </Typography>

                          <RadioGroup
                            row
                            value={selected}
                            onChange={
                              viewMode
                                ? undefined
                                : (e) =>
                                    setNested(
                                      "fraudCommittedByActions",
                                      option,
                                      e.target.value,
                                    )
                            }
                            sx={{
                              flex: 1,
                              justifyContent: "center",
                              gap: 3,
                              flexWrap: "nowrap",
                            }}
                          >
                            {["Yes", "No"].map((val) => (
                              <FormControlLabel
                                key={val}
                                value={val}
                                disabled={viewMode}
                                control={<Radio size="small" />}
                                label={
                                  <Typography sx={{ fontSize: 13 }}>
                                    {val}
                                  </Typography>
                                }
                                sx={{ mr: 0 }}
                              />
                            ))}
                          </RadioGroup>
                        </Box>
                      );
                    })}
                  </Box>
                </LabelRow>
              </TableBody>
            </Table>

            <SectionTitle>
              3. List of Officials Allegedly Involved (including WTDs)
            </SectionTitle>
            {renderOfficialsTable()}

            {/* ================= Section 4.a ================= */}
            <Table
              size="small"
              sx={{ border: `1px solid ${boiBorder}`, mb: 2 }}
            >
              <TableBody>
                <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 13,
                      border: `1px solid ${boiBorder}`,
                      py: 0.5,
                      px: 1,
                    }}
                  >
                    4.a Details of role and responsibilities of each official
                    including WTD at Sanction/ Disbursement/ Monitoring stage.
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                    <RichField
                      value={values.rolesResponsibilities}
                      onChangeValue={(v) => set("rolesResponsibilities", v)}
                      placeholder="Describe the role and responsibilities of each official..."
                      height="120px"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* ================= Section 4.b ================= */}
            <Table
              size="small"
              sx={{ border: `1px solid ${boiBorder}`, mb: 2 }}
            >
              <TableBody>
                <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 13,
                      border: `1px solid ${boiBorder}`,
                      py: 0.5,
                      px: 1,
                    }}
                  >
                    4.b Status of Staff accountability examination after
                    declaration of account as Fraud/ or receipt of Forensic
                    audit report.
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                    <RichField
                      value={values.accountabilityStatus}
                      onChangeValue={(v) => set("accountabilityStatus", v)}
                      placeholder="Describe the status of staff accountability examination..."
                      height="120px"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* ================= Section 5 ================= */}
            <Table
              size="small"
              sx={{ border: `1px solid ${boiBorder}`, mb: 2 }}
            >
              <TableBody>
                <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                  <TableCell
                    // align="center"
                    sx={{
                      fontWeight: 700,
                      fontSize: 13,
                      border: `1px solid ${boiBorder}`,
                      py: 0.5,
                      px: 1,
                    }}
                  >
                    5. Views of IAC
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                    <RichField
                      value={values.iacViews}
                      onChangeValue={(v) => set("iacViews", v)}
                      placeholder="Enter the views of IAC..."
                      height="120px"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* ================= Section 6.a ================= */}
            <Table
              size="small"
              sx={{ border: `1px solid ${boiBorder}`, mb: 2 }}
            >
              <TableBody>
                <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                  <TableCell
                    // align="center"
                    sx={{
                      fontWeight: 700,
                      fontSize: 13,
                      border: `1px solid ${boiBorder}`,
                      py: 0.5,
                      px: 1,
                    }}
                  >
                    6. a Views of CVO on the views of IAC
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                    <RichField
                      value={values.cvoViewsOnIAC}
                      onChangeValue={(v) => set("cvoViewsOnIAC", v)}
                      placeholder="Enter the views of CVO on the views of IAC..."
                      height="120px"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* ================= Section 6.b ================= */}
            <Table
              size="small"
              sx={{ border: `1px solid ${boiBorder}`, mb: 2 }}
            >
              <TableBody>
                <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 13,
                      border: `1px solid ${boiBorder}`,
                      py: 0.5,
                      px: 1,
                    }}
                  >
                    6. b Views of CVO on Criminality/ Malafide intent observed,
                    if any against the erring officials, including those who
                    have since retired (even where the cause of action is more
                    than 4 years old)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                    <RichField
                      value={values.cvoViewsOnCriminality}
                      onChangeValue={(v) => set("cvoViewsOnCriminality", v)}
                      placeholder="Enter the views of CVO on criminality/malafide intent..."
                      height="120px"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* ================= Section 6.c ================= */}
            <Table
              size="small"
              sx={{ border: `1px solid ${boiBorder}`, mb: 2 }}
            >
              <TableBody>
                <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 13,
                      border: `1px solid ${boiBorder}`,
                      py: 0.5,
                      px: 1,
                    }}
                  >
                    6. c Status/ details of FSA received from CVC, if applicable
                    and available
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                    <RichField
                      value={values.cvoFSAStatus}
                      onChangeValue={(v) => set("cvoFSAStatus", v)}
                      placeholder="Enter status/details of FSA received from CVC..."
                      height="120px"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "14px", mb: 1 }}>
                7.
              </Typography>

              {/* Table 1: Views of DA */}
              <Table
                size="small"
                sx={{ border: `1px solid ${boiBorder}`, mb: 2 }}
              >
                <TableBody>
                  <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        fontSize: 13,
                        border: `1px solid ${boiBorder}`,
                        py: 0.5,
                      }}
                    >
                      Views of DA on the views of IAC and CVO
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                      <RichField
                        value={values.daViews}
                        onChangeValue={(v) => set("daViews", v)}
                        placeholder="Enter the views of DA on the views of IAC and CVO..."
                        height="120px"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* Table 2: Penalty Status */}
              <Table
                size="small"
                sx={{ border: `1px solid ${boiBorder}`, mb: 2 }}
              >
                <TableBody>
                  <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        fontSize: 13,
                        border: `1px solid ${boiBorder}`,
                        py: 0.5,
                      }}
                    >
                      Status regarding imposition of penalty, if awarded by DA
                      (employee-wise)
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                      <RichField
                        value={values.penaltyStatus}
                        onChangeValue={(v) => set("penaltyStatus", v)}
                        placeholder="Enter status regarding imposition of penalty (employee-wise)..."
                        height="120px"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {/* Part A footer — Dated + CVO */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                mt: 4,
                mb: 2,
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flex: 1,
                }}
              >
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}
                >
                  Dated:
                </Typography>
                <Box sx={{ minWidth: 180 }}>
                  <Field
                    value={values.partADated}
                    onChangeValue={(v) => set("partADated", v)}
                    type="date"
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flex: 1,
                  minWidth: 260,
                }}
              >
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}
                >
                  CVO of concerned PSB/PSI/PFI:
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Field
                    value={values.partACvoName}
                    onChangeValue={(v) => set("partACvoName", v)}
                    placeholder="Enter name"
                  />
                </Box>
              </Box>
            </Box>

            <AdviceBlock
              caseRefField="abbffCaseRefNo"
              adviceField="abbffAdvice"
              membersField="abbffMembers"
              dateField="abbffAdviceDate"
              placeField="abbffAdvicePlace"
              title="ADVICE OF ABBFF FOR OFFICIALS OTHER THAN WTDs"
              copyTo={[
                "Managing Director & CEO – ____________",
                "CVO",
                "CVC",
                "CBI",
              ]}
              richText
              values={values}
              set={set}
              setNested={setNested}
            />

            {/* ===== PART B ===== */}
            {/* ===== PART B ===== */}
            <Box sx={{ mt: 4, mb: 2 }} className="print-page-break">
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "14px",
                  textAlign: "center",
                  textDecoration: "underline",
                  mb: 3,
                }}
              >
                (Part B to be submitted in case of Whole Time Directors)
              </Typography>

              {/* Section 1 */}
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "14px",
                    minWidth: "30px",
                    mt: 0.5,
                  }}
                >
                  1.
                </Typography>
                <Table
                  size="small"
                  sx={{ border: `1px solid ${boiBorder}`, flex: 1 }}
                >
                  <TableBody>
                    <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          fontSize: 13,
                          border: `1px solid ${boiBorder}`,
                          py: 0.5,
                        }}
                      >
                        Views of CVO, DFS on the views of CVO of the Bank/PSFI
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{ p: 0, border: `1px solid ${boiBorder}` }}
                      >
                        <RichField
                          value={values.wtdCvoDfsViews}
                          onChangeValue={(v) => set("wtdCvoDfsViews", v)}
                          placeholder="Enter views..."
                          height="120px"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              {/* Section 2 */}
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "14px",
                    minWidth: "30px",
                    mt: 0.5,
                  }}
                >
                  2.
                </Typography>
                <Table
                  size="small"
                  sx={{ border: `1px solid ${boiBorder}`, flex: 1 }}
                >
                  <TableBody>
                    <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          fontSize: 13,
                          border: `1px solid ${boiBorder}`,
                          py: 0.5,
                        }}
                      >
                        Views of DA on the view CVO, DFS
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{ p: 0, border: `1px solid ${boiBorder}` }}
                      >
                        <RichField
                          value={values.wtdDaViews}
                          onChangeValue={(v) => set("wtdDaViews", v)}
                          placeholder="Enter views..."
                          height="120px"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              {/* Part B footer — Dated + CVO, DFS */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  mt: 4,
                  mb: 2,
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flex: 1,
                  }}
                >
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}
                  >
                    Dated:
                  </Typography>
                  <Box sx={{ minWidth: 180 }}>
                    <Field
                      value={values.partBDated}
                      onChangeValue={(v) => set("partBDated", v)}
                      type="date"
                    />
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flex: 1,
                    minWidth: 220,
                  }}
                >
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}
                  >
                    CVO, DFS:
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Field
                      value={values.partBCvoName}
                      onChangeValue={(v) => set("partBCvoName", v)}
                      placeholder="Enter name"
                    />
                  </Box>
                </Box>
              </Box>
            </Box>

            <AdviceBlock
              caseRefField="wtdAbbffCaseRefNo"
              adviceField="wtdAbbffAdvice"
              membersField="wtdAbbffMembers"
              dateField="wtdAbbffAdviceDate"
              placeField="wtdAbbffAdvicePlace"
              title="ADVICE OF ABBFF FOR WTDs"
              copyTo={[
                "Managing Director & CEO – ____________",
                "CVO",
                "CVC",
                "CBI",
                "DFS",
              ]}
              values={values}
              set={set}
              setNested={setNested}
            />

            <Typography
              className="print-page-break"
              sx={{
                fontWeight: 700,
                fontSize: "14px",
                textAlign: "center",
                mt: 5,
                mb: 2,
              }}
            >
              PART – C
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: "13px", mb: 2 }}>
              Details of the Borrowal account:
            </Typography>

            {/* Section 1: Borrower Details */}
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  minWidth: "30px",
                  mt: 0.5,
                }}
              >
                1.
              </Typography>
              <Table
                size="small"
                sx={{ border: `1px solid ${boiBorder}`, flex: 1 }}
              >
                <TableBody>
                  <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: 13,
                        border: `1px solid ${boiBorder}`,
                        py: 0.5,
                        px: 1,
                        width: "70%",
                      }}
                    >
                      Name and Address of the Borrower
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: 13,
                        border: `1px solid ${boiBorder}`,
                        py: 0.5,
                        px: 1,
                      }}
                    >
                      Constitution
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                      <Field
                        value={values.borrowerName}
                        onChangeValue={(v) => set("borrowerName", v)}
                        multiline
                      />
                    </TableCell>
                    <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                      {/* <Field
                        value={values.constitution}
                        onChangeValue={(v) => set("constitution", v)}
                        type="select"
                        options={CONSTITUTION_OPTS}
                      /> */}
                      <Field
                        value={values.constitution}
                        onChangeValue={(v) => set("constitution", v)}
                        multiline
                        minRows={3}
                        placeholder="Enter constitution"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  minWidth: "30px",
                  mt: 0.5,
                }}
              >
                2.
              </Typography>
              <Table
                size="small"
                sx={{ border: `1px solid ${boiBorder}`, flex: 1 }}
              >
                <TableBody>
                  <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: 13,
                        border: `1px solid ${boiBorder}`,
                        py: 0.5,
                        px: 1,
                        width: "70%",
                      }}
                    >
                      Nature of Activity
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: 13,
                        border: `1px solid ${boiBorder}`,
                        py: 0.5,
                        px: 1,
                      }}
                    >
                      Date of establishment
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                      <RichField
                        value={values.natureOfActivity}
                        onChangeValue={(v) => set("natureOfActivity", v)}
                        placeholder="Enter nature of activity"
                        height="120px"
                      />
                    </TableCell>
                    <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                      <Field
                        value={values.dateOfEstablishment}
                        onChangeValue={(v) => set("dateOfEstablishment", v)}
                        type="date"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {/* Section 3: Promoters / Directors */}
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  minWidth: "30px",
                  mt: 0.5,
                }}
              >
                3.
              </Typography>
              <Box sx={{ flex: 1, overflowX: "auto" }}>
                <Table
                  size="small"
                  sx={{
                    border: `1px solid ${boiBorder}`,
                    minWidth: 800,
                    tableLayout: "fixed",
                  }}
                >
                  <TableBody>
                    {/* Main Header */}
                    <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                      <TableCell
                        colSpan={8}
                        sx={{
                          fontWeight: 700,
                          fontSize: 13,
                          border: `1px solid ${boiBorder}`,
                          py: 0.5,
                          px: 1,
                        }}
                      >
                        Names &amp; Addresses of the Promoters/Directors*:
                        [*Identifiers based on KYC guidelines]
                      </TableCell>
                    </TableRow>

                    {/* Column Headers Row 1 */}
                    <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                      <TableCell
                        rowSpan={2}
                        sx={{
                          fontWeight: 700,
                          fontSize: 12.5,
                          border: `1px solid ${boiBorder}`,
                          py: 0.5,
                          px: 1,
                          width: "5%",
                        }}
                      >
                        S.No.
                      </TableCell>
                      <TableCell
                        rowSpan={2}
                        sx={{
                          fontWeight: 700,
                          fontSize: 12.5,
                          border: `1px solid ${boiBorder}`,
                          py: 0.5,
                          px: 1,
                          width: "15%",
                        }}
                      >
                        Name
                      </TableCell>
                      <TableCell
                        rowSpan={2}
                        sx={{
                          fontWeight: 700,
                          fontSize: 12.5,
                          border: `1px solid ${boiBorder}`,
                          py: 0.5,
                          px: 1,
                          width: "12%",
                        }}
                      >
                        Designation
                      </TableCell>
                      <TableCell
                        colSpan={4}
                        align="center"
                        sx={{
                          fontWeight: 700,
                          fontSize: 12.5,
                          border: `1px solid ${boiBorder}`,
                          py: 0.5,
                          px: 1,
                        }}
                      >
                        Identifiers
                      </TableCell>
                      <TableCell
                        rowSpan={2}
                        sx={{
                          fontWeight: 700,
                          fontSize: 12.5,
                          border: `1px solid ${boiBorder}`,
                          py: 0.5,
                          px: 1,
                          width: "20%",
                        }}
                      >
                        Full Address
                      </TableCell>
                      {!readOnly && !isPrinting && (
                        <TableCell
                          rowSpan={2}
                          className="no-print-action-cell"
                          align="center"
                          sx={{
                            fontWeight: 700,
                            fontSize: 12.5,
                            border: `1px solid ${boiBorder}`,
                            py: 0.5,
                            px: 1,
                            width: "5%",
                          }}
                        >
                          Actions
                        </TableCell>
                      )}
                    </TableRow>

                    {/* Column Headers Row 2 */}
                    <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          fontSize: 12,
                          border: `1px solid ${boiBorder}`,
                          py: 0.5,
                          px: 1,
                        }}
                      >
                        DIN
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          fontSize: 12,
                          border: `1px solid ${boiBorder}`,
                          py: 0.5,
                          px: 1,
                        }}
                      >
                        PAN
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          fontSize: 12,
                          border: `1px solid ${boiBorder}`,
                          py: 0.5,
                          px: 1,
                        }}
                      >
                        Passport
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          fontSize: 12,
                          border: `1px solid ${boiBorder}`,
                          py: 0.5,
                          px: 1,
                        }}
                      >
                        Others (Aadhar Card No.)
                      </TableCell>
                    </TableRow>

                    {/* Data Rows */}
                    {promotersDirectors.map((p, idx) => (
                      <TableRow key={idx}>
                        <TableCell
                          sx={{
                            ...gridCell,
                            textAlign: "center",
                            fontWeight: 600,
                          }}
                        >
                          {idx + 1}
                        </TableCell>
                        {[
                          "name",
                          "designation",
                          "din",
                          "pan",
                          "passport",
                          "aadhar",
                        ].map((f) => (
                          <TableCell key={f} sx={gridCell}>
                            <GridField
                              value={p[f]}
                              onChangeValue={(v) => updatePromoter(idx, f, v)}
                            />
                          </TableCell>
                        ))}
                        <TableCell sx={gridCell}>
                          <GridField
                            value={p.address}
                            onChangeValue={(v) =>
                              updatePromoter(idx, "address", v)
                            }
                            multiline
                          />
                        </TableCell>
                        {!readOnly && !isPrinting && (
                          <TableCell
                            className="no-print-action-cell"
                            sx={{ ...gridCell, textAlign: "center" }}
                          >
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removePromoter(idx)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}

                    {/* Add Row Button */}
                    {!readOnly && !isPrinting && (
                      <TableRow className="no-print">
                        <TableCell
                          colSpan={9}
                          sx={{ border: `1px solid ${boiBorder}`, p: 0.5 }}
                        >
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={addPromoter}
                            sx={{ textTransform: "none" }}
                          >
                            Add Promoter / Director
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Box>

            {/* ================= Section 4 – Position of Account ================= */}
            {/* ================= Section 4 – Position of Account ================= */}
            {/* ================= Section 4 – Position of Account ================= */}
            <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 0.5 }}>
              4. Position of account
            </Typography>
            <Typography align="right" sx={{ fontSize: 13, mb: 0.5, mr: 0.5 }}>
              (Rs. in crores)
            </Typography>
            <Box sx={{ overflowX: "auto", width: "100%" }}>
              <Table
                size="small"
                sx={{
                  border: `1px solid ${boiBorder}`,
                  mb: 2,
                  tableLayout: "fixed",
                  "& td, & th": { border: `1px solid ${boiBorder}` },
                }}
              >
                <TableBody>
                  {/* ---------- Header Row ---------- */}
                  <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        fontSize: 12.5,
                        border: `1px solid ${boiBorder}`,
                        py: 1,
                        px: 1,
                        width: "24%",
                      }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        fontSize: 12.5,
                        border: `1px solid ${boiBorder}`,
                        py: 1,
                        px: 1,
                        width: "14%",
                      }}
                    >
                      Type of facility
                      <br />
                      (viz. CC, TL, BG, LC etc)
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        fontSize: 12.5,
                        border: `1px solid ${boiBorder}`,
                        py: 1,
                        px: 1,
                        width: "20%",
                      }}
                    >
                      Amount of sanctioned limit
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        fontSize: 12.5,
                        border: `1px solid ${boiBorder}`,
                        py: 1,
                        px: 1,
                        width: "21%",
                      }}
                    >
                      Outstanding
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        fontSize: 12.5,
                        border: `1px solid ${boiBorder}`,
                        py: 1,
                        px: 1,
                        width: "21%",
                      }}
                    >
                      Overdue
                    </TableCell>
                  </TableRow>

                  {/* ============ i) As on Date of NPA ============ */}
                  {["CC", "TL", "BG", "LC"].map((facility, idx) => (
                    <TableRow key={`npa-${facility}`}>
                      {idx === 0 && (
                        <TableCell
                          rowSpan={5}
                          sx={{
                            fontSize: 12.5,
                            border: `1px solid ${boiBorder}`,
                            p: 1,
                            fontWeight: 600,
                            fontFamily: "Arial",
                            verticalAlign: "top",
                          }}
                        >
                          i) As on Date of NPA
                          <Box sx={{ mt: 1 }}>
                            <Field
                              value={values.poAsOnNPADate}
                              onChangeValue={(v) => set("poAsOnNPADate", v)}
                              type="date"
                            />
                          </Box>
                        </TableCell>
                      )}
                      <TableCell sx={gridCell}>{facility}</TableCell>
                      <TableCell sx={gridCell}>
                        <GridField
                          value={
                            values[`poAsOnNPA${facility}SanctionedLimit`] || ""
                          }
                          onChangeValue={(v) =>
                            set(`poAsOnNPA${facility}SanctionedLimit`, v)
                          }
                          placeholder="Amount"
                        />
                      </TableCell>
                      <TableCell sx={gridCell}>
                        <GridField
                          value={
                            values[`poAsOnNPA${facility}Outstanding`] || ""
                          }
                          onChangeValue={(v) =>
                            set(`poAsOnNPA${facility}Outstanding`, v)
                          }
                          placeholder="Amount"
                        />
                      </TableCell>
                      <TableCell sx={gridCell}>
                        <GridField
                          value={values[`poAsOnNPA${facility}Overdue`] || ""}
                          onChangeValue={(v) =>
                            set(`poAsOnNPA${facility}Overdue`, v)
                          }
                          placeholder="Amount"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* i) Total row — auto-computed */}
                  <TableRow>
                    <TableCell
                      sx={{ ...gridCell, fontWeight: 700, textAlign: "center" }}
                    >
                      Total
                    </TableCell>
                    <TableCell sx={gridCell}>
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          fontFamily: "Arial",
                          fontWeight: 700,
                        }}
                      >
                        {calcTotal([
                          values.poAsOnNPACCSanctionedLimit,
                          values.poAsOnNPATLSanctionedLimit,
                          values.poAsOnNPABGSanctionedLimit,
                          values.poAsOnNPALCSanctionedLimit,
                        ]) || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={gridCell}>
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          fontFamily: "Arial",
                          fontWeight: 700,
                        }}
                      >
                        {calcTotal([
                          values.poAsOnNPACCOutstanding,
                          values.poAsOnNPATLOutstanding,
                          values.poAsOnNPABGOutstanding,
                          values.poAsOnNPALCOutstanding,
                        ]) || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={gridCell}>
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          fontFamily: "Arial",
                          fontWeight: 700,
                        }}
                      >
                        {calcTotal([
                          values.poAsOnNPACCOverdue,
                          values.poAsOnNPATLOverdue,
                          values.poAsOnNPABGOverdue,
                          values.poAsOnNPALCOverdue,
                        ]) || "-"}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  {/* ============ ii) Latest position as on ============ */}
                  {["CC", "TL", "BG", "LC"].map((facility, idx) => (
                    <TableRow key={`latest-${facility}`}>
                      {idx === 0 && (
                        <TableCell
                          rowSpan={5}
                          sx={{
                            fontSize: 12.5,
                            border: `1px solid ${boiBorder}`,
                            p: 1,
                            fontWeight: 600,
                            fontFamily: "Arial",
                            verticalAlign: "top",
                          }}
                        >
                          ii) Latest position as on
                          <Box sx={{ mt: 1 }}>
                            <Field
                              value={values.poLatestDate}
                              onChangeValue={(v) => set("poLatestDate", v)}
                              type="date"
                            />
                          </Box>
                        </TableCell>
                      )}
                      <TableCell sx={gridCell}>{facility}</TableCell>
                      <TableCell sx={gridCell}>
                        <GridField
                          value={
                            values[`poLatest${facility}SanctionedLimit`] || ""
                          }
                          onChangeValue={(v) =>
                            set(`poLatest${facility}SanctionedLimit`, v)
                          }
                          placeholder="Amount"
                        />
                      </TableCell>
                      <TableCell sx={gridCell}>
                        <GridField
                          value={values[`poLatest${facility}Outstanding`] || ""}
                          onChangeValue={(v) =>
                            set(`poLatest${facility}Outstanding`, v)
                          }
                          placeholder="Amount"
                        />
                      </TableCell>
                      <TableCell sx={gridCell}>
                        <GridField
                          value={values[`poLatest${facility}Overdue`] || ""}
                          onChangeValue={(v) =>
                            set(`poLatest${facility}Overdue`, v)
                          }
                          placeholder="Amount"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* ii) Total row — auto-computed */}
                  <TableRow>
                    <TableCell
                      sx={{ ...gridCell, fontWeight: 700, textAlign: "center" }}
                    >
                      Total
                    </TableCell>
                    <TableCell sx={gridCell}>
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          fontFamily: "Arial",
                          fontWeight: 700,
                        }}
                      >
                        {calcTotal([
                          values.poLatestCCSanctionedLimit,
                          values.poLatestTLSanctionedLimit,
                          values.poLatestBGSanctionedLimit,
                          values.poLatestLCSanctionedLimit,
                        ]) || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={gridCell}>
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          fontFamily: "Arial",
                          fontWeight: 700,
                        }}
                      >
                        {calcTotal([
                          values.poLatestCCOutstanding,
                          values.poLatestTLOutstanding,
                          values.poLatestBGOutstanding,
                          values.poLatestLCOutstanding,
                        ]) || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={gridCell}>
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          fontFamily: "Arial",
                          fontWeight: 700,
                        }}
                      >
                        {calcTotal([
                          values.poLatestCCOverdue,
                          values.poLatestTLOverdue,
                          values.poLatestBGOverdue,
                          values.poLatestLCOverdue,
                        ]) || "-"}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  {/* ============ iii) Apprehended Loss, if any. ============ */}
                  {["CC", "TL", "BG", "LC"].map((facility, idx) => (
                    <TableRow key={`loss-${facility}`}>
                      {idx === 0 && (
                        <TableCell
                          rowSpan={5}
                          sx={{
                            fontSize: 12.5,
                            border: `1px solid ${boiBorder}`,
                            p: 1,
                            fontWeight: 600,
                            fontFamily: "Arial",
                            verticalAlign: "top",
                          }}
                        >
                          iii) Apprehended Loss, if any.
                        </TableCell>
                      )}
                      <TableCell sx={gridCell}>{facility}</TableCell>
                      <TableCell sx={gridCell}>
                        <GridField
                          value={
                            values[
                              `poApprehendedLoss${facility}SanctionedLimit`
                            ] || ""
                          }
                          onChangeValue={(v) =>
                            set(
                              `poApprehendedLoss${facility}SanctionedLimit`,
                              v,
                            )
                          }
                          placeholder="Amount"
                        />
                      </TableCell>
                      <TableCell sx={gridCell}>
                        <GridField
                          value={
                            values[`poApprehendedLoss${facility}Outstanding`] ||
                            ""
                          }
                          onChangeValue={(v) =>
                            set(`poApprehendedLoss${facility}Outstanding`, v)
                          }
                          placeholder="Amount"
                        />
                      </TableCell>
                      <TableCell sx={gridCell}>
                        <GridField
                          value={
                            values[`poApprehendedLoss${facility}Overdue`] || ""
                          }
                          onChangeValue={(v) =>
                            set(`poApprehendedLoss${facility}Overdue`, v)
                          }
                          placeholder="Amount"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* iii) Total row — auto-computed */}
                  <TableRow>
                    <TableCell
                      sx={{ ...gridCell, fontWeight: 700, textAlign: "center" }}
                    >
                      Total
                    </TableCell>
                    <TableCell sx={gridCell}>
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          fontFamily: "Arial",
                          fontWeight: 700,
                        }}
                      >
                        {calcTotal([
                          values.poApprehendedLossCCSanctionedLimit,
                          values.poApprehendedLossTLSanctionedLimit,
                          values.poApprehendedLossBGSanctionedLimit,
                          values.poApprehendedLossLCSanctionedLimit,
                        ]) || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={gridCell}>
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          fontFamily: "Arial",
                          fontWeight: 700,
                        }}
                      >
                        {calcTotal([
                          values.poApprehendedLossCCOutstanding,
                          values.poApprehendedLossTLOutstanding,
                          values.poApprehendedLossBGOutstanding,
                          values.poApprehendedLossLCOutstanding,
                        ]) || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={gridCell}>
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          fontFamily: "Arial",
                          fontWeight: 700,
                        }}
                      >
                        {calcTotal([
                          values.poApprehendedLossCCOverdue,
                          values.poApprehendedLossTLOverdue,
                          values.poApprehendedLossBGOverdue,
                          values.poApprehendedLossLCOverdue,
                        ]) || "-"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {/* ================= Section 5 ================= */}
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 4 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  minWidth: "30px",
                  mt: 0.5,
                }}
              >
                5.
              </Typography>
              <Table
                size="small"
                sx={{ border: `1px solid ${boiBorder}`, flex: 1 }}
              >
                <TableBody>
                  <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: 13,
                        border: `1px solid ${boiBorder}`,
                        py: 0.5,
                        px: 1,
                      }}
                    >
                      In case of Take over finance, whether policy guidelines of
                      the Bank were followed and satisfactory status obtained
                      from transferor Bank/Satisfactory credit information
                      obtained from agency
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                      <RichField
                        value={values.takeOverFinanceFollowed}
                        onChangeValue={(v) => set("takeOverFinanceFollowed", v)}
                        placeholder="Enter details..."
                        height="100px"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {/* ================= Section 6 ================= */}
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  minWidth: "30px",
                  mt: 0.5,
                }}
              >
                6.
              </Typography>
              <Box sx={{ flex: 1 }}>
                {/* Table 1: CIBIL Records */}
                <Table
                  size="small"
                  sx={{ border: `1px solid ${boiBorder}`, mb: 2 }}
                >
                  <TableBody>
                    <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: 13,
                          border: `1px solid ${boiBorder}`,
                          py: 0.5,
                          px: 1,
                        }}
                      >
                        CIBIL Records, RBI defaulter lists, ECGC caution list
                        etc. are extracted &amp;verified before sanction and
                        commented upon in the proposal put up to sanctioning
                        authority.
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{ p: 0, border: `1px solid ${boiBorder}` }}
                      >
                        <RichField
                          value={values.cibilVerified}
                          onChangeValue={(v) => set("cibilVerified", v)}
                          placeholder="Enter details..."
                          height="100px"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Table 2: KYC Guidelines */}
                <Table size="small" sx={{ border: `1px solid ${boiBorder}` }}>
                  <TableBody>
                    <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: 13,
                          border: `1px solid ${boiBorder}`,
                          py: 0.5,
                          px: 1,
                        }}
                      >
                        KYC guidelines in respect of
                        firm/company/borrower/guarantor complied with&amp; duly
                        verified Documents are held on record. (Discuss lapses,
                        if any)
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{ p: 0, border: `1px solid ${boiBorder}` }}
                      >
                        <RichField
                          value={values.kycLapses}
                          onChangeValue={(v) => set("kycLapses", v)}
                          placeholder="Enter details..."
                          height="100px"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </Box>

            {/* ================= Section 7 ================= */}
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 4 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  minWidth: "30px",
                  mt: 0.5,
                }}
              >
                7.
              </Typography>
              <Box sx={{ flex: 1 }}>
                {/* Section Title */}
                <Box
                  sx={{
                    border: `1px solid ${boiBorder}`,
                    borderBottom: "none",
                    bgcolor: boiTableHeaderBg,
                    p: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                    Name and Designation of Sanctioning authority
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                    }}
                  >
                    <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                      (Give details of sanction, in chronological order since
                      inception of the account including renewal/review/Ad-hoc.)
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                      (Rs. in Cr.)
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ overflowX: "auto", width: "100%" }}>
                  <Table
                    size="small"
                    sx={{
                      border: `1px solid ${boiBorder}`,
                      minWidth: 950,
                      tableLayout: "fixed",
                    }}
                  >
                    <TableBody>
                      {/* Header Row 1 */}
                      <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                        <TableCell
                          rowSpan={2}
                          align="center"
                          sx={{ ...gridHeadCell, width: "5%" }}
                        >
                          S.N
                        </TableCell>
                        <TableCell
                          rowSpan={2}
                          sx={{ ...gridHeadCell, width: "30%" }}
                        >
                          Sanctioning Authority Name &amp; Designation (In case
                          of Committee – name of the Committee)
                        </TableCell>
                        <TableCell
                          rowSpan={2}
                          align="center"
                          sx={{ ...gridHeadCell, width: "12%" }}
                        >
                          Date of Sanction
                        </TableCell>
                        <TableCell colSpan={2} align="center" sx={gridHeadCell}>
                          Fund Based
                        </TableCell>
                        <TableCell
                          rowSpan={2}
                          align="center"
                          sx={{ ...gridHeadCell, width: "10%" }}
                        >
                          NFB
                        </TableCell>
                        <TableCell
                          rowSpan={2}
                          align="center"
                          sx={{ ...gridHeadCell, width: "15%" }}
                        >
                          Any other approval
                        </TableCell>
                        {!readOnly && !isPrinting && (
                          <TableCell
                            rowSpan={2}
                            align="center"
                            className="no-print-action-cell"
                            sx={{ ...gridHeadCell, width: "6%" }}
                          >
                            Actions
                          </TableCell>
                        )}
                      </TableRow>

                      {/* Header Row 2 */}
                      <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                        <TableCell align="center" sx={gridHeadCell}>
                          TL
                        </TableCell>
                        <TableCell align="center" sx={gridHeadCell}>
                          WC
                        </TableCell>
                      </TableRow>

                      {/* Data Rows */}
                      {sanctioningAuthorities.map((sa, idx) => (
                        <TableRow key={idx}>
                          <TableCell
                            sx={{
                              ...gridCell,
                              textAlign: "center",
                              fontWeight: 600,
                            }}
                          >
                            {["i", "ii", "iii", "iv", "v"][idx] || idx + 1}
                          </TableCell>
                          <TableCell sx={gridCell}>
                            <GridField
                              value={sa.authorityName}
                              onChangeValue={(v) =>
                                updateSanctionAuth(idx, "authorityName", v)
                              }
                              placeholder="Name & designation"
                            />
                          </TableCell>
                          <TableCell sx={gridCell}>
                            <GridField
                              type="date"
                              value={sa.sanctionDate}
                              onChangeValue={(v) =>
                                updateSanctionAuth(idx, "sanctionDate", v)
                              }
                            />
                          </TableCell>
                          {["tlAmount", "wcAmount", "nfb", "otherApproval"].map(
                            (f) => (
                              <TableCell key={f} sx={gridCell}>
                                <GridField
                                  value={sa[f]}
                                  onChangeValue={(v) =>
                                    updateSanctionAuth(idx, f, v)
                                  }
                                  placeholder={
                                    f === "otherApproval" ? "Details" : "Amount"
                                  }
                                />
                              </TableCell>
                            ),
                          )}
                          {!readOnly && !isPrinting && (
                            <TableCell
                              className="no-print-action-cell"
                              sx={{ ...gridCell, textAlign: "center" }}
                            >
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeSanctionAuth(idx)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}

                      {!readOnly && !isPrinting && (
                        <TableRow className="no-print">
                          <TableCell
                            colSpan={8}
                            sx={{ border: `1px solid ${boiBorder}`, p: 0.5 }}
                          >
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={addSanctionAuth}
                              sx={{ textTransform: "none" }}
                            >
                              Add Sanctioning Authority
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            </Box>

            {/* ================= Section 8 ================= */}
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 4 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  minWidth: "30px",
                  mt: 0.5,
                }}
              >
                8.
              </Typography>
              <Box sx={{ flex: 1 }}>
                {/* Section Title */}
                {/* <Box
                  sx={{
                    border: `1px solid ${boiBorder}`,
                    borderBottom: "none",
                    bgcolor: boiTableHeaderBg,
                    p: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                  }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                    Details of loans availed from other Banks/FIs
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                    (Rs. in Cr.)
                  </Typography>
                </Box> */}
                <Box
                  sx={{
                    border: `1px solid ${boiBorder}`,
                    borderBottom: "none",
                    bgcolor: boiTableHeaderBg,
                    p: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    gap: 2,
                  }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                    Details of loans availed from other Banks/FIs
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                      (Rs. in Cr.)
                    </Typography>
                    <FormControlLabel
                      control={
                        readOnly || isPrinting ? (
                          <input
                            type="checkbox"
                            checked={!!values.loansFromOtherBanksNA}
                            disabled
                            style={{ width: 16, height: 16 }}
                          />
                        ) : (
                          <Checkbox
                            checked={!!values.loansFromOtherBanksNA}
                            onChange={(e) =>
                              set("loansFromOtherBanksNA", e.target.checked)
                            }
                            size="small"
                          />
                        )
                      }
                      label={
                        <Typography sx={{ fontSize: 13, fontFamily: "Arial" }}>
                          Not Applicable
                        </Typography>
                      }
                      sx={{ mb: 0, mr: 0 }}
                    />
                  </Box>
                </Box>

                <Box sx={{ overflowX: "auto", width: "100%" }}>
                  <Table
                    size="small"
                    sx={{
                      border: `1px solid ${boiBorder}`,
                      minWidth: 1000,
                      tableLayout: "fixed",
                    }}
                  >
                    <TableBody>
                      {/* Header Row 1 */}
                      <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                        <TableCell
                          rowSpan={3}
                          align="center"
                          sx={{ ...gridHeadCell, width: "5%" }}
                        >
                          S.N.
                        </TableCell>
                        <TableCell
                          rowSpan={3}
                          sx={{ ...gridHeadCell, width: "15%" }}
                        >
                          Bank's/FI's
                        </TableCell>
                        <TableCell
                          rowSpan={3}
                          sx={{ ...gridHeadCell, width: "18%" }}
                        >
                          If in consortium/MBA %age of share of all banks.
                        </TableCell>
                        <TableCell colSpan={3} align="center" sx={gridHeadCell}>
                          Limits
                        </TableCell>
                        <TableCell
                          rowSpan={3}
                          align="center"
                          sx={{ ...gridHeadCell, width: "12%" }}
                        >
                          Present O/s
                        </TableCell>
                        <TableCell
                          rowSpan={3}
                          align="center"
                          sx={{ ...gridHeadCell, width: "12%" }}
                        >
                          Status of a/c
                        </TableCell>
                        {!readOnly && !isPrinting && (
                          <TableCell
                            rowSpan={3}
                            align="center"
                            className="no-print-action-cell"
                            sx={{ ...gridHeadCell, width: "6%" }}
                          >
                            Actions
                          </TableCell>
                        )}
                      </TableRow>

                      {/* Header Row 2 */}
                      <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                        <TableCell colSpan={2} align="center" sx={gridHeadCell}>
                          Fund Based
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={gridHeadCell}>
                          NFB
                        </TableCell>
                      </TableRow>

                      {/* Header Row 3 */}
                      <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                        <TableCell align="center" sx={gridHeadCell}>
                          TL
                        </TableCell>
                        <TableCell align="center" sx={gridHeadCell}>
                          WC
                        </TableCell>
                      </TableRow>

                      {/* Data Rows — hidden when Not Applicable */}
                      {!values.loansFromOtherBanksNA &&
                        loansFromOtherBanks.map((loan, idx) => (
                          <TableRow key={idx}>
                            <TableCell
                              sx={{
                                ...gridCell,
                                textAlign: "center",
                                fontWeight: 600,
                              }}
                            >
                              {["i", "ii", "iii", "iv", "v"][idx] || idx + 1}
                            </TableCell>
                            {[
                              "bankName",
                              "consortiumShare",
                              "tlLimit",
                              "wcLimit",
                              "nfbLimit",
                              "presentOs",
                              "status",
                            ].map((f) => (
                              <TableCell key={f} sx={gridCell}>
                                <GridField
                                  value={loan[f]}
                                  onChangeValue={(v) =>
                                    updateOtherLoan(idx, f, v)
                                  }
                                  placeholder={
                                    f === "bankName"
                                      ? "Bank name"
                                      : f === "status"
                                        ? "Status"
                                        : "Amount / %"
                                  }
                                />
                              </TableCell>
                            ))}
                            {!readOnly && !isPrinting && (
                              <TableCell
                                className="no-print-action-cell"
                                sx={{ ...gridCell, textAlign: "center" }}
                              >
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => removeOtherLoan(idx)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      {!values.loansFromOtherBanksNA &&
                        !readOnly &&
                        !isPrinting && (
                          <TableRow className="no-print">
                            <TableCell
                              colSpan={9}
                              sx={{ border: `1px solid ${boiBorder}`, p: 0.5 }}
                            >
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={addOtherLoan}
                                sx={{ textTransform: "none" }}
                              >
                                Add Loan
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            </Box>

            {/* ================= Section 9 ================= */}
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "13px",
                textAlign: "center",
                mt: 3,
                mb: 1,
              }}
            >
              CONNECTED ACCOUNTS OF PROMOTERS/DIRECTORS
            </Typography>

            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  minWidth: "30px",
                  mt: 0.5,
                }}
              >
                9.
              </Typography>
              <Box sx={{ flex: 1 }}>
                {/* <Box
                  sx={{
                    border: `1px solid ${boiBorder}`,
                    borderBottom: "none",
                    bgcolor: boiTableHeaderBg,
                    p: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                    Details of connected accounts/allied/associate/sister
                    concerns with status of account with other Bank/FIs be
                    ascertained and reported as under:
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                    (Rs. in Cr.)
                  </Typography>
                </Box> */}
                <Box
                  sx={{
                    border: `1px solid ${boiBorder}`,
                    borderBottom: "none",
                    bgcolor: boiTableHeaderBg,
                    p: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    gap: 2,
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                    Details of connected accounts/allied/associate/sister
                    concerns with status of account with other Bank/FIs be
                    ascertained and reported as under:
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                      (Rs. in Cr.)
                    </Typography>
                    <FormControlLabel
                      control={
                        readOnly || isPrinting ? (
                          <input
                            type="checkbox"
                            checked={!!values.connectedAccountsNA}
                            disabled
                            style={{ width: 16, height: 16 }}
                          />
                        ) : (
                          <Checkbox
                            checked={!!values.connectedAccountsNA}
                            onChange={(e) =>
                              set("connectedAccountsNA", e.target.checked)
                            }
                            size="small"
                          />
                        )
                      }
                      label={
                        <Typography sx={{ fontSize: 13, fontFamily: "Arial" }}>
                          Not Applicable
                        </Typography>
                      }
                      sx={{ mb: 0, mr: 0 }}
                    />
                  </Box>
                </Box>
                <Box sx={{ overflowX: "auto", width: "100%" }}>
                  <Table
                    size="small"
                    sx={{
                      border: `1px solid ${boiBorder}`,
                      minWidth: 900,
                      tableLayout: "fixed",
                    }}
                  >
                    <TableBody>
                      <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                        {[
                          { label: "S.No.", width: "5%" },
                          { label: "Name of Account", width: "20%" },
                          { label: "Name of Banks/FIs", width: "16%" },
                          { label: "Nature of facilities", width: "16%" },
                          { label: "FB", width: "9%" },
                          { label: "NFB", width: "9%" },
                          { label: "O/s", width: "9%" },
                          { label: "Irregularities, if any", width: "16%" },
                        ].map((h, i) => (
                          <TableCell
                            key={i}
                            align="center"
                            sx={{ ...gridHeadCell, width: h.width }}
                          >
                            {h.label}
                          </TableCell>
                        ))}
                        {!readOnly && !isPrinting && (
                          <TableCell
                            align="center"
                            className="no-print-action-cell"
                            sx={{ ...gridHeadCell, width: "6%" }}
                          >
                            Actions
                          </TableCell>
                        )}
                      </TableRow>

                      {/* Data Rows — hidden when Not Applicable */}
                      {!values.connectedAccountsNA &&
                        connectedAccounts.map((c, idx) => (
                          <TableRow key={idx}>
                            {/* S.No */}
                            <TableCell
                              sx={{
                                ...gridCell,
                                textAlign: "center",
                                fontWeight: 600,
                              }}
                            >
                              {["i", "ii", "iii", "iv", "v"][idx] || idx + 1}
                            </TableCell>

                            {/* Name of Account (multiline / text area) */}
                            <TableCell sx={gridCell}>
                              <GridField
                                value={c.nameOfAccount}
                                onChangeValue={(v) =>
                                  updateConnected(idx, "nameOfAccount", v)
                                }
                                multiline
                                placeholder="Enter name of account"
                              />
                            </TableCell>

                            {/* Name of Banks/FIs */}
                            <TableCell sx={gridCell}>
                              <GridField
                                value={c.bankName}
                                onChangeValue={(v) =>
                                  updateConnected(idx, "bankName", v)
                                }
                                placeholder="Bank name"
                              />
                            </TableCell>

                            {/* Remaining fields */}
                            {[
                              "natureFacility",
                              "fbLimit",
                              "nfbLimit",
                              "outstanding",
                              "irregularities",
                            ].map((f) => (
                              <TableCell key={f} sx={gridCell}>
                                <GridField
                                  value={c[f]}
                                  onChangeValue={(v) =>
                                    updateConnected(idx, f, v)
                                  }
                                  multiline={f === "irregularities"}
                                  placeholder={
                                    f === "irregularities"
                                      ? "Describe"
                                      : "Amount"
                                  }
                                />
                              </TableCell>
                            ))}

                            {!readOnly && !isPrinting && (
                              <TableCell
                                className="no-print-action-cell"
                                sx={{ ...gridCell, textAlign: "center" }}
                              >
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => removeConnected(idx)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}

                      {!values.connectedAccountsNA &&
                        !readOnly &&
                        !isPrinting && (
                          <TableRow className="no-print">
                            <TableCell
                              colSpan={8}
                              sx={{ border: `1px solid ${boiBorder}`, p: 0.5 }}
                            >
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={addConnected}
                                sx={{ textTransform: "none" }}
                              >
                                Add Connected Account
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            </Box>

            {/* ================= Section 10 ================= */}
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 4 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  minWidth: "30px",
                  mt: 0.5,
                }}
              >
                10.
              </Typography>
              <Box sx={{ flex: 1 }}>
                {/* Title Box */}
                <Box
                  sx={{
                    border: `1px solid ${boiBorder}`,
                    borderBottom: "none",
                    bgcolor: boiTableHeaderBg,
                    p: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                      Primary Security
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                      (Rs. in Cr.)
                    </Typography>
                  </Box>
                  <Typography
                    sx={{ fontSize: 12, fontStyle: "italic", fontWeight: 500 }}
                  >
                    *RV: Realizable Value, **MV: Market Value)
                  </Typography>
                </Box>

                <Box sx={{ overflowX: "auto", width: "100%" }}>
                  <Table
                    size="small"
                    sx={{
                      border: `1px solid ${boiBorder}`,
                      minWidth: 850,
                      tableLayout: "fixed",
                    }}
                  >
                    {" "}
                    <colgroup>
                      <col style={{ width: "40%" }} /> {/* description */}
                      <col style={{ width: "10.75%" }} />
                      {/* RV* at sanction */}
                      <col style={{ width: "10.75%" }} />
                      {/* MV** at sanction */}
                      <col style={{ width: "10.75%" }} />
                      {/* RV* latest */}
                      <col style={{ width: "10.75%" }} />
                      {/* MV** latest */}
                      <col style={{ width: "12%" }} /> {/* VOS share */}
                      {!readOnly && !isPrinting && (
                        <col style={{ width: "5%" }} />
                      )}
                    </colgroup>
                    <TableBody>
                      {/* <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                        <TableCell
                          rowSpan={2}
                          sx={{ ...gridHeadCell, width: "30%" }}
                        >
                          Particulars/description of primary security, viz- Land
                          &amp; building of factory, P &amp; M, Stocks/
                          Receivables, etc.
                        </TableCell>

                        <TableCell colSpan={2} align="center" sx={gridHeadCell}>
                          <Field
                            value={values.primaryHeadingAtSanction}
                            onChangeValue={(v) =>
                              set("primaryHeadingAtSanction", v)
                            }
                            placeholder="At the time of sanction Date..."
                          />
                        </TableCell>

                        <TableCell colSpan={2} align="center" sx={gridHeadCell}>
                          <Field
                            value={values.primaryHeadingLatest}
                            onChangeValue={(v) =>
                              set("primaryHeadingLatest", v)
                            }
                            placeholder="Latest Position Date..."
                          />
                        </TableCell>

                        <TableCell
                          rowSpan={2}
                          align="center"
                          sx={{ ...gridHeadCell, width: "14%" }}
                        >
                          If consortium, our share in VOS
                        </TableCell>
                        {!readOnly && !isPrinting && (
                          <TableCell
                            rowSpan={2}
                            align="center"
                            className="no-print-action-cell"
                            sx={{ ...gridHeadCell, width: "6%" }}
                          >
                            Actions
                          </TableCell>
                        )}
                      </TableRow> */}
                      {/* Header Row 1 */}
                      <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                        <TableCell
                          rowSpan={2}
                          sx={{ ...gridHeadCell, width: "40%" }}
                        >
                          Particulars/description of primary security, viz- Land
                          &amp; building of factory, P &amp; M, Stocks/
                          Receivables, etc.
                        </TableCell>

                        {/* At the time of sanction — editable heading */}
                        <TableCell colSpan={2} align="center" sx={gridHeadCell}>
                          <Field
                            value={values.primaryHeadingAtSanction}
                            onChangeValue={(v) =>
                              set("primaryHeadingAtSanction", v)
                            }
                            placeholder="At the time of sanction Date..."
                          />
                        </TableCell>

                        {/* Latest Position — editable heading */}
                        <TableCell colSpan={2} align="center" sx={gridHeadCell}>
                          <Field
                            value={values.primaryHeadingLatest}
                            onChangeValue={(v) =>
                              set("primaryHeadingLatest", v)
                            }
                            placeholder="Latest Position Date..."
                          />
                        </TableCell>

                        <TableCell
                          rowSpan={2}
                          align="center"
                          sx={{ ...gridHeadCell, width: "12%" }}
                        >
                          If consortium, our share in VOS
                        </TableCell>
                        {!readOnly && !isPrinting && (
                          <TableCell
                            rowSpan={2}
                            align="center"
                            className="no-print-action-cell"
                            sx={{ ...gridHeadCell, width: "5%" }}
                          >
                            Actions
                          </TableCell>
                        )}
                      </TableRow>
                      {/* Header Row 2 */}
                      <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                        <TableCell align="center" sx={gridHeadCell}>
                          RV*
                        </TableCell>
                        <TableCell align="center" sx={gridHeadCell}>
                          MV**
                        </TableCell>
                        <TableCell align="center" sx={gridHeadCell}>
                          RV*
                        </TableCell>
                        <TableCell align="center" sx={gridHeadCell}>
                          MV**
                        </TableCell>
                      </TableRow>

                      {/* Data Rows */}
                      {primarySecurities.map((ps, idx) => (
                        <TableRow key={idx}>
                          <TableCell
                            sx={{ p: 0, border: `1px solid ${boiBorder}` }}
                          >
                            <RichField
                              value={ps.description}
                              onChangeValue={(v) =>
                                updatePrimarySecurity(idx, "description", v)
                              }
                              placeholder="Description of primary security"
                              height="120px"
                            />
                          </TableCell>
                          {[
                            "atSanctionRV",
                            "atSanctionMV",
                            "latestRV",
                            "latestMV",
                          ].map((f) => (
                            <TableCell key={f} sx={gridCell}>
                              <GridField
                                value={ps[f]}
                                onChangeValue={(v) =>
                                  updatePrimarySecurity(idx, f, v)
                                }
                                placeholder="Amount"
                              />
                            </TableCell>
                          ))}
                          <TableCell sx={gridCell}>
                            <GridField
                              value={ps.consortiumShareVOS}
                              onChangeValue={(v) =>
                                updatePrimarySecurity(
                                  idx,
                                  "consortiumShareVOS",
                                  v,
                                )
                              }
                              placeholder="Share %"
                            />
                          </TableCell>
                          {!readOnly && !isPrinting && (
                            <TableCell
                              className="no-print-action-cell"
                              sx={{ ...gridCell, textAlign: "center" }}
                            >
                              {primarySecurities.length > 1 && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => removePrimarySecurity(idx)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}

                      {/* Add Row Button */}
                      {!readOnly && !isPrinting && (
                        <TableRow className="no-print">
                          <TableCell
                            colSpan={7}
                            sx={{ border: `1px solid ${boiBorder}`, p: 0.5 }}
                          >
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={addPrimarySecurity}
                              sx={{ textTransform: "none" }}
                            >
                              Add Primary Security
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
                <Box
                  sx={{
                    border: `1px solid ${boiBorder}`,
                    borderTop: "none",
                    borderBottom: "none",
                    p: 1,
                    bgcolor: "#ffffff",
                  }}
                >
                  <RichField
                    value={values.primarySecurityNotes}
                    onChangeValue={(v) => set("primarySecurityNotes", v)}
                    placeholder="Enter comments / details on primary security..."
                    height="120px"
                  />
                </Box>
              </Box>
            </Box>

            {/* ================= Section 11 ================= */}
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 4 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  minWidth: "30px",
                  mt: 0.5,
                }}
              >
                11.
              </Typography>
              <Box sx={{ flex: 1 }}>
                {/* Title Box */}
                <Box
                  sx={{
                    border: `1px solid ${boiBorder}`,
                    borderBottom: "none",
                    bgcolor: boiTableHeaderBg,
                    p: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                      Collateral Security
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                      (Rs. in Cr.)
                    </Typography>
                  </Box>
                  <Typography
                    sx={{ fontSize: 12, fontStyle: "italic", fontWeight: 500 }}
                  >
                    *RV: Realizable Value , **MV : Market Value)
                  </Typography>
                </Box>

                <Box sx={{ overflowX: "auto", width: "100%" }}>
                  <Table
                    size="small"
                    sx={{
                      border: `1px solid ${boiBorder}`,
                      minWidth: 900,
                      tableLayout: "fixed",
                    }}
                  >
                    {" "}
                    <colgroup>
                      <col style={{ width: "5%" }} /> {/* S.No */}
                      <col style={{ width: "40%" }} /> {/* description */}
                      <col style={{ width: "9.75%" }} /> {/* RV* at sanction */}
                      <col style={{ width: "9.75%" }} />{" "}
                      {/* MV** at sanction */}
                      <col style={{ width: "9.75%" }} /> {/* RV* latest */}
                      <col style={{ width: "9.75%" }} /> {/* MV** latest */}
                      <col style={{ width: "11%" }} /> {/* VOS share */}
                      {!readOnly && !isPrinting && (
                        <col style={{ width: "5%" }} />
                      )}
                    </colgroup>
                    <TableBody>
                      {/* <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                        <TableCell
                          rowSpan={2}
                          align="center"
                          sx={{ ...gridHeadCell, width: "5%" }}
                        >
                          S.N
                        </TableCell>
                        <TableCell
                          rowSpan={2}
                          sx={{ ...gridHeadCell, width: "28%" }}
                        >
                          Particulars/description of Collateral security
                        </TableCell>

                        <TableCell colSpan={2} align="center" sx={gridHeadCell}>
                          <Field
                            value={values.collateralHeadingAtSanction}
                            onChangeValue={(v) =>
                              set("collateralHeadingAtSanction", v)
                            }
                            placeholder="At the time of sanction Date…"
                          />
                        </TableCell>

                        <TableCell colSpan={2} align="center" sx={gridHeadCell}>
                          <Field
                            value={values.collateralHeadingLatest}
                            onChangeValue={(v) =>
                              set("collateralHeadingLatest", v)
                            }
                            placeholder="As per latest available Date…."
                          />
                        </TableCell>

                        <TableCell
                          rowSpan={2}
                          align="center"
                          sx={{ ...gridHeadCell, width: "14%" }}
                        >
                          If consortium, our share in VOS
                        </TableCell>
                        {!readOnly && !isPrinting && (
                          <TableCell
                            rowSpan={2}
                            align="center"
                            className="no-print-action-cell"
                            sx={{ ...gridHeadCell, width: "6%" }}
                          >
                            Actions
                          </TableCell>
                        )}
                      </TableRow> */}
                      {/* Header Row 1 */}
                      <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                        <TableCell
                          rowSpan={2}
                          align="center"
                          sx={{ ...gridHeadCell, width: "5%" }}
                        >
                          S.N
                        </TableCell>
                        <TableCell
                          rowSpan={2}
                          sx={{ ...gridHeadCell, width: "40%" }}
                        >
                          Particulars/description of Collateral security
                        </TableCell>

                        {/* At the time of sanction — editable heading */}
                        <TableCell colSpan={2} align="center" sx={gridHeadCell}>
                          <Field
                            value={values.collateralHeadingAtSanction}
                            onChangeValue={(v) =>
                              set("collateralHeadingAtSanction", v)
                            }
                            placeholder="At the time of sanction Date…"
                          />
                        </TableCell>

                        {/* As per latest available — editable heading */}
                        <TableCell colSpan={2} align="center" sx={gridHeadCell}>
                          <Field
                            value={values.collateralHeadingLatest}
                            onChangeValue={(v) =>
                              set("collateralHeadingLatest", v)
                            }
                            placeholder="As per latest available Date…."
                          />
                        </TableCell>

                        <TableCell
                          rowSpan={2}
                          align="center"
                          sx={{ ...gridHeadCell, width: "11%" }}
                        >
                          If consortium, our share in VOS
                        </TableCell>
                        {!readOnly && !isPrinting && (
                          <TableCell
                            rowSpan={2}
                            align="center"
                            className="no-print-action-cell"
                            sx={{ ...gridHeadCell, width: "5%" }}
                          >
                            Actions
                          </TableCell>
                        )}
                      </TableRow>
                      {/* Header Row 2 */}
                      <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                        <TableCell align="center" sx={gridHeadCell}>
                          RV*
                        </TableCell>
                        <TableCell align="center" sx={gridHeadCell}>
                          MV**
                        </TableCell>
                        <TableCell align="center" sx={gridHeadCell}>
                          RV*
                        </TableCell>
                        <TableCell align="center" sx={gridHeadCell}>
                          MV**
                        </TableCell>
                      </TableRow>

                      {/* Data Rows */}
                      {collateralSecurities.map((cs, idx) => (
                        <TableRow key={idx}>
                          <TableCell
                            sx={{
                              ...gridCell,
                              textAlign: "center",
                              fontWeight: 600,
                            }}
                          >
                            {["i", "ii", "iii", "iv", "v"][idx] || idx + 1}
                          </TableCell>
                          <TableCell
                            sx={{ p: 0, border: `1px solid ${boiBorder}` }}
                          >
                            <RichField
                              value={cs.description}
                              onChangeValue={(v) =>
                                updateCollateralSecurity(idx, "description", v)
                              }
                              placeholder="Description of collateral security"
                              height="120px"
                            />
                          </TableCell>
                          {[
                            "atSanctionRV",
                            "atSanctionMV",
                            "latestRV",
                            "latestMV",
                          ].map((f) => (
                            <TableCell key={f} sx={gridCell}>
                              <GridField
                                value={cs[f]}
                                onChangeValue={(v) =>
                                  updateCollateralSecurity(idx, f, v)
                                }
                                placeholder="Amount"
                              />
                            </TableCell>
                          ))}
                          <TableCell sx={gridCell}>
                            <GridField
                              value={cs.consortiumShareVOS}
                              onChangeValue={(v) =>
                                updateCollateralSecurity(
                                  idx,
                                  "consortiumShareVOS",
                                  v,
                                )
                              }
                              placeholder="Share %"
                            />
                          </TableCell>
                          {!readOnly && !isPrinting && (
                            <TableCell
                              className="no-print-action-cell"
                              sx={{ ...gridCell, textAlign: "center" }}
                            >
                              {collateralSecurities.length > 1 && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => removeCollateralSecurity(idx)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}

                      {/* TOTAL Row */}
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          align="center"
                          sx={{ ...gridCell, fontWeight: 700 }}
                        >
                          TOTAL
                        </TableCell>
                        <TableCell sx={gridCell} />
                        <TableCell sx={gridCell} />
                        <TableCell sx={gridCell} />
                        <TableCell sx={gridCell} />
                        <TableCell sx={gridCell} />
                        {!readOnly && !isPrinting && (
                          <TableCell sx={gridCell} />
                        )}
                      </TableRow>

                      {/* Add Row Button */}
                      {!readOnly && !isPrinting && (
                        <TableRow className="no-print">
                          <TableCell
                            colSpan={8}
                            sx={{ border: `1px solid ${boiBorder}`, p: 0.5 }}
                          >
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={addCollateralSecurity}
                              sx={{ textTransform: "none" }}
                            >
                              Add Collateral Security
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
                <Box
                  sx={{
                    border: `1px solid ${boiBorder}`,
                    borderTop: "none",
                    borderBottom: "none",
                    p: 1,
                    bgcolor: "#ffffff",
                  }}
                >
                  <RichField
                    value={values.collateralSecurityNotes}
                    onChangeValue={(v) => set("collateralSecurityNotes", v)}
                    placeholder="Enter comments / details on collateral security..."
                    height="120px"
                  />
                </Box>
              </Box>
            </Box>

            {/* ================= Section 12 ================= */}
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "13px",
                textAlign: "center",
                mt: 3,
                mb: 1,
              }}
            >
              Guarantor(s)
            </Typography>

            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  minWidth: "30px",
                  mt: 0.5,
                }}
              >
                12.
              </Typography>
              <Box sx={{ flex: 1, overflowX: "auto" }}>
                <Table
                  size="small"
                  sx={{
                    border: `1px solid ${boiBorder}`,
                    minWidth: 850,
                    tableLayout: "fixed",
                  }}
                >
                  <TableBody>
                    {/* Header Row */}
                    <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                      <TableCell
                        align="center"
                        sx={{ ...gridHeadCell, width: "6%" }}
                      >
                        S.No.
                      </TableCell>
                      <TableCell sx={{ ...gridHeadCell, width: "24%" }}>
                        Name
                      </TableCell>

                      {/* At the time of sanction — now an editable textfield */}
                      <TableCell
                        align="center"
                        sx={{ ...gridHeadCell, width: "30%" }}
                      >
                        <GridField
                          value={values.guarantorHeadingAtSanction}
                          onChangeValue={(v) =>
                            set("guarantorHeadingAtSanction", v)
                          }
                          placeholder="At the time of sanction Date…"
                        />
                        <Box sx={{ fontWeight: 700, mt: 0.5 }}>NM/NW</Box>
                      </TableCell>

                      {/* As on last available — now an editable textfield */}
                      <TableCell
                        align="center"
                        sx={{ ...gridHeadCell, width: "30%" }}
                      >
                        <GridField
                          value={values.guarantorHeadingLatest}
                          onChangeValue={(v) =>
                            set("guarantorHeadingLatest", v)
                          }
                          placeholder="As on last available Date…"
                        />
                        <Box sx={{ fontWeight: 700, mt: 0.5 }}>NM/NW</Box>
                      </TableCell>

                      {!readOnly && !isPrinting && (
                        <TableCell
                          align="center"
                          className="no-print-action-cell"
                          sx={{ ...gridHeadCell, width: "6%" }}
                        >
                          Actions
                        </TableCell>
                      )}
                    </TableRow>

                    {/* Data Rows */}
                    {guarantors.map((g, idx) => (
                      <TableRow key={idx}>
                        <TableCell
                          sx={{
                            ...gridCell,
                            textAlign: "center",
                            fontWeight: 600,
                          }}
                        >
                          {idx + 1}
                        </TableCell>
                        <TableCell sx={gridCell}>
                          <GridField
                            value={g.name}
                            onChangeValue={(v) =>
                              updateGuarantor(idx, "name", v)
                            }
                            placeholder="Full name"
                          />
                        </TableCell>
                        <TableCell sx={gridCell}>
                          <GridField
                            value={g.nwAtSanction}
                            onChangeValue={(v) =>
                              updateGuarantor(idx, "nwAtSanction", v)
                            }
                            placeholder="Amount"
                          />
                        </TableCell>
                        <TableCell sx={gridCell}>
                          <GridField
                            value={g.nwLatest}
                            onChangeValue={(v) =>
                              updateGuarantor(idx, "nwLatest", v)
                            }
                            placeholder="Amount"
                          />
                        </TableCell>
                        {!readOnly && !isPrinting && (
                          <TableCell
                            className="no-print-action-cell"
                            sx={{ ...gridCell, textAlign: "center" }}
                          >
                            {guarantors.length > 1 && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeGuarantor(idx)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}

                    {/* Add Row Button */}
                    {!readOnly && !isPrinting && (
                      <TableRow className="no-print">
                        <TableCell
                          colSpan={5}
                          sx={{ border: `1px solid ${boiBorder}`, p: 0.5 }}
                        >
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={addGuarantor}
                            sx={{ textTransform: "none" }}
                          >
                            Add Guarantor
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Box>

            {/* ================= Section 13 ================= */}
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 4 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  minWidth: "30px",
                  mt: 0.5,
                }}
              >
                13.
              </Typography>
              <Box sx={{ flex: 1, overflowX: "auto" }}>
                <Table
                  size="small"
                  sx={{
                    border: `1px solid ${boiBorder}`,
                    minWidth: 750,
                    tableLayout: "fixed",
                  }}
                >
                  <colgroup>
                    <col style={{ width: "6%" }} />
                    <col style={{ width: "34%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "48%" }} />
                  </colgroup>
                  <TableBody>
                    {/* Title Row */}
                    <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                      <TableCell
                        colSpan={4}
                        sx={{
                          fontWeight: 700,
                          fontSize: 13,
                          border: `1px solid ${boiBorder}`,
                          py: 0.5,
                          px: 1,
                        }}
                      >
                        Other Details
                      </TableCell>
                    </TableRow>

                    {/* Column Headers */}
                    <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                      <TableCell
                        align="center"
                        sx={{ ...gridHeadCell, width: "6%" }}
                      >
                        S.N.
                      </TableCell>
                      <TableCell sx={{ ...gridHeadCell, width: "60%" }}>
                        Particulars
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ ...gridHeadCell, width: "12%" }}
                      >
                        Yes-No-N/A
                      </TableCell>
                      <TableCell sx={{ ...gridHeadCell, width: "22%" }}>
                        Remarks, if any
                      </TableCell>
                    </TableRow>

                    {/* Data Rows */}
                    {[
                      {
                        sn: "i)",
                        label:
                          "Whether Valid and enforceable EM on IPs has been created? If not, then reasons should be discussed",
                        yesNoField: "validEMCreated",
                        remarksField: "emCreationReason",
                      },
                      {
                        sn: "ii)",
                        label:
                          "Whether creation of charge filed/modified with ROC",
                        yesNoField: "chargeFiledROC",
                        remarksField: "chargeFiledROCRemarks",
                      },
                      {
                        sn: "iii)",
                        label:
                          "Whether creation of charge registered with CERSAI",
                        yesNoField: "chargeRegisteredCERSAI",
                        remarksField: "chargeRegisteredCERSAIRemarks",
                      },
                      {
                        sn: "iv)",
                        label:
                          "Status of compliance of terms & condition of sanction",
                        yesNoField: "sanctionTermsComplied",
                        remarksField: "sanctionTermsCompliedRemarks",
                      },
                    ].map(({ sn, label, yesNoField, remarksField }) => (
                      <TableRow key={sn}>
                        <TableCell
                          align="center"
                          sx={{ ...gridCell, fontWeight: 600 }}
                        >
                          {sn}
                        </TableCell>
                        <TableCell sx={{ ...gridCell, fontSize: 12.5 }}>
                          {label}
                        </TableCell>
                        <TableCell sx={gridCell}>
                          <GridField
                            value={values.otherDetails?.[yesNoField] || ""}
                            onChangeValue={(v) =>
                              setNested("otherDetails", yesNoField, v)
                            }
                            type="select"
                            options={yesNoNAOptions}
                          />
                        </TableCell>
                        <TableCell sx={gridCell}>
                          {remarksField && (
                            <GridField
                              value={values.otherDetails?.[remarksField] || ""}
                              onChangeValue={(v) =>
                                setNested("otherDetails", remarksField, v)
                              }
                              multiline
                              placeholder="Remarks if any"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 4 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  minWidth: "30px",
                  mt: 0.5,
                }}
              >
                14.
              </Typography>
              <Box sx={{ flex: 1, overflowX: "auto" }}>
                <Table
                  size="small"
                  sx={{
                    border: `1px solid ${boiBorder}`,
                    minWidth: 750,
                    tableLayout: "fixed",
                  }}
                >
                  <colgroup>
                    <col style={{ width: "5%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "75%" }} />
                  </colgroup>
                  <TableBody>
                    {/* Title Row */}
                    <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                      <TableCell
                        colSpan={3}
                        sx={{
                          fontWeight: 700,
                          fontSize: 13,
                          border: `1px solid ${boiBorder}`,
                          py: 0.5,
                          px: 1,
                        }}
                      >
                        INSPECTION OF SECURITIES
                      </TableCell>
                    </TableRow>

                    {/* Row i) - Securities inspected */}
                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{
                          ...gridCell,
                          fontWeight: 600,
                          width: "5%",
                          p: 0.5,
                        }}
                      >
                        i)
                      </TableCell>
                      <TableCell sx={{ ...gridCell, width: "20%" }}>
                        When the securities were last inspected and adverse
                        finding if, any
                      </TableCell>
                      <TableCell sx={{ ...gridCell }}>
                        {/* <GridField
                          value={
                            values.inspectionOfSecurities?.lastInspectionDate
                          }
                          onChangeValue={(v) =>
                            setNested(
                              "inspectionOfSecurities",
                              "lastInspectionDate",
                              v,
                            )
                          }
                          type="date"
                        /> */}
                        <Box sx={{ mt: 0.5 }}>
                          <RichField
                            value={
                              values.inspectionOfSecurities?.adverseFindings
                            }
                            onChangeValue={(v) =>
                              setNested(
                                "inspectionOfSecurities",
                                "adverseFindings",
                                v,
                              )
                            }
                            placeholder="Adverse findings, if any"
                            height="100px"
                          />
                        </Box>
                      </TableCell>
                    </TableRow>

                    {/* Row ii) - End use of funds */}
                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{
                          ...gridCell,
                          fontWeight: 600,
                          width: "5%",
                          p: 0.5,
                        }}
                      >
                        ii)
                      </TableCell>
                      <TableCell sx={{ ...gridCell, width: "20%" }}>
                        Whether end use of funds verified
                      </TableCell>
                      <TableCell sx={gridCell}>
                        <GridField
                          value={values.inspectionOfSecurities?.endUseVerified}
                          onChangeValue={(v) =>
                            setNested(
                              "inspectionOfSecurities",
                              "endUseVerified",
                              v,
                            )
                          }
                          placeholder="Enter details"
                        />
                      </TableCell>
                    </TableRow>

                    {/* Row iii) - Last stock audit */}
                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{
                          ...gridCell,
                          fontWeight: 600,
                          width: "5%",
                          p: 0.5,
                        }}
                      >
                        iii)
                      </TableCell>
                      <TableCell sx={{ ...gridCell, width: "20%" }}>
                        Date when last stock audit done and adverse findings if
                        any.
                      </TableCell>
                      <TableCell sx={gridCell}>
                        {/* <GridField
                          value={
                            values.inspectionOfSecurities?.lastStockAuditDate
                          }
                          onChangeValue={(v) =>
                            setNested(
                              "inspectionOfSecurities",
                              "lastStockAuditDate",
                              v,
                            )
                          }
                          type="date"
                        /> */}
                        <Box sx={{ mt: 0.5 }}>
                          <RichField
                            value={
                              values.inspectionOfSecurities?.stockAuditFindings
                            }
                            onChangeValue={(v) =>
                              setNested(
                                "inspectionOfSecurities",
                                "stockAuditFindings",
                                v,
                              )
                            }
                            placeholder="Adverse findings, if any"
                            height="100px"
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </Box>

            {/* ================= Section 15 ================= */}
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  minWidth: "30px",
                  mt: 0.5,
                }}
              >
                15.
              </Typography>
              <Table
                size="small"
                sx={{ border: `1px solid ${boiBorder}`, flex: 1 }}
              >
                <TableBody>
                  <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                    <TableCell
                      sx={{
                        fontSize: 13,
                        border: `1px solid ${boiBorder}`,
                        py: 0.5,
                        px: 1,
                      }}
                    >
                      Reasons attributable to account slipping to NPA should be
                      discussed, comment for steps taken to recover bank's dues.
                      Details of compromise proposal, if any, under
                      consideration, be given)
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                      <RichField
                        value={values.reasonsForNPA}
                        onChangeValue={(v) => set("reasonsForNPA", v)}
                        placeholder="Enter reasons..."
                        height="120px"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {/* ================= Section 16 ================= */}
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  minWidth: "30px",
                  mt: 0.5,
                }}
              >
                16.
              </Typography>
              <Table
                size="small"
                sx={{
                  border: `1px solid ${boiBorder}`,
                  flex: 1,
                  tableLayout: "fixed",
                }}
              >
                <TableBody>
                  <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                    {[
                      "Whether early warning signals identified",
                      "What remedial action taken",
                      "When the account was Red Flagged",
                    ].map((h, i) => (
                      <TableCell
                        key={i}
                        sx={{
                          fontWeight: 700,
                          fontSize: 13,
                          border: `1px solid ${boiBorder}`,
                          py: 0.5,
                          px: 1,
                          width: "33.33%",
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                      <RichField
                        value={values.earlyWarningSignals}
                        onChangeValue={(v) => set("earlyWarningSignals", v)}
                        placeholder="Details"
                        height="120px"
                      />
                    </TableCell>
                    <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                      <RichField
                        value={values.remedialActionTaken}
                        onChangeValue={(v) => set("remedialActionTaken", v)}
                        placeholder="Details"
                        height="120px"
                      />
                    </TableCell>
                    <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                      <RichField
                        value={values.redFlaggedDate}
                        onChangeValue={(v) => set("redFlaggedDate", v)}
                        placeholder="Details"
                        height="120px"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {/* ================= Section 17 ================= */}
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  minWidth: "30px",
                  mt: 0.5,
                }}
              >
                17.
              </Typography>
              <Table
                size="small"
                sx={{
                  border: `1px solid ${boiBorder}`,
                  flex: 1,
                  tableLayout: "fixed",
                }}
              >
                <TableBody>
                  <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: 13,
                        border: `1px solid ${boiBorder}`,
                        py: 0.5,
                        px: 1,
                        width: "50%",
                      }}
                    >
                      When was the Forensic audit done, if any.
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        fontSize: 13,
                        border: `1px solid ${boiBorder}`,
                        py: 0.5,
                        px: 1,
                        width: "50%",
                      }}
                    >
                      Adverse observations
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                      <RichField
                        value={values.forensicAuditDone}
                        onChangeValue={(v) => set("forensicAuditDone", v)}
                        placeholder="Details"
                        height="120px"
                      />
                    </TableCell>
                    <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                      <RichField
                        value={values.forensicAuditObservations}
                        onChangeValue={(v) =>
                          set("forensicAuditObservations", v)
                        }
                        placeholder="Details"
                        height="120px"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {/* ================= Section 18 ================= */}
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  minWidth: "30px",
                  mt: 0.5,
                }}
              >
                18.
              </Typography>
              <Box sx={{ flex: 1 }}>
                <Table
                  size="small"
                  sx={{
                    border: `1px solid ${boiBorder}`,
                    tableLayout: "fixed",
                    width: "100%",
                  }}
                >
                  <TableBody>
                    {/* Title Row */}
                    <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                      <TableCell
                        colSpan={3}
                        align="center"
                        sx={{
                          fontWeight: 700,
                          fontSize: 13,
                          border: `1px solid ${boiBorder}`,
                          py: 0.5,
                          px: 1,
                        }}
                      >
                        Adverse observations on the account by
                      </TableCell>
                    </TableRow>

                    {/* Column Headers */}
                    <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                      {["Auditors", "Valuers", "Advocates"].map((h, i) => (
                        <TableCell
                          key={i}
                          align="center"
                          sx={{
                            fontWeight: 700,
                            fontSize: 13,
                            border: `1px solid ${boiBorder}`,
                            py: 0.5,
                            px: 1,
                            width: "33.33%",
                          }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Data Row */}
                    <TableRow>
                      <TableCell
                        sx={{ p: 0, border: `1px solid ${boiBorder}` }}
                      >
                        <RichField
                          value={values.auditorObservations}
                          onChangeValue={(v) => set("auditorObservations", v)}
                          placeholder="Details"
                          height="120px"
                        />
                      </TableCell>
                      <TableCell
                        sx={{ p: 0, border: `1px solid ${boiBorder}` }}
                      >
                        <RichField
                          value={values.valuerObservations}
                          onChangeValue={(v) => set("valuerObservations", v)}
                          placeholder="Details"
                          height="120px"
                        />
                      </TableCell>
                      <TableCell
                        sx={{ p: 0, border: `1px solid ${boiBorder}` }}
                      >
                        <RichField
                          value={values.advocateObservations}
                          onChangeValue={(v) => set("advocateObservations", v)}
                          placeholder="Details"
                          height="120px"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </Box>

            {/* ================= Section 19 ================= */}
            {/* ================= Section 19 ================= */}
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  minWidth: "30px",
                  mt: 0.5,
                }}
              >
                19.
              </Typography>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 0.5 }}>
                  Recovery Action under SARFAESI
                </Typography>
                <Box sx={{ overflowX: "auto", width: "100%" }}>
                  <Table
                    size="small"
                    sx={{
                      border: `1px solid ${boiBorder}`,
                      minWidth: 800,
                      tableLayout: "fixed",
                    }}
                  >
                    <TableBody>
                      <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: 12.5,
                            border: `1px solid ${boiBorder}`,
                            py: 0.5,
                            px: 1,
                            width: "16%",
                          }}
                        >
                          Date of Issue of notice under 13(2)
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: 12.5,
                            border: `1px solid ${boiBorder}`,
                            py: 0.5,
                            px: 1,
                            width: "16%",
                          }}
                        >
                          Date of issue of notice under 13(4)
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: 12.5,
                            border: `1px solid ${boiBorder}`,
                            py: 0.5,
                            px: 1,
                            width: "16%",
                          }}
                        >
                          Date of taking over possession
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: 12.5,
                            border: `1px solid ${boiBorder}`,
                            py: 0.5,
                            px: 1,
                            width: "16%",
                          }}
                        >
                          Date of filing suit with DRT
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: 12.5,
                            border: `1px solid ${boiBorder}`,
                            py: 0.5,
                            px: 1,
                            width: "36%",
                          }}
                        >
                          Present status
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={gridCell}>
                          <GridField
                            value={values.sarfaesi?.notice13_2Date}
                            onChangeValue={(v) =>
                              setNested("sarfaesi", "notice13_2Date", v)
                            }
                            type="date"
                          />
                        </TableCell>
                        <TableCell sx={gridCell}>
                          <GridField
                            value={values.sarfaesi?.notice13_4Date}
                            onChangeValue={(v) =>
                              setNested("sarfaesi", "notice13_4Date", v)
                            }
                            type="date"
                          />
                        </TableCell>
                        <TableCell sx={gridCell}>
                          <GridField
                            value={values.sarfaesi?.possessionDate}
                            onChangeValue={(v) =>
                              setNested("sarfaesi", "possessionDate", v)
                            }
                            type="date"
                          />
                        </TableCell>
                        <TableCell sx={gridCell}>
                          <GridField
                            value={values.sarfaesi?.drtFilingDate}
                            onChangeValue={(v) =>
                              setNested("sarfaesi", "drtFilingDate", v)
                            }
                            type="date"
                          />
                        </TableCell>
                        <TableCell
                          sx={{ p: 0, border: `1px solid ${boiBorder}` }}
                        >
                          <RichField
                            value={values.sarfaesi?.presentStatus}
                            onChangeValue={(v) =>
                              setNested("sarfaesi", "presentStatus", v)
                            }
                            placeholder="Enter present status..."
                            height="120px"
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            </Box>

            {/* ================= Section 20 ================= */}
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  minWidth: "30px",
                  mt: 0.5,
                }}
              >
                20.
              </Typography>
              <Table
                size="small"
                sx={{ border: `1px solid ${boiBorder}`, flex: 1 }}
              >
                <TableBody>
                  <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                    <TableCell
                      sx={{
                        border: `1px solid ${boiBorder}`,
                        py: 0.5,
                        px: 1,
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                        Scope of recovery
                      </Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                        (Scope of recovery vis-à-vis Primary/ Collateral
                        security and other attachable assets available in the
                        account, whether attachable assets are identified and
                        valued).
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ p: 0, border: `1px solid ${boiBorder}` }}>
                      <RichField
                        value={values.scopeOfRecovery}
                        onChangeValue={(v) => set("scopeOfRecovery", v)}
                        placeholder="Enter scope of recovery..."
                        height="120px"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            <SectionTitle>
              21. Status of CBI Complaint Lodged in the Account Along with
              Status of Permission for Investigation (Sec-17A) and/or
              Prosecution (Sec-19) Sought, if any by CBI
            </SectionTitle>
            <RichField
              value={values.cbiComplaintStatus}
              onChangeValue={(v) => set("cbiComplaintStatus", v)}
              placeholder="Enter status of CBI complaint..."
            />

            {/* ===== PART D ===== */}
            {/* Part C footer — Dated + Chief Vigilance Officer */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                mt: 3,
                mb: 1,
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flex: 1,
                }}
              >
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}
                >
                  Dated:
                </Typography>
                <Box sx={{ minWidth: 180 }}>
                  <Field
                    value={values.partCSignDate}
                    onChangeValue={(v) => set("partCSignDate", v)}
                    type="date"
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flex: 1,
                  minWidth: 260,
                }}
              >
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}
                >
                  Chief Vigilance Officer:
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Field
                    value={values.partCCvoName}
                    onChangeValue={(v) => set("partCCvoName", v)}
                    placeholder="Enter name"
                  />
                </Box>
              </Box>
            </Box>

            {/* Centered Title */}
            <Typography
              className="print-page-break"
              sx={{
                fontWeight: 700,
                fontSize: "14px",
                textAlign: "center",
                my: 3,
              }}
            >
              PART – D
            </Typography>

            {/* Account Info Table */}
            <Table
              size="small"
              sx={{
                border: `1px solid ${boiBorder}`,
                mb: 3,
                tableLayout: "fixed",
              }}
            >
              <TableBody>
                <TableRow>
                  <TableCell
                    sx={{
                      ...labelCell,
                      width: "30%",
                      fontWeight: 700,
                      bgcolor: boiTableHeaderBg,
                    }}
                  >
                    Name of Account
                  </TableCell>
                  <TableCell sx={readOnly ? valueTextView : valueCell}>
                    <Field
                      value={values.accountName}
                      onChangeValue={(v) => set("accountName", v)}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    sx={{
                      ...labelCell,
                      fontWeight: 700,
                      bgcolor: boiTableHeaderBg,
                    }}
                  >
                    Name of the Bank
                  </TableCell>
                  <TableCell sx={readOnly ? valueTextView : valueCell}>
                    <Field
                      value={values.bankName}
                      onChangeValue={(v) => set("bankName", v)}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* Main Details Table */}
            <Box sx={{ overflowX: "auto", width: "100%" }}>
              <Table
                size="small"
                sx={{
                  border: `1px solid ${boiBorder}`,
                  mb: 3,
                  minWidth: 750,
                  tableLayout: "fixed",
                }}
              >
                <TableBody>
                  {/* Header Row */}
                  <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                    <TableCell
                      align="center"
                      sx={{ ...gridHeadCell, width: "6%" }}
                    >
                      S. No.
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ ...gridHeadCell, width: "69%" }}
                    >
                      Particulars
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ ...gridHeadCell, width: "25%" }}
                    >
                      Details
                    </TableCell>
                  </TableRow>

                  {/* Row 1 */}
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ ...gridCell, fontWeight: 600 }}
                    >
                      1
                    </TableCell>
                    <TableCell sx={gridCell}>
                      Date on which FMR was filed in the account.
                    </TableCell>
                    <TableCell sx={gridCell}>
                      <GridField
                        value={values.fmrFiledDate}
                        onChangeValue={(v) => set("fmrFiledDate", v)}
                        type="date"
                      />
                    </TableCell>
                  </TableRow>

                  {/* Row 2 — now a free-text field */}
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ ...gridCell, fontWeight: 600 }}
                    >
                      2
                    </TableCell>
                    <TableCell sx={gridCell}>
                      Whether complaint with CBI/ State Police has been
                      registered in the case or not,{" "}
                      <strong>as applicable?</strong>
                    </TableCell>
                    <TableCell sx={gridCell}>
                      <GridField
                        value={values.cbiComplaintRegistered}
                        onChangeValue={(v) => set("cbiComplaintRegistered", v)}
                        placeholder="Enter details"
                      />
                    </TableCell>
                  </TableRow>

                  {/* Row 2.a — always shown */}
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ ...gridCell, fontWeight: 600 }}
                    >
                      2.a
                    </TableCell>
                    <TableCell sx={gridCell}>
                      If reply to point no. 2 above is 'Yes', Registration
                      number be also given.
                      <Box
                        component="span"
                        sx={{
                          display: "inline-block",
                          mt: 1,
                          ml: 1,
                          fontWeight: 600,
                        }}
                      >
                        Registration Number: _______________________
                      </Box>
                    </TableCell>
                    <TableCell sx={gridCell}>
                      <GridField
                        value={values.cbiRegistrationNumber}
                        onChangeValue={(v) => set("cbiRegistrationNumber", v)}
                        placeholder="Registration Number"
                      />
                    </TableCell>
                  </TableRow>

                  {/* Row 3 */}
                  {/* Row 3 — Yes/No select + Remarks */}
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ ...gridCell, fontWeight: 600 }}
                    >
                      3
                    </TableCell>
                    <TableCell sx={gridCell}>
                      Matter regarding issuance of Show Cause Notice (SCN) in
                      the account by the Bank, in compliance with principles of
                      natural justice has been duly complied with (in terms of
                      Hon'ble Supreme Court's judgement dated 27.03.23/ RBI
                      Master directions)
                    </TableCell>
                    <TableCell sx={gridCell}>
                      <GridField
                        value={values.scnComplied}
                        onChangeValue={(v) => set("scnComplied", v)}
                        type="select"
                        options={yesNoOptions}
                      />
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          sx={{
                            fontSize: 11,
                            fontWeight: 600,
                            mb: 0.5,
                            fontFamily: "Arial",
                          }}
                        >
                          Remarks
                        </Typography>
                        <GridField
                          value={values.scnCompliedRemarks}
                          onChangeValue={(v) => set("scnCompliedRemarks", v)}
                          multiline
                          placeholder="Enter remarks"
                        />
                      </Box>
                    </TableCell>
                  </TableRow>

                  {/* Row 4 */}
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ ...gridCell, fontWeight: 600 }}
                    >
                      4
                    </TableCell>
                    <TableCell sx={gridCell}>
                      In case, upon reconsideration, the account is again
                      classified as fraud, the new date on which FMR was filed.
                    </TableCell>
                    <TableCell sx={gridCell}>
                      <GridField
                        value={values.reclassifiedFraudDate}
                        onChangeValue={(v) => set("reclassifiedFraudDate", v)}
                        // type="date"
                        placeholder="Enter date / details"
                      />
                    </TableCell>
                  </TableRow>

                  {/* Row 5 — now a free-text field */}
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ ...gridCell, fontWeight: 600 }}
                    >
                      5
                    </TableCell>
                    <TableCell sx={gridCell}>
                      Whether the case was submitted to ABBFF earlier.
                    </TableCell>
                    <TableCell sx={gridCell}>
                      <GridField
                        value={values.submittedToABBFFBefore}
                        onChangeValue={(v) => set("submittedToABBFFBefore", v)}
                        placeholder="Enter details"
                      />
                    </TableCell>
                  </TableRow>

                  {/* Row 6 — always shown */}
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ ...gridCell, fontWeight: 600 }}
                    >
                      6
                    </TableCell>
                    <TableCell sx={gridCell}>
                      If reply to point no. 5 above is 'Yes', the date of such
                      ABBFF advice.
                    </TableCell>
                    <TableCell sx={gridCell}>
                      <GridField
                        value={values.previousABBFFAdviceDate}
                        onChangeValue={(v) => set("previousABBFFAdviceDate", v)}
                        // type="date"
                        placeholder="Enter date / details"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {/* Bottom Sign-off */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 4,
                mb: 2,
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                Chief Vigilance Officer
              </Typography>
            </Box>

            {/* ===== APPENDIX ===== */}
            <PartBanner tag="APPENDIX" />
            <Typography sx={{ fontSize: 13, mb: 1 }}>
              Details of lapses identified against the erring officials
              (employee-wise)
            </Typography>
            <RichField
              value={values.appendixLapses}
              onChangeValue={(v) => set("appendixLapses", v)}
              placeholder="Enter details of lapses identified against the erring officials (employee-wise)..."
              height="220px"
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                  Chief Vigilance Officer
                </Typography>
              </Box>
            </Box>

            {/* Activity History for Print Mode */}
            {isPrinting && activityLogs?.length > 0 && (
              <Box
                sx={{ mt: 3, pageBreakBefore: "always", breakBefore: "page" }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "14px",
                    mb: 1.5,
                    fontFamily: "Arial",
                  }}
                >
                  Activity Log
                </Typography>
                <Table
                  size="small"
                  sx={{
                    border: "1px solid #000000",
                    borderCollapse: "collapse",
                    width: "100%",
                  }}
                >
                  <TableHead>
                    <TableRow sx={{ bgcolor: boiTableHeaderBg }}>
                      {[
                        "Action",
                        "Performed By",
                        "Role",
                        "Date & Time",
                        "Remarks",
                        "Signature",
                      ].map((h, i) => (
                        <TableCell
                          key={i}
                          sx={{
                            fontWeight: 700,
                            fontSize: 11,
                            border: "1px solid #000000",
                            fontFamily: "Arial",
                            p: 0.8,
                          }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activityLogs.map((log, idx) => (
                      <TableRow key={idx}>
                        <TableCell
                          sx={{
                            fontSize: 11,
                            border: "1px solid #000000",
                            fontFamily: "Arial",
                            p: 0.8,
                          }}
                        >
                          {log.action || log.status || "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: 11,
                            border: "1px solid #000000",
                            fontFamily: "Arial",
                            p: 0.8,
                          }}
                        >
                          {log.name ||
                            log.performedBy ||
                            log.userName ||
                            log.user ||
                            "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: 11,
                            border: "1px solid #000000",
                            fontFamily: "Arial",
                            p: 0.8,
                          }}
                        >
                          {log.wfCurrentRoleAssign || log.role || "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: 11,
                            border: "1px solid #000000",
                            fontFamily: "Arial",
                            p: 0.8,
                          }}
                        >
                          {log.approvalTime ||
                            formatDate(
                              log.createdAt || log.timestamp || log.date,
                            ) ||
                            "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: 11,
                            border: "1px solid #000000",
                            fontFamily: "Arial",
                            p: 0.8,
                          }}
                        >
                          {log.remarks || log.comment || "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: 11,
                            border: "1px solid #000000",
                            fontFamily: "Arial",
                            p: 0.8,
                            minWidth: 100,
                          }}
                        />
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Paper>
        </Box>

        {/* ===== ACTION BAR ===== */}
        {!isPrinting && (
          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<PrintIcon />}
              onClick={performPrint}
              sx={{ textTransform: "none", borderRadius: "10px", px: 4 }}
            >
              Print
            </Button>
          </Box>
        )}
      </FormContext.Provider>
    );
  },
);

export default ABBFFFormTab;
