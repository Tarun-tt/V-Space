import React from "react";

const { useState, useRef, useEffect, useCallback, memo } = React;

/* ============================================================================
   INTERNAL STYLES
   ============================================================================ */
const RTE_STYLES = `
.rte-scope {
  --bg-primary: #ffffff; --bg-secondary: #f8f9fb; --bg-tertiary: #edf1f4;
  --text-primary: #1c2530; --text-secondary: #67737e; --border-color: #dde3e8;
  --accent: #007DC5; --accent-hover: #0069a8; --accent-soft: rgba(0, 125, 197, 0.1);
  --button-hover: #eef4f9; --button-active: #e0ecf4;
  --error-color: #d1403f; --success-color: #1a8f5e; --warning-color: #b8721b;
  --shadow-sm: 0 1px 2px rgba(16, 24, 32, 0.06);
  --shadow-md: 0 6px 16px rgba(16, 24, 32, 0.1);
  --shadow-lg: 0 20px 40px rgba(16, 24, 32, 0.18);
  --placeholder-color: #9aa5af; --link-color: #007DC5; --code-bg: #f1f4f7;
  --blockquote-border: #007DC5; --radius: 8px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
  color: var(--text-primary);
}
.rte-scope[data-theme="dark"] {
  --bg-primary: #14181d; --bg-secondary: #1b2027; --bg-tertiary: #232a33;
  --text-primary: #e7ecf1; --text-secondary: #99a4af; --border-color: #2c343d;
  --accent: #3ba7e8; --accent-hover: #5fb9ef; --accent-soft: rgba(59, 167, 232, 0.16);
  --button-hover: #232b34; --button-active: #2b3540;
  --placeholder-color: #5c6773; --code-bg: #1f252c; --blockquote-border: #3ba7e8;
  --shadow-sm: 0 1px 2px rgba(0,0,0,.3); --shadow-md: 0 6px 16px rgba(0,0,0,.35);
  --shadow-lg: 0 20px 40px rgba(0,0,0,.5);
}
.rte-scope * { box-sizing: border-box; }
.rte-wrapper { width: 100%; max-width: 100%; }
.MsoNormalTable { margin-left: 0 !important; }
.rte-wrapper.fullscreen {
  position: fixed; inset: 0; z-index: 2000; padding: 20px;
  background: rgba(10,14,18,.55); display: flex; align-items: stretch;
  backdrop-filter: blur(2px); overflow: hidden;
}
.rte-wrapper.fullscreen .rte-container { flex: 1; max-height: none; box-shadow: var(--shadow-lg); }
.rte-wrapper.fullscreen .rte-editor { max-height: none; flex: 1; }
.rte-label { display: block; font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; letter-spacing: 0.01em; }
.rte-label-required::after { content: " *"; color: var(--error-color); }
.rte-container {
  display: flex; flex-direction: column; width: 100%;
  background-color: var(--bg-primary); border: 1px solid var(--border-color);
  border-radius: var(--radius); overflow: visible; box-shadow: var(--shadow-sm);
  transition: box-shadow .2s ease, border-color .2s ease;
}
.rte-container.focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft), var(--shadow-md); }
.rte-container.error { border-color: var(--error-color); }
.rte-container.disabled { opacity: .6; pointer-events: none; }

.rte-toolbar {
  display: flex; flex-wrap: wrap; align-items: center; gap: 4px;
  padding: 10px 12px;
  background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  border-bottom: 3px solid #007DC5;
  position: sticky; top: 0; z-index: 100;
}
.rte-toolbar-group { display: flex; align-items: center; gap: 3px; padding-right: 8px; margin-right: 4px; border-right: 1px solid var(--border-color); }
.rte-toolbar-group:last-child { border-right: none; margin-right: 0; padding-right: 0; }
.rte-toolbar-spacer { flex: 1; }

.rte-btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 30px; height: 30px; padding: 4px 8px;
  border: 1px solid transparent; border-radius: 6px;
  background: transparent; color: var(--text-primary);
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: background-color .12s ease, transform .08s ease; user-select: none;
}
.rte-btn:hover:not(:disabled) { background-color: var(--button-hover); }
.rte-btn:active:not(:disabled) { background-color: var(--button-active); transform: scale(.96); }
.rte-btn.active { background-color: var(--accent); color: #ffffff; }
.rte-btn:disabled { opacity: .35; cursor: not-allowed; }
.rte-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.rte-btn-highlight { background: linear-gradient(180deg, #fff3b0, #ffe066); color: #4a3800; border: 1px solid #e0c34a; }
.rte-btn-highlight.active { background: #ffcd39; color: #4a3800; }

.rte-select {
  height: 30px; padding: 4px 8px;
  border: 1px solid var(--border-color); border-radius: 6px;
  background-color: var(--bg-primary); color: var(--text-primary);
  font-size: 13px; cursor: pointer; max-width: 140px;
}
.rte-select:hover { border-color: var(--accent); }
.rte-select:focus { outline: 2px solid var(--accent-soft); border-color: var(--accent); }

.rte-color-picker { position: relative; display: inline-flex; }
.rte-color-input {
  width: 30px; height: 30px;
  border: 1px solid var(--border-color); border-radius: 6px;
  cursor: pointer; background: transparent; padding: 2px;
}
.rte-color-input::-webkit-color-swatch-wrapper { padding: 0; }
.rte-color-input::-webkit-color-swatch { border: none; border-radius: 4px; }

/* ---------------------------------------------------------------------------
   FIX 1 — BOLD, HIGH-VISIBILITY CURSOR INSIDE THE EDITOR
   • A thick, accent-coloured caret is always visible.
   • A bold I-beam mouse cursor replaces the default thin text cursor.
   --------------------------------------------------------------------------- */
.rte-editor {
  min-height: 300px; overflow-y: auto; padding: 18px 20px;
  font-size: 15px; line-height: 1.65;
  color: var(--text-primary); background-color: var(--bg-primary);
  outline: none; word-wrap: break-word; overflow-wrap: break-word; position: relative;
  caret-color: var(--accent);
  cursor: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='24'%20height='30'%20viewBox='0%200%2024%2030'%3E%3Cpath%20d='M5%201h14v4h-5v20h5v4H5v-4h5V5H5V1z'%20fill='%23000000'%20stroke='%23ffffff'%20stroke-width='1.5'%20stroke-linejoin='round'/%3E%3C/svg%3E") 12 15, text;
}
.rte-editor[contenteditable="false"] p:empty { display: none; margin: 0; padding: 0; }
.rte-editor[contenteditable="false"] p > br:only-child { line-height: 0; font-size: 0; margin: 0; padding: 0; display: block; height: 0; }
.rte-editor[contenteditable="false"] .rte-table-wrapper + p:has(> br:only-child) { display: none; margin: 0; padding: 0; }
.rte-editor[contenteditable="true"]:empty::before { content: attr(data-placeholder); color: var(--placeholder-color); pointer-events: none; }
.rte-editor h1 { font-size: 2em; font-weight: 700; margin: .5em 0; line-height: 1.2; }
.rte-editor h2 { font-size: 1.7em; font-weight: 700; margin: .5em 0; line-height: 1.2; }
.rte-editor h3 { font-size: 1.45em; font-weight: 600; margin: .5em 0; line-height: 1.3; }
.rte-editor h4 { font-size: 1.2em; font-weight: 600; margin: .5em 0; line-height: 1.3; }
.rte-editor h5 { font-size: 1.08em; font-weight: 600; margin: .5em 0; line-height: 1.4; }
.rte-editor h6 { font-size: 1em; font-weight: 600; margin: .5em 0; line-height: 1.4; }
.rte-editor p { margin: .5em 0; }
.rte-editor ul, .rte-editor ol { margin: .5em 0; padding-left: 1.7em; }
.rte-editor li { margin: .25em 0; }
.rte-editor a { color: var(--link-color); text-decoration: underline; cursor: pointer; }
.rte-editor a:hover { opacity: .8; }
.rte-editor mark { background-color: #ffe066; color: inherit; border-radius: 2px; padding: 0 1px; }
.rte-editor hr { border: none; border-top: 2px solid var(--border-color); margin: 1.4em 0; }
.rte-editor img { max-width: 100%; height: auto; display: block; margin: 1em 0; border-radius: 6px; cursor: pointer; transition: outline .1s ease; }
.rte-editor img.selected { outline: 2px solid var(--accent); outline-offset: 2px; }
.rte-editor table { border-collapse: collapse !important; width: 100%; margin: 1em 0; border: 1px solid #000000 !important; table-layout: auto; }
.rte-editor table td, .rte-editor table th { min-width: 24px; word-break: break-word; overflow: visible; }
.rte-editor table td, .rte-editor table th { border: 1px solid #000000 !important; padding: 4px 6px; text-align: left; position: relative; }
.rte-editor table th { background-color: var(--bg-secondary); font-weight: 600; }

/* --------------------------------------------------------------------------
   TABLE-ADJACENT PARAGRAPHS
   Force text immediately before/after any table wrapper to sit at the left
   edge of the editor, no matter how the table is resized / indented.
   -------------------------------------------------------------------------- */
.rte-editor .rte-table-wrapper + p,
.rte-editor .rte-table-wrapper + div,
.rte-editor .rte-table-wrapper + h1,
.rte-editor .rte-table-wrapper + h2,
.rte-editor .rte-table-wrapper + h3,
.rte-editor .rte-table-wrapper + h4,
.rte-editor .rte-table-wrapper + h5,
.rte-editor .rte-table-wrapper + h6,
.rte-editor .rte-table-wrapper + ul,
.rte-editor .rte-table-wrapper + ol,
.rte-editor .rte-table-wrapper + blockquote,
.rte-editor .rte-table-wrapper + pre,
.rte-readonly-content .rte-table-wrapper + p,
.rte-readonly-content .rte-table-wrapper + div,
.rte-readonly-content .rte-table-wrapper + h1,
.rte-readonly-content .rte-table-wrapper + h2,
.rte-readonly-content .rte-table-wrapper + h3,
.rte-readonly-content .rte-table-wrapper + h4,
.rte-readonly-content .rte-table-wrapper + h5,
.rte-readonly-content .rte-table-wrapper + h6 {
  margin-left: 0 !important;
  text-indent: 0 !important;
  padding-left: 0 !important;
  width: auto !important;
  max-width: 100% !important;
}
.rte-editor p:has(+ .rte-table-wrapper),
.rte-editor div:has(+ .rte-table-wrapper),
.rte-editor h1:has(+ .rte-table-wrapper),
.rte-editor h2:has(+ .rte-table-wrapper),
.rte-editor h3:has(+ .rte-table-wrapper),
.rte-editor h4:has(+ .rte-table-wrapper),
.rte-editor h5:has(+ .rte-table-wrapper),
.rte-editor h6:has(+ .rte-table-wrapper) {
  margin-left: 0 !important;
  text-indent: 0 !important;
  padding-left: 0 !important;
}

.rte-readonly-content { font-size: 15px; line-height: 1.65; color: #1c2530; word-wrap: break-word; overflow-wrap: break-word; }
.rte-readonly-content h1 { font-size: 2em; font-weight: 700; margin: .5em 0; line-height: 1.2; }
.rte-readonly-content h2 { font-size: 1.7em; font-weight: 700; margin: .5em 0; line-height: 1.2; }
.rte-readonly-content h3 { font-size: 1.45em; font-weight: 600; margin: .5em 0; line-height: 1.3; }
.rte-readonly-content h4 { font-size: 1.2em; font-weight: 600; margin: .5em 0; line-height: 1.3; }
.rte-readonly-content h5 { font-size: 1.08em; font-weight: 600; margin: .5em 0; line-height: 1.4; }
.rte-readonly-content h6 { font-size: 1em; font-weight: 600; margin: .5em 0; line-height: 1.4; }
.rte-readonly-content p { margin: .5em 0; }
.rte-readonly-content ul, .rte-readonly-content ol { margin: .5em 0; padding-left: 1.7em; }
.rte-readonly-content li { margin: .25em 0; }
.rte-readonly-content a { color: #007DC5; text-decoration: underline; }
.rte-readonly-content mark { background-color: #ffe066; color: inherit; border-radius: 2px; padding: 0 1px; }
.rte-readonly-content hr { border: none; border-top: 2px solid #dde3e8; margin: 1.4em 0; }
.rte-readonly-content img { max-width: 100%; height: auto; display: block; margin: 1em 0; border-radius: 6px; }
.rte-readonly-content blockquote { margin: 1em 0; padding: 10px 16px; border-left: 4px solid #007DC5; background-color: #f8f9fb; font-style: italic; border-radius: 0 6px 6px 0; }
.rte-readonly-content pre { margin: 1em 0; padding: 12px 16px; background-color: #f1f4f7; border: 1px solid #dde3e8; border-radius: 6px; overflow-x: auto; font-family: "SFMono-Regular", Consolas, "Courier New", monospace; font-size: 13.5px; line-height: 1.5; }
.rte-readonly-content code { background-color: #f1f4f7; padding: 2px 6px; border-radius: 4px; font-family: "SFMono-Regular", Consolas, "Courier New", monospace; font-size: 13px; }
.rte-readonly-content { overflow: visible; }
.rte-readonly-content .rte-table-wrapper { overflow: visible !important; }
.rte-readonly-content table { border-collapse: collapse !important; width: 100%; margin: .5em 0; border: 1px solid #000000 !important; table-layout: fixed; }
.rte-readonly-content table td, .rte-readonly-content table th { border: 1px solid #000000 !important; padding: 6px 10px; text-align: left; vertical-align: top; word-break: break-word; overflow-wrap: break-word; }
.rte-readonly-content table th { background-color: #f8f9fb; font-weight: 600; }
.rte-readonly-content .rte-table-wrapper + p:not(:empty) { margin-top: .25em; }
.rte-readonly-content p:empty { display: none; margin: 0; padding: 0; }
.rte-readonly-content p > br:only-child { line-height: 0; font-size: 0; margin: 0; padding: 0; display: block; height: 0; }
.rte-readonly-content .rte-table-wrapper + p > br:only-child { display: none; }
.rte-readonly-content .rte-table-wrapper + p:has(> br:only-child) { display: none; margin: 0; padding: 0; }

.rte-editor blockquote { margin: 1em 0; padding: 10px 16px; border-left: 4px solid var(--blockquote-border); background-color: var(--bg-secondary); font-style: italic; border-radius: 0 6px 6px 0; }
.rte-editor pre { margin: 1em 0; padding: 12px 16px; background-color: var(--code-bg); border: 1px solid var(--border-color); border-radius: 6px; overflow-x: auto; font-family: "SFMono-Regular", Consolas, "Courier New", monospace; font-size: 13.5px; line-height: 1.5; }
.rte-editor code { background-color: var(--code-bg); padding: 2px 6px; border-radius: 4px; font-family: "SFMono-Regular", Consolas, "Courier New", monospace; font-size: 13px; }

.rte-table-wrapper { overflow-x: visible; margin-top: 1em; margin-bottom: 0; margin-right: 0; position: relative; display: block; max-width: 100%; box-sizing: border-box; padding: 0; clear: both; }
.rte-table-wrapper table { margin: 0; width: 100%; max-width: 100%; }
.rte-table-wrapper .rte-table-resize-handle { position: absolute; top: 0; right: -5px; width: 10px; height: 100%; cursor: ew-resize; z-index: 10; background: transparent; transition: background .15s; }
.rte-table-wrapper:hover .rte-table-resize-handle, .rte-table-wrapper .rte-table-resize-handle:hover { background: linear-gradient(to right, transparent 4px, var(--accent) 4px, var(--accent) 6px, transparent 6px); }
.rte-table-wrapper .rte-table-resize-handle-left { position: absolute; top: 0; left: -5px; width: 10px; height: 100%; cursor: ew-resize; z-index: 10; background: transparent; transition: background .15s; }
.rte-table-wrapper:hover .rte-table-resize-handle-left, .rte-table-wrapper .rte-table-resize-handle-left:hover { background: linear-gradient(to left, transparent 4px, var(--accent) 4px, var(--accent) 6px, transparent 6px); }
.rte-table-wrapper .rte-table-resize-handle-bottom { position: absolute; bottom: 0; left: 0; width: 100%; height: 6px; cursor: ns-resize; z-index: 10; border-radius: 0 0 3px 3px; background: transparent; transition: background .15s; }
.rte-table-wrapper:hover .rte-table-resize-handle-bottom { background: var(--accent-soft); border-bottom: 2px solid var(--accent); }
.rte-readonly-content .rte-table-resize-handle, .rte-readonly-content .rte-table-resize-handle-left, .rte-readonly-content .rte-table-resize-handle-bottom { display: none !important; }
.rte-editor table td.rte-cell-selected, .rte-editor table th.rte-cell-selected { background-color: var(--accent-soft) !important; outline: 1.5px solid var(--accent); outline-offset: -1.5px; }

.rte-table-toolbar {
  position: fixed; display: flex; flex-wrap: wrap; align-items: center; gap: 2px;
  padding: 4px 6px; background-color: var(--bg-primary);
  border: 1px solid var(--border-color); border-radius: 8px;
  box-shadow: var(--shadow-md); z-index: 2500;
  max-width: calc(100vw - 16px); box-sizing: border-box; overflow-x: auto;
}
.rte-table-toolbar .rte-btn { min-width: 28px; height: 28px; font-size: 12px; white-space: nowrap; }
.rte-table-toolbar-divider { width: 1px; align-self: stretch; margin: 4px 2px; background-color: var(--border-color); flex-shrink: 0; }
@media (max-width: 600px) {
  .rte-table-toolbar { padding: 4px; gap: 1px; }
  .rte-table-toolbar .rte-btn { min-width: 26px; height: 26px; font-size: 11px; padding: 2px 4px; }
}

.rte-bubble-toolbar {
  position: fixed; display: flex; align-items: center; gap: 2px;
  padding: 4px 6px; background: var(--bg-primary);
  border: 1px solid var(--border-color); border-radius: 8px;
  box-shadow: var(--shadow-md); z-index: 2600;
  animation: rteBubbleIn .12s ease;
}
@keyframes rteBubbleIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.rte-bubble-toolbar .rte-btn { min-width: 28px; height: 28px; font-size: 12px; }
.rte-bubble-toolbar-divider { width: 1px; height: 20px; background: var(--border-color); margin: 0 3px; }

.rte-image-toolbar {
  position: fixed; display: flex; align-items: center; gap: 2px;
  padding: 4px 6px; background: var(--bg-primary);
  border: 1px solid var(--border-color); border-radius: 8px;
  box-shadow: var(--shadow-md); z-index: 2600;
}
.rte-image-toolbar .rte-btn { min-width: 28px; height: 28px; font-size: 12px; }

.rte-source-view {
  width: 100%; min-height: 300px; padding: 18px 20px;
  font-family: "SFMono-Regular", Consolas, "Courier New", monospace;
  font-size: 13px; line-height: 1.6;
  background: var(--code-bg); color: var(--text-primary);
  border: none; outline: none; resize: vertical; white-space: pre; overflow: auto;
}

.rte-textinfo-bar {
  display: flex; flex-wrap: wrap; align-items: center; gap: 12px;
  padding: 7px 14px; background: var(--bg-tertiary);
  border-top: 1px solid var(--border-color);
  font-size: 12px; color: var(--text-secondary);
  position: sticky; bottom: 0; z-index: 5;
  backdrop-filter: blur(4px);
}
.rte-textinfo-item { display: inline-flex; align-items: center; gap: 6px; }
.rte-textinfo-label {
  font-size: 10px; text-transform: uppercase; letter-spacing: .06em;
  color: var(--text-secondary); font-weight: 700; opacity: .75;
}
.rte-textinfo-value {
  font-family: "SFMono-Regular", Consolas, "Courier New", monospace;
  font-size: 12px; color: var(--text-primary);
  background: var(--bg-primary); padding: 2px 7px;
  border-radius: 4px; border: 1px solid var(--border-color);
  max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.rte-textinfo-value.empty { opacity: .5; font-style: italic; }
.rte-textinfo-chips { display: inline-flex; gap: 3px; }
.rte-textinfo-chip {
  min-width: 20px; height: 20px; padding: 0 6px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 4px; background: var(--bg-primary);
  border: 1px solid var(--border-color);
  font-size: 11px; font-weight: 700; color: var(--text-secondary);
  transition: all .1s ease;
}
.rte-textinfo-chip.active {
  background: var(--accent); color: #fff; border-color: var(--accent);
}
.rte-textinfo-swatch {
  width: 14px; height: 14px; border-radius: 3px;
  border: 1px solid var(--border-color); display: inline-block;
}

.rte-status-bar { display: flex; justify-content: space-between; align-items: center; padding: 8px 14px; background-color: var(--bg-secondary); border-top: 1px solid var(--border-color); font-size: 12px; color: var(--text-secondary); }
.rte-status-info { display: flex; gap: 16px; align-items: center; }
.rte-status-info .over-limit { color: var(--error-color); font-weight: 600; }
.rte-status-info .near-limit { color: var(--warning-color); font-weight: 600; }
.rte-toast { font-size: 12px; padding: 3px 10px; border-radius: 999px; background: var(--success-color); color: #fff; animation: rteFade 1.8s ease forwards; }
@keyframes rteFade { 0% { opacity: 0; transform: translateY(2px); } 10% { opacity: 1; transform: translateY(0); } 80% { opacity: 1; } 100% { opacity: 0; } }
.rte-error { display: block; margin-top: 6px; font-size: 13px; color: var(--error-color); }

.rte-modal-overlay { position: fixed; inset: 0; background-color: rgba(10,14,18,.5); display: flex; align-items: center; justify-content: center; z-index: 3000; animation: rteFadeIn .15s ease; }
@keyframes rteFadeIn { from { opacity: 0; } to { opacity: 1; } }
.rte-modal { background-color: var(--bg-primary); border-radius: 10px; padding: 22px; max-width: 440px; width: 90%; box-shadow: var(--shadow-lg); border: 1px solid var(--border-color); animation: rteSlideUp .18s ease; max-height: 90vh; overflow-y: auto; }
.rte-modal-wide { max-width: 560px; }
@keyframes rteSlideUp { from { transform: translateY(14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.rte-modal-header { font-size: 16px; font-weight: 700; margin-bottom: 14px; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
.rte-modal-header::before { content: ""; width: 4px; height: 16px; background: var(--accent); border-radius: 2px; display: inline-block; }
.rte-modal-header.danger::before { background: var(--error-color); }
.rte-modal-body { margin-bottom: 16px; }
.rte-modal-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 5px; color: var(--text-secondary); }
.rte-modal-input { width: 100%; padding: 8px 10px; border: 1px solid var(--border-color); border-radius: 6px; background-color: var(--bg-primary); color: var(--text-primary); font-size: 14px; margin-bottom: 12px; }
.rte-modal-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.rte-modal-row { display: flex; gap: 10px; }
.rte-modal-row .rte-modal-input { flex: 1; }
.rte-modal-footer { display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
.rte-modal-btn { padding: 8px 16px; border: 1px solid transparent; border-radius: 6px; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: opacity .12s ease; }
.rte-modal-btn-primary { background-color: var(--accent); color: #ffffff; }
.rte-modal-btn-primary:hover { opacity: .9; }
.rte-modal-btn-primary:disabled { opacity: .4; cursor: not-allowed; }
.rte-modal-btn-secondary { background-color: var(--bg-secondary); color: var(--text-primary); border-color: var(--border-color); }
.rte-modal-btn-secondary:hover { background-color: var(--bg-tertiary); }
.rte-modal-btn-ghost { background: transparent; color: var(--text-secondary); }
.rte-modal-btn-ghost:hover { color: var(--text-primary); }
.rte-fr-count { font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; }

.rte-security-list {
  list-style: none; padding: 0; margin: 10px 0 0;
  display: flex; flex-wrap: wrap; gap: 6px;
}
.rte-security-tag {
  background: rgba(209, 64, 63, 0.1); color: var(--error-color);
  border: 1px solid rgba(209, 64, 63, 0.3);
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 12px; padding: 3px 8px; border-radius: 4px;
}
.rte-security-icon {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(209, 64, 63, 0.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; flex-shrink: 0;
}
.rte-security-header-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.rte-security-header-wrap .rte-modal-header { margin-bottom: 0; }

.rte-img-drop-zone {
  border: 2px dashed var(--border-color); border-radius: 8px; padding: 20px;
  text-align: center; color: var(--text-secondary); font-size: 13px;
  cursor: pointer; margin-bottom: 12px; transition: all .15s;
}
.rte-img-drop-zone:hover, .rte-img-drop-zone.dragover { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
.rte-img-preview { max-width: 100%; max-height: 160px; border-radius: 6px; margin-top: 8px; display: block; }

.rte-shortcut-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; }
.rte-shortcut-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 4px 0; border-bottom: 1px dashed var(--border-color); }
.rte-shortcut-key { font-family: monospace; background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-color); font-size: 11px; }

@media (max-width: 768px) {
  .rte-toolbar { padding: 8px; }
  .rte-btn { min-width: 34px; height: 34px; touch-action: manipulation; }
  .rte-editor { font-size: 16px; padding: 14px; }
  .rte-modal { width: 95%; padding: 18px; }
  .rte-shortcut-grid { grid-template-columns: 1fr; }
  .rte-textinfo-bar { gap: 8px; padding: 6px 10px; font-size: 11px; }
}
@media (max-width: 480px) {
  .rte-toolbar-group { border-right: none; }
  .rte-status-bar { flex-direction: column; align-items: flex-start; gap: 6px; }
}
@media print {
  .rte-toolbar, .rte-status-bar, .rte-table-toolbar, .rte-bubble-toolbar, .rte-image-toolbar, .rte-textinfo-bar { display: none; }
  .rte-container { border: none; box-shadow: none; }
  .rte-editor { padding: 0; max-height: none; overflow: visible; }
  .rte-table-wrapper { display: block !important; }
  .rte-readonly-content p:empty { display: none !important; }
  .rte-readonly-content p > br:only-child { line-height: 0 !important; font-size: 0 !important; height: 0 !important; margin: 0 !important; }
  .rte-editor table, .rte-readonly-content table { border-collapse: collapse !important; border: 1px solid #000000 !important; }
  .rte-editor table td, .rte-editor table th, .rte-readonly-content table td, .rte-readonly-content table th { border: 1px solid #000000 !important; padding: 6px 8px !important; }
}
`;

/* ============================================================================
   SECURITY — JS INJECTION PATTERNS
   ============================================================================ */
const SECURITY_PATTERNS = [
  { re: /\balert\s*\(/gi, label: "alert()" },
  { re: /\bconfirm\s*\(/gi, label: "confirm()" },
  { re: /\bprompt\s*\(/gi, label: "prompt()" },
  { re: /\beval\s*\(/gi, label: "eval()" },
  { re: /\bFunction\s*\(/gi, label: "Function()" },
  { re: /<script/gi, label: "<script>" },
  { re: /<\/script/gi, label: "</script>" },
  { re: /<iframe/gi, label: "<iframe>" },
  { re: /<object/gi, label: "<object>" },
  { re: /<embed/gi, label: "<embed>" },
  { re: /javascript\s*:/gi, label: "javascript:" },
  { re: /vbscript\s*:/gi, label: "vbscript:" },
  { re: /data\s*:\s*text\/html/gi, label: "data:text/html" },
  { re: /\bonerror\s*=/gi, label: "onerror=" },
  { re: /\bonload\s*=/gi, label: "onload=" },
  { re: /\bonclick\s*=/gi, label: "onclick=" },
  { re: /\bonmouseover\s*=/gi, label: "onmouseover=" },
  { re: /\bonfocus\s*=/gi, label: "onfocus=" },
];

const enforceSecurityOnTextNodes = (rootEl) => {
  if (!rootEl) return { detected: [], cleaned: false };
  const detected = new Set();
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) textNodes.push(node);

  textNodes.forEach((tn) => {
    let text = tn.textContent;
    let changed = false;
    SECURITY_PATTERNS.forEach(({ re, label }) => {
      re.lastIndex = 0;
      if (re.test(text)) {
        detected.add(label);
        re.lastIndex = 0;
        text = text.replace(re, "");
        changed = true;
      }
      re.lastIndex = 0;
    });
    if (changed) tn.textContent = text;
  });

  return { detected: Array.from(detected), cleaned: detected.size > 0 };
};

const detectDangerousInHTML = (html) => {
  const detected = new Set();
  SECURITY_PATTERNS.forEach(({ re, label }) => {
    re.lastIndex = 0;
    if (re.test(html)) detected.add(label);
    re.lastIndex = 0;
  });
  return Array.from(detected);
};

/* ============================================================================
   SANITIZER
   ============================================================================ */
const sanitizeHTML = (html) => {
  if (!html) return "";

  const allowedTags = [
    "p",
    "div",
    "span",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "strike",
    "sup",
    "sub",
    "mark",
    "hr",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "table",
    "colgroup",
    "col",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "td",
    "th",
    "blockquote",
    "pre",
    "code",
    "font",
    "del",
    "ins",
    "figure",
    "figcaption",
  ];

  const allowedAttributes = {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height", "style", "data-align"],
    td: ["colspan", "rowspan", "style"],
    th: ["colspan", "rowspan", "style"],
    colgroup: ["span"],
    col: ["span", "style"],
    table: ["data-width", "data-margin-left"],
    div: ["data-width", "data-margin-left"],
    font: ["face", "size", "color"],
    "*": ["style", "class"],
  };

  const allowedStyles = [
    "color",
    "background-color",
    "font-size",
    "font-family",
    "text-align",
    "margin-left",
    "table-layout",
    "width",
    "height",
    "min-height",
    "vertical-align",
    "text-decoration",
    "font-weight",
    "font-style",
  ];

  const cellTags = ["tr"];
  const cellTagsNoHeight = ["td", "th"];
  const colTag = "col";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const cleanNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return node.cloneNode();
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      if (!allowedTags.includes(tagName)) {
        return document.createTextNode(node.textContent);
      }
      const cleanElement = document.createElement(tagName);
      const allowedAttrs = [
        ...(allowedAttributes[tagName] || []),
        ...(allowedAttributes["*"] || []),
      ];
      const isCellTag = cellTags.includes(tagName);
      const isCellTagNoHeight = cellTagsNoHeight.includes(tagName);
      const isColTag = tagName === colTag;

      Array.from(node.attributes).forEach((attr) => {
        if (allowedAttrs.includes(attr.name)) {
          if (attr.name === "style") {
            const styles = attr.value
              .split(";")
              .filter((s) => {
                const [prop] = s.split(":").map((p) => p.trim());
                if (isCellTag && (prop === "width" || prop === "height"))
                  return false;
                if (isCellTagNoHeight && prop === "width") return false;
                if (isColTag && prop === "width") return true;
                return allowedStyles.includes(prop);
              })
              .join(";");
            if (styles) cleanElement.setAttribute("style", styles);
          } else if (attr.name === "href") {
            const href = attr.value.trim();
            if (!href.startsWith("javascript:"))
              cleanElement.setAttribute(attr.name, attr.value);
          } else {
            cleanElement.setAttribute(attr.name, attr.value);
          }
        }
      });

      Array.from(node.childNodes).forEach((child) => {
        const cleanChild = cleanNode(child);
        if (cleanChild) cleanElement.appendChild(cleanChild);
      });
      return cleanElement;
    }
    return null;
  };

  const cleanBody = document.createElement("div");
  Array.from(doc.body.childNodes).forEach((node) => {
    const cleanChild = cleanNode(node);
    if (cleanChild) cleanBody.appendChild(cleanChild);
  });

  cleanBody.querySelectorAll(".rte-table-wrapper").forEach((wrapper) => {
    const table = wrapper.querySelector("table");
    if (!table) return;
    const w = wrapper.style.width || table.getAttribute("data-width");
    const ml =
      wrapper.style.marginLeft || table.getAttribute("data-margin-left");
    if (w) {
      table.setAttribute("data-width", w);
      wrapper.setAttribute("data-width", w);
      wrapper.style.width = w;
    }
    if (ml) {
      table.setAttribute("data-margin-left", ml);
      wrapper.setAttribute("data-margin-left", ml);
      if (parseFloat(ml) > 0) wrapper.style.marginLeft = ml;
    }
  });

  let sanitized = cleanBody.innerHTML;
  if (
    sanitized &&
    !sanitized.match(/<[^>]+(p|div|h[1-6]|blockquote|pre|ul|ol|table)[^>]*>/i)
  ) {
    sanitized = `<p>${sanitized}</p>`;
  }
  sanitized = sanitized.replace(
    /(<\/div>)\s*(<p[^>]*>\s*(<br\s*\/?>)?\s*<\/p>)+(?=\s*<div[^>]*class="[^"]*rte-table-wrapper|\s*$)/gi,
    "$1",
  );
  sanitized = sanitized.replace(
    /(<\/table>)\s*(<p[^>]*>\s*(<br\s*\/?>)?\s*<\/p>)+/gi,
    "$1",
  );

  return sanitized || "<p></p>";
};

/* ============================================================================
   SELECTION UTILS
   ============================================================================ */
const SelectionUtils = {
  saveSelection: (containerEl) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(containerEl);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const start = preSelectionRange.toString().length;
      return { start, end: start + range.toString().length };
    }
    return null;
  },
  restoreSelection: (containerEl, savedSel) => {
    if (!savedSel) return;
    let charIndex = 0;
    const range = document.createRange();
    range.setStart(containerEl, 0);
    range.collapse(true);
    const nodeStack = [containerEl];
    let node;
    let foundStart = false;
    let stop = false;
    while (!stop && (node = nodeStack.pop())) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCharIndex = charIndex + node.length;
        if (
          !foundStart &&
          savedSel.start >= charIndex &&
          savedSel.start <= nextCharIndex
        ) {
          range.setStart(node, savedSel.start - charIndex);
          foundStart = true;
        }
        if (
          foundStart &&
          savedSel.end >= charIndex &&
          savedSel.end <= nextCharIndex
        ) {
          range.setEnd(node, savedSel.end - charIndex);
          stop = true;
        }
        charIndex = nextCharIndex;
      } else {
        let i = node.childNodes.length;
        while (i--) nodeStack.push(node.childNodes[i]);
      }
    }
    try {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    } catch {
      /* ignore */
    }
  },
  getSelectedText: () => {
    const selection = window.getSelection();
    return selection ? selection.toString() : "";
  },
  isSelectionInElement: (element) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return false;
    const range = selection.getRangeAt(0);
    return element.contains(range.commonAncestorContainer);
  },
};

const FRIENDLY_FONTS = {
  "system-ui": "System UI",
  "-apple-system": "SF Pro",
  blinkmacsystemfont: "SF Pro",
  "segoe ui": "Segoe UI",
  roboto: "Roboto",
  inter: "Inter",
  ubuntu: "Ubuntu",
  cantarell: "Cantarell",
  "noto sans": "Noto Sans",

  arial: "Arial",
  "arial black": "Arial Black",
  helvetica: "Helvetica",
  "helvetica neue": "Helvetica Neue",
  verdana: "Verdana",
  tahoma: "Tahoma",
  "trebuchet ms": "Trebuchet MS",
  "gill sans": "Gill Sans",
  calibri: "Calibri",
  candara: "Candara",
  "comic sans ms": "Comic Sans MS",
  "franklin gothic medium": "Franklin Gothic",
  impact: "Impact",
  "lucida sans": "Lucida Sans",
  "lucida sans unicode": "Lucida Sans",
  "open sans": "Open Sans",
  lato: "Lato",
  montserrat: "Montserrat",
  poppins: "Poppins",
  raleway: "Raleway",
  nunito: "Nunito",
  "source sans pro": "Source Sans Pro",
  "fira sans": "Fira Sans",
  "pt sans": "PT Sans",
  "work sans": "Work Sans",
  "dm sans": "DM Sans",
  "ibm plex sans": "IBM Plex Sans",

  "times new roman": "Times New Roman",
  times: "Times",
  georgia: "Georgia",
  garamond: "Garamond",
  cambria: "Cambria",
  "book antiqua": "Book Antiqua",
  "palatino linotype": "Palatino",
  palatino: "Palatino",
  merriweather: "Merriweather",
  "playfair display": "Playfair Display",
  "libre baskerville": "Libre Baskerville",
  "pt serif": "PT Serif",
  "noto serif": "Noto Serif",
  "ibm plex serif": "IBM Plex Serif",
  "source serif pro": "Source Serif Pro",
  "cormorant garamond": "Cormorant Garamond",

  "courier new": "Courier New",
  courier: "Courier",
  monaco: "Monaco",
  consolas: "Consolas",
  menlo: "Menlo",
  "sf mono": "SF Mono",
  "roboto mono": "Roboto Mono",
  "fira code": "Fira Code",
  "source code pro": "Source Code Pro",
  "jetbrains mono": "JetBrains Mono",
  "ibm plex mono": "IBM Plex Mono",
  monospace: "Monospace",

  "brush script mt": "Brush Script",
  "comic sans": "Comic Sans",
  cursive: "Cursive",
  "dancing script": "Dancing Script",
  pacifico: "Pacifico",
  caveat: "Caveat",

  fantasy: "Fantasy",
  copperplate: "Copperplate",
  papyrus: "Papyrus",
  "bebas neue": "Bebas Neue",
  oswald: "Oswald",
};

const FONT_OPTIONS = [
  { value: "system-ui", label: "System UI" },
  { value: "Segoe UI", label: "Segoe UI" },
  { value: "Roboto", label: "Roboto" },
  { value: "Inter", label: "Inter" },
  { value: "Ubuntu", label: "Ubuntu" },
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Verdana", label: "Verdana" },
  { value: "Tahoma", label: "Tahoma" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Calibri", label: "Calibri" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Poppins", label: "Poppins" },
  { value: "Raleway", label: "Raleway" },
  { value: "Nunito", label: "Nunito" },
  { value: "Source Sans Pro", label: "Source Sans Pro" },
  { value: "Comic Sans MS", label: "Comic Sans MS" },
  { value: "Impact", label: "Impact" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Georgia", label: "Georgia" },
  { value: "Garamond", label: "Garamond" },
  { value: "Cambria", label: "Cambria" },
  { value: "Merriweather", label: "Merriweather" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "PT Serif", label: "PT Serif" },
  { value: "Noto Serif", label: "Noto Serif" },
  { value: "Courier New", label: "Courier New" },
  { value: "Consolas", label: "Consolas" },
  { value: "Monaco", label: "Monaco" },
  { value: "Menlo", label: "Menlo" },
  { value: "Roboto Mono", label: "Roboto Mono" },
  { value: "Fira Code", label: "Fira Code" },
  { value: "JetBrains Mono", label: "JetBrains Mono" },
  { value: "monospace", label: "Monospace" },
  { value: "Bebas Neue", label: "Bebas Neue" },
  { value: "Oswald", label: "Oswald" },
];

/* ---------------------------------------------------------------------------
   FIX 2 — LIMITED, PROFESSIONAL FONT SIZE LIST
   Replaces the previous 23-item list (which included 8/9/13/15/17, etc.).
   --------------------------------------------------------------------------- */
const FONT_SIZE_OPTIONS = [10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

const prettifyFont = (raw) => {
  if (!raw) return "";
  const first = raw
    .split(",")[0]
    .trim()
    .replace(/^["']|["']$/g, "");
  const lower = first.toLowerCase();
  return FRIENDLY_FONTS[lower] || first;
};

const rawFont = (raw) => {
  if (!raw) return "";
  return raw
    .split(",")[0]
    .trim()
    .replace(/^["']|["']$/g, "");
};

/* ---------------------------------------------------------------------------
   FIX 3 — DETECT ONLY USER-SET FONT FAMILIES
   Walks up from the node to the editor root and returns the first explicit
   font-family (inline style or <font face>). Returns "" when the text simply
   inherits the editor's default stack — which is what caused every run of
   text to be labelled "SF Pro".
   --------------------------------------------------------------------------- */
const getExplicitFontFamily = (el, root) => {
  let node = el;
  while (node && node.nodeType === Node.ELEMENT_NODE) {
    const inline = node.style && node.style.fontFamily;
    if (inline) return rawFont(inline);
    if (node.tagName === "FONT" && node.getAttribute("face"))
      return rawFont(node.getAttribute("face"));
    if (node === root) break;
    node = node.parentElement;
  }
  return "";
};

const BLOCK_LABELS = {
  p: "Paragraph",
  div: "Paragraph",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  blockquote: "Quote",
  pre: "Code Block",
  li: "List Item",
  td: "Table Cell",
  th: "Table Header",
};

const pxToPt = (px) => {
  const n = parseFloat(px);
  if (!n || Number.isNaN(n)) return null;
  return Math.round(n * 0.75 * 10) / 10;
};

const getTextInfoFromSelection = (editorEl) => {
  const fallback = {
    fontFamily: "Default",
    fontFamilyRaw: "",
    fontSize: "",
    fontSizePt: null,
    blockType: "Paragraph",
    blockTag: "",
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    superscript: false,
    subscript: false,
    foreColor: "",
    backColor: "",
    textAlign: "left",
    lineHeight: "",
    letterSpacing: "",
    direction: "ltr",
    listType: "",
  };
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !editorEl) return fallback;

  const range = sel.getRangeAt(0);
  if (!editorEl.contains(range.commonAncestorContainer)) return fallback;

  let el = range.startContainer;
  if (el.nodeType === Node.TEXT_NODE) el = el.parentElement;
  if (!el || !editorEl.contains(el)) return fallback;

  const cs = window.getComputedStyle(el);

  let blockEl = el.closest("h1,h2,h3,h4,h5,h6,p,div,blockquote,pre,li,td,th");
  if (!blockEl || !editorEl.contains(blockEl)) blockEl = el;
  const blockTag = blockEl.tagName.toLowerCase();
  const blockType = BLOCK_LABELS[blockTag] || "Paragraph";

  const blockCs = window.getComputedStyle(blockEl);
  const textAlign = blockCs.textAlign || "left";

  const listEl = el.closest("ul, ol");
  const listType = listEl ? listEl.tagName.toLowerCase() : "";

  /* Only report a font family when the user has explicitly applied one. */
  let fontFamilyRawVal = getExplicitFontFamily(el, editorEl);
  let fontFamily = fontFamilyRawVal
    ? prettifyFont(fontFamilyRawVal)
    : "Default";
  let fontSize = cs.fontSize;
  let lineHeight = cs.lineHeight;
  let letterSpacing = cs.letterSpacing;
  let direction = cs.direction || "ltr";

  if (!range.collapsed) {
    const rawFamilies = new Set();
    const sizes = new Set();
    const lineHeights = new Set();
    const walker = document.createTreeWalker(editorEl, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent && range.intersectsNode(node)) {
        rawFamilies.add(getExplicitFontFamily(node.parentElement, editorEl));
        const ncs = window.getComputedStyle(node.parentElement);
        sizes.add(ncs.fontSize);
        lineHeights.add(ncs.lineHeight);
      }
    }
    if (rawFamilies.size > 1) {
      fontFamilyRawVal = "Mixed";
      fontFamily = "Mixed";
    } else if (rawFamilies.size === 1) {
      const only = [...rawFamilies][0];
      fontFamilyRawVal = only;
      fontFamily = only ? prettifyFont(only) : "Default";
    }
    if (sizes.size > 1) fontSize = "Mixed";
    else if (sizes.size === 1) fontSize = [...sizes][0];
    if (lineHeights.size > 1) lineHeight = "Mixed";
    else if (lineHeights.size === 1) lineHeight = [...lineHeights][0];
  }

  return {
    fontFamily,
    fontFamilyRaw: fontFamilyRawVal,
    fontSize,
    fontSizePt: fontSize === "Mixed" ? null : pxToPt(fontSize),
    blockType: listType
      ? `${blockType} (${listType === "ol" ? "Numbered" : "Bulleted"})`
      : blockType,
    blockTag,
    bold: document.queryCommandState("bold"),
    italic: document.queryCommandState("italic"),
    underline: document.queryCommandState("underline"),
    strikethrough: document.queryCommandState("strikeThrough"),
    superscript: document.queryCommandState("superscript"),
    subscript: document.queryCommandState("subscript"),
    foreColor: cs.color,
    backColor:
      cs.backgroundColor === "rgba(0, 0, 0, 0)" ? "" : cs.backgroundColor,
    textAlign,
    lineHeight,
    letterSpacing,
    direction,
    listType,
  };
};

/* ============================================================================
   TABLE UTILS
   ============================================================================ */
const TableUtils = {
  countColumns: (table) => {
    let max = 0;
    Array.from(table.rows).forEach((row) => {
      let count = 0;
      Array.from(row.cells).forEach((cell) => {
        count += parseInt(cell.getAttribute("colspan") || "1", 10);
      });
      if (count > max) max = count;
    });
    return max;
  },
  ensureColgroup: (table) => {
    const colCount = TableUtils.countColumns(table);
    if (colCount === 0) return null;
    let colgroup = table.querySelector("colgroup");
    if (!colgroup) {
      colgroup = document.createElement("colgroup");
      table.insertBefore(colgroup, table.firstChild);
    }
    while (colgroup.children.length < colCount) {
      const col = document.createElement("col");
      const existingWidths = Array.from(colgroup.children).some(
        (c) => c.style.width,
      );
      if (!existingWidths)
        col.style.width = `${Math.round(1000 / colCount) / 10}%`;
      colgroup.appendChild(col);
    }
    while (colgroup.children.length > colCount)
      colgroup.removeChild(colgroup.lastChild);
    return colgroup;
  },
  prepareTable: (table) => {
    const alreadyWrapped =
      table.parentElement &&
      table.parentElement.classList.contains("rte-table-wrapper");
    if (!alreadyWrapped) {
      const wrapper = document.createElement("div");
      wrapper.className = "rte-table-wrapper";
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
      table.querySelectorAll("td, th").forEach((cell) => {
        cell.style.removeProperty("width");
        cell.style.removeProperty("height");
        cell.style.removeProperty("min-width");
        cell.style.removeProperty("max-width");
      });
      table.style.removeProperty("min-width");
      table.style.removeProperty("max-width");
      const savedWidth = table.getAttribute("data-width");
      const savedMargin = table.getAttribute("data-margin-left");
      const pct = savedWidth ? Math.min(100, parseFloat(savedWidth)) : 100;
      const marginPct = savedMargin ? Math.max(0, parseFloat(savedMargin)) : 0;
      wrapper.style.width = `${pct}%`;
      wrapper.style.marginLeft = marginPct > 0 ? `${marginPct}%` : "";
      wrapper.style.display = "block";
      table.style.width = "100%";
    } else {
      const wrapper = table.parentElement;
      if (!wrapper.style.width) {
        const savedWidth = table.getAttribute("data-width");
        const savedMargin = table.getAttribute("data-margin-left");
        const pct = savedWidth ? Math.min(100, parseFloat(savedWidth)) : 100;
        const marginPct = savedMargin
          ? Math.max(0, parseFloat(savedMargin))
          : 0;
        wrapper.style.width = `${pct}%`;
        wrapper.style.marginLeft = marginPct > 0 ? `${marginPct}%` : "";
      }
      wrapper.style.display = "block";
      table.style.width = "100%";
    }
    table.style.tableLayout = "auto";
    TableUtils.ensureColgroup(table);
    const wrapper = table.parentElement;
    if (wrapper && !wrapper.querySelector(".rte-table-resize-handle")) {
      const handle = document.createElement("div");
      handle.className = "rte-table-resize-handle";
      handle.contentEditable = "false";
      wrapper.appendChild(handle);
    }
    if (wrapper && !wrapper.querySelector(".rte-table-resize-handle-left")) {
      const handleLeft = document.createElement("div");
      handleLeft.className = "rte-table-resize-handle-left";
      handleLeft.contentEditable = "false";
      wrapper.appendChild(handleLeft);
    }
    if (wrapper && !wrapper.querySelector(".rte-table-resize-handle-bottom")) {
      const handleBottom = document.createElement("div");
      handleBottom.className = "rte-table-resize-handle-bottom";
      handleBottom.contentEditable = "false";
      wrapper.appendChild(handleBottom);
    }
  },
  prepareAll: (root) => {
    if (!root) return;
    root
      .querySelectorAll("table")
      .forEach((table) => TableUtils.prepareTable(table));
    root.querySelectorAll(".rte-table-wrapper").forEach((wrapper) => {
      const prev = wrapper.previousSibling;
      const needsParagraph =
        !prev ||
        (prev.nodeType === Node.TEXT_NODE && !prev.textContent.trim()) ||
        (prev.nodeType === Node.ELEMENT_NODE &&
          prev.classList.contains("rte-table-wrapper"));
      if (needsParagraph) {
        const p = document.createElement("p");
        p.innerHTML = "<br>";
        p.style.marginLeft = "0";
        wrapper.parentNode.insertBefore(p, wrapper);
      }
    });
  },
  freezeColumnWidths: (table) => {
    const colgroup = TableUtils.ensureColgroup(table);
    if (!colgroup) return colgroup;
    const cols = Array.from(colgroup.children);
    const colCount = cols.length;
    if (colCount === 0) return colgroup;
    const tableWidth = table.offsetWidth;
    if (!tableWidth) return colgroup;
    const colWidthMap = new Array(colCount).fill(0);
    const colMeasured = new Array(colCount).fill(false);
    for (let r = 0; r < table.rows.length; r++) {
      const row = table.rows[r];
      let colCursor = 0;
      for (let c = 0; c < row.cells.length; c++) {
        const cell = row.cells[c];
        const span = parseInt(cell.getAttribute("colspan") || "1", 10);
        if (span === 1 && !colMeasured[colCursor]) {
          colWidthMap[colCursor] = cell.offsetWidth;
          colMeasured[colCursor] = true;
        }
        colCursor += span;
      }
      if (colMeasured.every(Boolean)) break;
    }
    const unmeasuredCount = colMeasured.filter((m) => !m).length;
    const measuredTotal = colWidthMap.reduce((s, w) => s + w, 0);
    const remaining = Math.max(0, tableWidth - measuredTotal);
    const fallback =
      unmeasuredCount > 0
        ? Math.round(remaining / unmeasuredCount)
        : Math.round(tableWidth / colCount);
    colWidthMap.forEach((w, i) => {
      if (!colMeasured[i]) colWidthMap[i] = fallback;
    });
    const totalMeasured = colWidthMap.reduce((s, w) => s + w, 0);
    if (totalMeasured < colCount * 5) {
      const equalPct = Math.round((100 / colCount) * 10) / 10;
      cols.forEach((col) => {
        col.style.width = `${equalPct}%`;
      });
      table.style.width = "100%";
      table.style.tableLayout = "auto";
      return colgroup;
    }
    const rawPcts = colWidthMap.map((w) =>
      Math.max(5, Math.round((w / tableWidth) * 1000) / 10),
    );
    const rawSum = rawPcts.reduce((s, p) => s + p, 0);
    const scale = rawSum > 0 ? 100 / rawSum : 1;
    cols.forEach((col, i) => {
      col.style.width = `${Math.round(rawPcts[i] * scale * 10) / 10}%`;
    });
    table.style.width = "100%";
    table.style.tableLayout = "auto";
    return colgroup;
  },
  distributeColumns: (table) => {
    const colgroup = TableUtils.ensureColgroup(table);
    if (!colgroup) return;
    const colCount = colgroup.children.length;
    if (!colCount) return;
    const equalPct = Math.round((100 / colCount) * 10) / 10;
    Array.from(colgroup.children).forEach((col) => {
      col.style.width = `${equalPct}%`;
    });
    table
      .querySelectorAll("td, th")
      .forEach((c) => c.style.removeProperty("width"));
  },
  getRowIndex: (cell) => cell.closest("tr").rowIndex,
  getColIndex: (cell) => cell.cellIndex,
  clearSelection: (cells) =>
    cells.forEach((c) => c.classList.remove("rte-cell-selected")),
  selectRange: (table, anchor, focus) => {
    const anchorRow = TableUtils.getRowIndex(anchor);
    const focusRow = TableUtils.getRowIndex(focus);
    const anchorCol = TableUtils.getColIndex(anchor);
    const focusCol = TableUtils.getColIndex(focus);
    const minRow = Math.min(anchorRow, focusRow);
    const maxRow = Math.max(anchorRow, focusRow);
    const minCol = Math.min(anchorCol, focusCol);
    const maxCol = Math.max(anchorCol, focusCol);
    const selected = [];
    for (let r = minRow; r <= maxRow; r++) {
      const row = table.rows[r];
      if (!row) continue;
      for (let c = 0; c < row.cells.length; c++) {
        if (c >= minCol && c <= maxCol) {
          row.cells[c].classList.add("rte-cell-selected");
          selected.push(row.cells[c]);
        }
      }
    }
    return selected;
  },
  mergeCells: (cells) => {
    if (cells.length < 2) return null;
    const table = cells[0].closest("table");
    let minRow = Infinity,
      maxRow = -Infinity,
      minCol = Infinity,
      maxCol = -Infinity;
    cells.forEach((cell) => {
      const r = TableUtils.getRowIndex(cell);
      const c = TableUtils.getColIndex(cell);
      minRow = Math.min(minRow, r);
      maxRow = Math.max(maxRow, r);
      minCol = Math.min(minCol, c);
      maxCol = Math.max(maxCol, c);
    });
    const targetCell = table.rows[minRow] && table.rows[minRow].cells[minCol];
    if (!targetCell) return null;
    let combinedContent = targetCell.innerHTML.trim();
    if (combinedContent === "<br>") combinedContent = "";
    for (let r = minRow; r <= maxRow; r++) {
      const row = table.rows[r];
      if (!row) continue;
      for (let c = row.cells.length - 1; c >= 0; c--) {
        const cell = row.cells[c];
        const cIndex = TableUtils.getColIndex(cell);
        if (cIndex >= minCol && cIndex <= maxCol && cell !== targetCell) {
          const inner = cell.innerHTML.trim();
          if (inner && inner !== "<br>")
            combinedContent += (combinedContent ? " " : "") + inner;
          cell.remove();
        }
      }
    }
    targetCell.innerHTML = combinedContent || "<br>";
    const rowSpan = maxRow - minRow + 1;
    const colSpan = maxCol - minCol + 1;
    if (rowSpan > 1) targetCell.setAttribute("rowspan", String(rowSpan));
    else targetCell.removeAttribute("rowspan");
    if (colSpan > 1) targetCell.setAttribute("colspan", String(colSpan));
    else targetCell.removeAttribute("colspan");
    TableUtils.ensureColgroup(table);
    return targetCell;
  },
  splitCell: (cell) => {
    const rowSpan = parseInt(cell.getAttribute("rowspan") || "1", 10);
    const colSpan = parseInt(cell.getAttribute("colspan") || "1", 10);
    if (rowSpan <= 1 && colSpan <= 1) return;
    const table = cell.closest("table");
    const startRow = TableUtils.getRowIndex(cell);
    const startCol = TableUtils.getColIndex(cell);
    const tagName = cell.tagName.toLowerCase();
    cell.removeAttribute("rowspan");
    cell.removeAttribute("colspan");
    for (let r = startRow; r < startRow + rowSpan; r++) {
      const row = table.rows[r];
      if (!row) continue;
      for (let c = startCol; c < startCol + colSpan; c++) {
        if (r === startRow && c === startCol) continue;
        const newCell = document.createElement(tagName);
        newCell.innerHTML = "<br>";
        const ref = row.cells[c] || null;
        row.insertBefore(newCell, ref);
      }
    }
    TableUtils.ensureColgroup(table);
  },
  insertRow: (referenceCell, position) => {
    const table = referenceCell.closest("table");
    const rowIndex = TableUtils.getRowIndex(referenceCell);
    const refRow = table.rows[rowIndex];
    const colCount = TableUtils.countColumns(table);
    const newRow = document.createElement("tr");
    for (let c = 0; c < colCount; c++) {
      const cell = document.createElement("td");
      cell.innerHTML = "<br>";
      newRow.appendChild(cell);
    }
    const body = refRow.parentElement;
    if (position === "above") body.insertBefore(newRow, refRow);
    else body.insertBefore(newRow, refRow.nextSibling);
    return newRow;
  },
  insertColumn: (referenceCell, position) => {
    const table = referenceCell.closest("table");
    const colIndex = TableUtils.getColIndex(referenceCell);
    const insertAt = position === "left" ? colIndex : colIndex + 1;
    Array.from(table.rows).forEach((row) => {
      const tagName =
        row.querySelector("th") &&
        row.cells[0] &&
        row.cells[0].tagName.toLowerCase() === "th"
          ? "th"
          : "td";
      const newCell = document.createElement(
        row.cells[0] && row.cells[0].tagName.toLowerCase() === "th"
          ? "th"
          : tagName,
      );
      newCell.innerHTML = "<br>";
      const ref = row.cells[insertAt] || null;
      row.insertBefore(newCell, ref);
    });
    TableUtils.ensureColgroup(table);
  },
  deleteRow: (referenceCell) => {
    const table = referenceCell.closest("table");
    if (table.rows.length <= 1) {
      table.closest(".rte-table-wrapper")?.remove() || table.remove();
      return "table-removed";
    }
    referenceCell.closest("tr").remove();
    return "row-removed";
  },
  deleteColumn: (referenceCell) => {
    const table = referenceCell.closest("table");
    const colIndex = TableUtils.getColIndex(referenceCell);
    if (TableUtils.countColumns(table) <= 1) {
      table.closest(".rte-table-wrapper")?.remove() || table.remove();
      return "table-removed";
    }
    Array.from(table.rows).forEach((row) => {
      const cell = row.cells[colIndex];
      if (cell) cell.remove();
    });
    TableUtils.ensureColgroup(table);
    return "column-removed";
  },
  deleteTable: (referenceCell) => {
    const table = referenceCell.closest("table");
    const wrapper = table.closest(".rte-table-wrapper");
    if (wrapper) wrapper.remove();
    else table.remove();
  },
  focusCell: (cell, atEnd = false) => {
    if (!cell) return;
    cell.focus();
    const range = document.createRange();
    range.selectNodeContents(cell);
    range.collapse(!atEnd);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  },
  setCellVerticalAlign: (cells, align) => {
    cells.forEach((cell) => {
      if (align) cell.style.verticalAlign = align;
      else cell.style.removeProperty("vertical-align");
    });
  },
  setCellBackground: (cells, color) => {
    cells.forEach((cell) => {
      if (color) cell.style.backgroundColor = color;
      else cell.style.removeProperty("background-color");
    });
  },
};

/* ============================================================================
   TABLE-ADJACENT BLOCK NORMALIZATION
   Fixes the "Enter next to a resized table starts indented" bug.
   Uses setProperty(..., 'important') so it beats any inline style the browser
   may have copied from the previous / adjacent block.
   ============================================================================ */
const BLOCK_TAGS = [
  "p",
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
];

const resetBlockIndent = (el) => {
  if (!el || !el.style) return;
  el.style.setProperty("margin-left", "0", "important");
  el.style.setProperty("text-indent", "0", "important");
  el.style.setProperty("padding-left", "0", "important");
  el.style.setProperty("width", "auto", "important");
  el.style.setProperty("max-width", "100%", "important");
};

/* ---------------------------------------------------------------------------
   FIX 4 — TABLE-RESIZE CARET JUMP
   Previously the browser could leave a text node / stray block INSIDE the
   `.rte-table-wrapper` after a left- or right-side resize. Because the wrapper
   itself carries the user's `width` and `margin-left`, the caret rendered
   underneath the table's old left edge instead of the editor's left edge.

   This version MOVES (not clones) every non-table child out of the wrapper so
   the caret always lands at the editor's true left margin, and re-applies the
   indent reset to the blocks hugging the table.
   --------------------------------------------------------------------------- */
const normalizeTableAdjacentBlocks = (editor) => {
  if (!editor) return;
  const wrappers = editor.querySelectorAll(".rte-table-wrapper");

  wrappers.forEach((wrapper) => {
    /* 1 ── Pull ANY stray content out of the wrapper so it can never inherit
       the wrapper's width / margin-left. Nodes are MOVED (not cloned) so the
       caret keeps its position. */
    Array.from(wrapper.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (!node.textContent.trim()) {
          node.remove();
          return;
        }
        const p = document.createElement("p");
        resetBlockIndent(p);
        wrapper.parentNode.insertBefore(p, wrapper.nextSibling);
        p.appendChild(node);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const tag = node.tagName.toLowerCase();
      if (tag === "table" || tag === "colgroup") return;
      if (
        node.classList &&
        (node.classList.contains("rte-table-resize-handle") ||
          node.classList.contains("rte-table-resize-handle-left") ||
          node.classList.contains("rte-table-resize-handle-bottom"))
      )
        return;
      wrapper.parentNode.insertBefore(node, wrapper.nextSibling);
      if (BLOCK_TAGS.includes(tag)) resetBlockIndent(node);
    });

    /* 2 ── Reset the blocks hugging the table back to the left edge. */
    [wrapper.previousElementSibling, wrapper.nextElementSibling].forEach(
      (sib) => {
        if (!sib || !sib.tagName) return;
        const t = sib.tagName.toLowerCase();
        if (BLOCK_TAGS.includes(t)) resetBlockIndent(sib);
      },
    );
  });
};

const resetCaretBlockIfAdjacentToTable = (editor) => {
  if (!editor) return;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const node = sel.getRangeAt(0).startContainer;
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  if (!el || !editor.contains(el)) return;

  const block = el.closest(
    "p, div, h1, h2, h3, h4, h5, h6, blockquote, pre, ul, ol, li",
  );
  if (!block || !editor.contains(block)) return;

  const prev = block.previousElementSibling;
  const next = block.nextElementSibling;
  const isAdjacent =
    (prev && prev.classList && prev.classList.contains("rte-table-wrapper")) ||
    (next && next.classList && next.classList.contains("rte-table-wrapper"));

  if (isAdjacent) resetBlockIndent(block);
};

/* ============================================================================
   HISTORY HOOK
   ============================================================================ */
const useHistory = (initialContent = "", maxSize = 50) => {
  const historyRef = useRef([initialContent]);
  const currentIndexRef = useRef(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const updateStates = useCallback(() => {
    setCanUndo(currentIndexRef.current > 0);
    setCanRedo(currentIndexRef.current < historyRef.current.length - 1);
  }, []);
  const push = useCallback(
    (content) => {
      historyRef.current = historyRef.current.slice(
        0,
        currentIndexRef.current + 1,
      );
      historyRef.current.push(content);
      if (historyRef.current.length > maxSize) historyRef.current.shift();
      else currentIndexRef.current++;
      updateStates();
    },
    [maxSize, updateStates],
  );
  const undo = useCallback(() => {
    if (currentIndexRef.current > 0) {
      currentIndexRef.current--;
      updateStates();
      return historyRef.current[currentIndexRef.current];
    }
    return null;
  }, [updateStates]);
  const redo = useCallback(() => {
    if (currentIndexRef.current < historyRef.current.length - 1) {
      currentIndexRef.current++;
      updateStates();
      return historyRef.current[currentIndexRef.current];
    }
    return null;
  }, [updateStates]);
  const reset = useCallback(
    (content) => {
      historyRef.current = [content];
      currentIndexRef.current = 0;
      updateStates();
    },
    [updateStates],
  );
  return { push, undo, redo, canUndo, canRedo, reset };
};

const LinkModal = memo(
  ({ onInsert, onClose, initialUrl = "", initialText = "" }) => {
    const [url, setUrl] = useState(initialUrl);
    const [text, setText] = useState(initialText);
    const [newTab, setNewTab] = useState(true);
    const handleSubmit = () => {
      if (url.trim()) onInsert({ url: url.trim(), text: text.trim(), newTab });
    };
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Escape") onClose();
    };
    return (
      <div className="rte-modal-overlay" onClick={onClose}>
        <div className="rte-modal" onClick={(e) => e.stopPropagation()}>
          <div className="rte-modal-header">Insert / Edit Link</div>
          <div className="rte-modal-body">
            <label className="rte-modal-label">URL</label>
            <input
              type="url"
              className="rte-modal-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com"
              autoFocus
            />
            <label className="rte-modal-label">Link Text (optional)</label>
            <input
              type="text"
              className="rte-modal-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Link text"
            />
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "var(--text-secondary)",
              }}
            >
              <input
                type="checkbox"
                checked={newTab}
                onChange={(e) => setNewTab(e.target.checked)}
              />
              Open in new tab
            </label>
          </div>
          <div className="rte-modal-footer">
            <button
              className="rte-modal-btn rte-modal-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="rte-modal-btn rte-modal-btn-primary"
              onClick={handleSubmit}
            >
              Insert
            </button>
          </div>
        </div>
      </div>
    );
  },
);

const ImageModal = memo(({ onInsert, onClose }) => {
  const [mode, setMode] = useState("url");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const readFileAsDataURL = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const dataUrl = await readFileAsDataURL(file);
    setUrl(dataUrl);
    if (!alt) setAlt(file.name.replace(/\.[^.]+$/, ""));
    setMode("file");
  };

  const handleSubmit = () => {
    if (url.trim()) onInsert({ url: url.trim(), alt: alt.trim() });
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") onClose();
  };

  return (
    <div className="rte-modal-overlay" onClick={onClose}>
      <div className="rte-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rte-modal-header">Insert Image</div>
        <div className="rte-modal-body">
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            <button
              className={`rte-modal-btn ${mode === "url" ? "rte-modal-btn-primary" : "rte-modal-btn-secondary"}`}
              onClick={() => setMode("url")}
              type="button"
            >
              From URL
            </button>
            <button
              className={`rte-modal-btn ${mode === "file" ? "rte-modal-btn-primary" : "rte-modal-btn-secondary"}`}
              onClick={() => setMode("file")}
              type="button"
            >
              Upload File
            </button>
          </div>
          {mode === "url" ? (
            <>
              <label className="rte-modal-label">Image URL</label>
              <input
                type="url"
                className="rte-modal-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com/image.jpg"
                autoFocus
              />
            </>
          ) : (
            <div
              className={`rte-img-drop-zone ${dragOver ? "dragover" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
            >
              {url && url.startsWith("data:") ? (
                <img src={url} alt="preview" className="rte-img-preview" />
              ) : (
                <div>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>📁</div>
                  <div>Click to choose, or drag &amp; drop an image</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>
                    PNG, JPG, GIF, WebP, SVG
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          )}
          <label className="rte-modal-label" style={{ marginTop: 12 }}>
            Alt Text (optional)
          </label>
          <input
            type="text"
            className="rte-modal-input"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Image description"
          />
        </div>
        <div className="rte-modal-footer">
          <button
            className="rte-modal-btn rte-modal-btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rte-modal-btn rte-modal-btn-primary"
            onClick={handleSubmit}
            disabled={!url}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
});

const TableModal = memo(({ onInsert, onClose }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const handleSubmit = () => {
    if (rows > 0 && cols > 0)
      onInsert({ rows: parseInt(rows, 10), cols: parseInt(cols, 10) });
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") onClose();
  };
  return (
    <div className="rte-modal-overlay" onClick={onClose}>
      <div className="rte-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rte-modal-header">Insert Table</div>
        <div className="rte-modal-body">
          <div className="rte-modal-row">
            <div>
              <label className="rte-modal-label">Rows</label>
              <input
                type="number"
                className="rte-modal-input"
                value={rows}
                onChange={(e) => setRows(e.target.value)}
                onKeyDown={handleKeyDown}
                min="1"
                max="20"
                autoFocus
              />
            </div>
            <div>
              <label className="rte-modal-label">Columns</label>
              <input
                type="number"
                className="rte-modal-input"
                value={cols}
                onChange={(e) => setCols(e.target.value)}
                onKeyDown={handleKeyDown}
                min="1"
                max="10"
              />
            </div>
          </div>
        </div>
        <div className="rte-modal-footer">
          <button
            className="rte-modal-btn rte-modal-btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rte-modal-btn rte-modal-btn-primary"
            onClick={handleSubmit}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
});

const FindReplaceModal = memo(
  ({ onFind, onReplace, onReplaceAll, onClose, matchCount }) => {
    const [find, setFind] = useState("");
    const [replace, setReplace] = useState("");
    useEffect(() => {
      onFind(find);
    }, [find]);
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    return (
      <div className="rte-modal-overlay" onClick={onClose}>
        <div className="rte-modal" onClick={(e) => e.stopPropagation()}>
          <div className="rte-modal-header">Find &amp; Replace</div>
          <div className="rte-modal-body">
            <label className="rte-modal-label">Find</label>
            <input
              type="text"
              className="rte-modal-input"
              value={find}
              onChange={(e) => setFind(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Text to find"
              autoFocus
            />
            <label className="rte-modal-label">Replace with</label>
            <input
              type="text"
              className="rte-modal-input"
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Replacement text"
            />
            <div className="rte-fr-count">
              {find
                ? `${matchCount} match${matchCount === 1 ? "" : "es"} found`
                : "Enter text to search"}
            </div>
          </div>
          <div className="rte-modal-footer">
            <button
              className="rte-modal-btn rte-modal-btn-ghost"
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="rte-modal-btn rte-modal-btn-secondary"
              disabled={!find}
              onClick={() => onReplace(find, replace)}
            >
              Replace Next
            </button>
            <button
              className="rte-modal-btn rte-modal-btn-primary"
              disabled={!find}
              onClick={() => onReplaceAll(find, replace)}
            >
              Replace All
            </button>
          </div>
        </div>
      </div>
    );
  },
);

const ShortcutsModal = memo(({ onClose }) => {
  const shortcuts = [
    ["Bold", "Ctrl+B"],
    ["Italic", "Ctrl+I"],
    ["Underline", "Ctrl+U"],
    ["Strikethrough", "Ctrl+Shift+X"],
    ["Undo", "Ctrl+Z"],
    ["Redo", "Ctrl+Y"],
    ["Find & Replace", "Ctrl+F"],
    ["Clear formatting", "Ctrl+\\"],
    ["Next cell (in table)", "Tab"],
    ["Previous cell", "Shift+Tab"],
    ["Heading 1/2/3", "# / ## / ### then Space"],
    ["Bullet list", "- or * then Space"],
    ["Numbered list", "1. then Space"],
    ["Blockquote", "> then Space"],
    ["Horizontal rule", "---"],
    ["Exit fullscreen", "Escape"],
  ];
  return (
    <div className="rte-modal-overlay" onClick={onClose}>
      <div
        className="rte-modal rte-modal-wide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rte-modal-header">Keyboard Shortcuts</div>
        <div className="rte-modal-body">
          <div className="rte-shortcut-grid">
            {shortcuts.map(([label, key]) => (
              <div key={label} className="rte-shortcut-row">
                <span>{label}</span>
                <span className="rte-shortcut-key">{key}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rte-modal-footer">
          <button
            className="rte-modal-btn rte-modal-btn-primary"
            onClick={onClose}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
});

const SecurityModal = memo(({ patterns, onClose }) => (
  <div className="rte-modal-overlay" onClick={onClose}>
    <div className="rte-modal" onClick={(e) => e.stopPropagation()}>
      <div className="rte-security-header-wrap">
        <div className="rte-security-icon">🛡️</div>
        <div className="rte-modal-header danger">JavaScript Is Not Allowed</div>
      </div>
      <div className="rte-modal-body">
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 14,
            lineHeight: 1.55,
            color: "var(--text-secondary)",
          }}
        >
          For your safety, executable content is blocked in this editor. The
          following {patterns.length === 1 ? "pattern was" : "patterns were"}{" "}
          detected and{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            automatically removed
          </strong>
          :
        </p>
        <ul className="rte-security-list">
          {patterns.map((p) => (
            <li key={p} className="rte-security-tag">
              {p}
            </li>
          ))}
        </ul>
        <p
          style={{
            margin: "14px 0 0",
            fontSize: 12,
            color: "var(--text-secondary)",
            fontStyle: "italic",
          }}
        >
          Only safe formatting (bold, italic, lists, tables, links, images) is
          permitted.
        </p>
      </div>
      <div className="rte-modal-footer">
        <button
          className="rte-modal-btn rte-modal-btn-primary"
          onClick={onClose}
        >
          I understand
        </button>
      </div>
    </div>
  </div>
));

/* ============================================================================
   LIVE TEXT INFO BAR
   ============================================================================ */
const TextInfoBar = memo(({ info, visible }) => {
  if (!visible) return null;
  const fmt = (v) => (v === "" || v == null ? "—" : v);
  const sizeLabel = info.fontSize
    ? `${info.fontSize}${info.fontSizePt ? ` · ${info.fontSizePt}pt` : ""}`
    : "—";

  return (
    <div className="rte-textinfo-bar" role="status" aria-live="polite">
      <span className="rte-textinfo-item">
        <span className="rte-textinfo-label">Style</span>
        <span
          className={`rte-textinfo-value ${!info.blockType ? "empty" : ""}`}
        >
          {fmt(info.blockType)}
        </span>
      </span>
      <span className="rte-textinfo-item">
        <span className="rte-textinfo-label">Font</span>
        <span
          className={`rte-textinfo-value ${!info.fontFamily ? "empty" : ""}`}
        >
          {fmt(info.fontFamily)}
        </span>
      </span>
      <span className="rte-textinfo-item">
        <span className="rte-textinfo-label">Size</span>
        <span className={`rte-textinfo-value ${!info.fontSize ? "empty" : ""}`}>
          {sizeLabel}
        </span>
      </span>
      <span className="rte-textinfo-item">
        <span className="rte-textinfo-label">Format</span>
        <span className="rte-textinfo-chips">
          <span className={`rte-textinfo-chip ${info.bold ? "active" : ""}`}>
            B
          </span>
          <span className={`rte-textinfo-chip ${info.italic ? "active" : ""}`}>
            <em>I</em>
          </span>
          <span
            className={`rte-textinfo-chip ${info.underline ? "active" : ""}`}
          >
            <u>U</u>
          </span>
          <span
            className={`rte-textinfo-chip ${info.strikethrough ? "active" : ""}`}
          >
            <s>S</s>
          </span>
          <span
            className={`rte-textinfo-chip ${info.superscript ? "active" : ""}`}
          >
            x²
          </span>
          <span
            className={`rte-textinfo-chip ${info.subscript ? "active" : ""}`}
          >
            x₂
          </span>
        </span>
      </span>
      <span className="rte-textinfo-item">
        <span className="rte-textinfo-label">Align</span>
        <span className="rte-textinfo-value">{fmt(info.textAlign)}</span>
      </span>
      {info.lineHeight && info.lineHeight !== "normal" && (
        <span className="rte-textinfo-item">
          <span className="rte-textinfo-label">Line</span>
          <span className="rte-textinfo-value">{info.lineHeight}</span>
        </span>
      )}
      {info.foreColor && (
        <span className="rte-textinfo-item">
          <span className="rte-textinfo-label">Text</span>
          <span
            className="rte-textinfo-swatch"
            style={{ backgroundColor: info.foreColor }}
            title={info.foreColor}
          />
        </span>
      )}
      {info.backColor && (
        <span className="rte-textinfo-item">
          <span className="rte-textinfo-label">BG</span>
          <span
            className="rte-textinfo-swatch"
            style={{ backgroundColor: info.backColor }}
            title={info.backColor}
          />
        </span>
      )}
    </div>
  );
});

/* ============================================================================
   FLOATING TABLE TOOLBAR
   ============================================================================ */
const TableToolbar = memo(
  ({
    top,
    left,
    canMerge,
    canSplit,
    onAction,
    onClose,
    cellBg,
    cellVAlign,
  }) => (
    <div
      className="rte-table-toolbar"
      style={{ top: `${top}px`, left: `${left}px` }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        className="rte-btn"
        title="Close toolbar"
        onClick={onClose}
        type="button"
        style={{
          marginRight: 4,
          color: "var(--text-secondary)",
          fontWeight: 700,
        }}
      >
        ✕
      </button>
      <div className="rte-table-toolbar-divider" />
      <button
        className="rte-btn"
        disabled={!canMerge}
        title="Merge selected cells"
        onClick={() => onAction("merge")}
        type="button"
      >
        ⊟ Merge
      </button>
      <button
        className="rte-btn"
        disabled={!canSplit}
        title="Split merged cell"
        onClick={() => onAction("split")}
        type="button"
      >
        ⊞ Split
      </button>
      <div className="rte-table-toolbar-divider" />
      <button
        className="rte-btn"
        title="Distribute columns evenly"
        onClick={() => onAction("distributeCols")}
        type="button"
      >
        ↔ Even
      </button>
      <div className="rte-table-toolbar-divider" />
      <button
        className="rte-btn"
        title="Insert row above"
        onClick={() => onAction("insertRowAbove")}
        type="button"
      >
        ↑Row
      </button>
      <button
        className="rte-btn"
        title="Insert row below"
        onClick={() => onAction("insertRowBelow")}
        type="button"
      >
        ↓Row
      </button>
      <button
        className="rte-btn"
        title="Insert column left"
        onClick={() => onAction("insertColLeft")}
        type="button"
      >
        ←Col
      </button>
      <button
        className="rte-btn"
        title="Insert column right"
        onClick={() => onAction("insertColRight")}
        type="button"
      >
        →Col
      </button>
      <div className="rte-table-toolbar-divider" />
      <button
        className="rte-btn"
        title="Delete row"
        onClick={() => onAction("deleteRow")}
        type="button"
      >
        ✕Row
      </button>
      <button
        className="rte-btn"
        title="Delete column"
        onClick={() => onAction("deleteCol")}
        type="button"
      >
        ✕Col
      </button>
      <button
        className="rte-btn"
        title="Delete table"
        onClick={() => onAction("deleteTable")}
        type="button"
      >
        ✕Table
      </button>
      <div className="rte-table-toolbar-divider" />
      <span
        title="Cell vertical align"
        style={{ display: "inline-flex", gap: 2 }}
      >
        <button
          className="rte-btn"
          title="Align top"
          style={{ fontWeight: cellVAlign === "top" ? 700 : 400 }}
          onClick={() => onAction("valignTop")}
          type="button"
        >
          ⤒
        </button>
        <button
          className="rte-btn"
          title="Align middle"
          style={{ fontWeight: cellVAlign === "middle" ? 700 : 400 }}
          onClick={() => onAction("valignMiddle")}
          type="button"
        >
          ≡
        </button>
        <button
          className="rte-btn"
          title="Align bottom"
          style={{ fontWeight: cellVAlign === "bottom" ? 700 : 400 }}
          onClick={() => onAction("valignBottom")}
          type="button"
        >
          ⤓
        </button>
      </span>
      <div className="rte-table-toolbar-divider" />
      <label
        title="Cell background"
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "0 4px",
        }}
      >
        <input
          type="color"
          className="rte-color-input"
          value={cellBg || "#ffffff"}
          onChange={(e) => onAction("cellBg", e.target.value)}
          style={{ width: 26, height: 26 }}
        />
      </label>
    </div>
  ),
);

/* ============================================================================
   FLOATING BUBBLE TOOLBAR
   ============================================================================ */
const BubbleToolbar = memo(
  ({ top, left, formatState, onFormat, onLink, onUnlink }) => (
    <div
      className="rte-bubble-toolbar"
      style={{ top: `${top}px`, left: `${left}px` }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        className={`rte-btn ${formatState.bold ? "active" : ""}`}
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat("bold");
        }}
        title="Bold"
      >
        B
      </button>
      <button
        className={`rte-btn ${formatState.italic ? "active" : ""}`}
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat("italic");
        }}
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        className={`rte-btn ${formatState.underline ? "active" : ""}`}
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat("underline");
        }}
        title="Underline"
      >
        <u>U</u>
      </button>
      <button
        className={`rte-btn ${formatState.strikethrough ? "active" : ""}`}
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat("strikethrough");
        }}
        title="Strikethrough"
      >
        <s>S</s>
      </button>
      <div className="rte-bubble-toolbar-divider" />
      <button
        className="rte-btn rte-btn-highlight"
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat("highlight");
        }}
        title="Highlight"
      >
        ✎
      </button>
      <div className="rte-bubble-toolbar-divider" />
      <button
        className="rte-btn"
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat("blockquote");
        }}
        title="Quote"
      >
        ❝
      </button>
      <button
        className="rte-btn"
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat("removeFormat");
        }}
        title="Clear formatting"
      >
        ✕
      </button>
    </div>
  ),
);

/* ============================================================================
   FLOATING IMAGE TOOLBAR
   ============================================================================ */
const ImageToolbar = memo(({ top, left, align, onAction, onClose }) => (
  <div
    className="rte-image-toolbar"
    style={{ top: `${top}px`, left: `${left}px` }}
    onMouseDown={(e) => e.preventDefault()}
  >
    <button
      className="rte-btn"
      title="Close"
      onClick={onClose}
      type="button"
      style={{ color: "var(--text-secondary)" }}
    >
      ✕
    </button>
    <div className="rte-table-toolbar-divider" />
    <button
      className={`rte-btn ${align === "left" ? "active" : ""}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onAction("align", "left");
      }}
      title="Align left"
    >
      ⇤
    </button>
    <button
      className={`rte-btn ${align === "center" ? "active" : ""}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onAction("align", "center");
      }}
      title="Align center"
    >
      ≣
    </button>
    <button
      className={`rte-btn ${align === "right" ? "active" : ""}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onAction("align", "right");
      }}
      title="Align right"
    >
      ⇥
    </button>
    <div className="rte-table-toolbar-divider" />
    <button
      className="rte-btn"
      onMouseDown={(e) => {
        e.preventDefault();
        onAction("size", "25%");
      }}
      title="Small"
    >
      S
    </button>
    <button
      className="rte-btn"
      onMouseDown={(e) => {
        e.preventDefault();
        onAction("size", "50%");
      }}
      title="Medium"
    >
      M
    </button>
    <button
      className="rte-btn"
      onMouseDown={(e) => {
        e.preventDefault();
        onAction("size", "75%");
      }}
      title="Large"
    >
      L
    </button>
    <button
      className="rte-btn"
      onMouseDown={(e) => {
        e.preventDefault();
        onAction("size", "100%");
      }}
      title="Full"
    >
      F
    </button>
    <div className="rte-table-toolbar-divider" />
    <button
      className="rte-btn"
      onMouseDown={(e) => {
        e.preventDefault();
        onAction("replace");
      }}
      title="Replace image"
    >
      ↻
    </button>
    <button
      className="rte-btn"
      onMouseDown={(e) => {
        e.preventDefault();
        onAction("delete");
      }}
      title="Delete image"
    >
      🗑
    </button>
  </div>
));

/* ============================================================================
   TOOLBAR
   ============================================================================ */
const ToolbarButton = memo(
  ({ onClick, active, disabled, title, icon, ariaLabel, className = "" }) => (
    <button
      className={`rte-btn ${active ? "active" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel || title}
      aria-pressed={active}
      type="button"
    >
      {icon}
    </button>
  ),
);

const EditorToolbar = memo(
  ({
    onFormat,
    onSaveSelection,
    formatState,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    disabled,
    theme,
    onToggleTheme,
    isFullscreen,
    onToggleFullscreen,
    isSourceView,
    onToggleSource,
    onShowShortcuts,
    currentBlock,
    textInfo,
  }) => {
    /* ---- Font family select: reflect the current selection's font ---- */
    const currentFontRaw = textInfo?.fontFamilyRaw || "";
    const fontInList = FONT_OPTIONS.some((f) => f.value === currentFontRaw);
    const showCustomFont =
      currentFontRaw && currentFontRaw !== "Mixed" && !fontInList;

    /* ---- Font size select: reflect the current selection's size ---- */
    const currentSizePx =
      formatState?.fontSize && formatState.fontSize !== "Mixed"
        ? Math.round(parseFloat(formatState.fontSize))
        : null;
    const sizeInList =
      currentSizePx && FONT_SIZE_OPTIONS.includes(currentSizePx);
    const showCustomSize = currentSizePx && !sizeInList;

    return (
      <div
        className="rte-toolbar"
        role="toolbar"
        aria-label="Text formatting toolbar"
      >
        <div className="rte-toolbar-group">
          <ToolbarButton
            onClick={() => onFormat("bold")}
            active={formatState.bold}
            disabled={disabled}
            title="Bold (Ctrl+B)"
            icon={<strong>B</strong>}
          />
          <ToolbarButton
            onClick={() => onFormat("italic")}
            active={formatState.italic}
            disabled={disabled}
            title="Italic (Ctrl+I)"
            icon={<em>I</em>}
          />
          <ToolbarButton
            onClick={() => onFormat("underline")}
            active={formatState.underline}
            disabled={disabled}
            title="Underline (Ctrl+U)"
            icon={<u>U</u>}
          />
          <ToolbarButton
            onClick={() => onFormat("strikethrough")}
            active={formatState.strikethrough}
            disabled={disabled}
            title="Strikethrough (Ctrl+Shift+X)"
            icon={<s>S</s>}
          />
          <ToolbarButton
            onClick={() => onFormat("highlight")}
            active={formatState.highlight}
            disabled={disabled}
            title="Highlight"
            icon="✎"
            className="rte-btn-highlight"
          />
        </div>

        <div className="rte-toolbar-group">
          <ToolbarButton
            onClick={() => onFormat("superscript")}
            active={formatState.superscript}
            disabled={disabled}
            title="Superscript"
            icon="x²"
          />
          <ToolbarButton
            onClick={() => onFormat("subscript")}
            active={formatState.subscript}
            disabled={disabled}
            title="Subscript"
            icon="x₂"
          />
        </div>

        {/* ----- Block / paragraph dropdown ----- */}
        <div className="rte-toolbar-group">
          <select
            className="rte-select"
            value={currentBlock || ""}
            onChange={(e) => onFormat("heading", e.target.value)}
            disabled={disabled}
            aria-label="Block format"
            title="Paragraph style"
          >
            <option value="">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
            <option value="blockquote">Quote</option>
            <option value="pre">Code block</option>
          </select>
        </div>

        <div className="rte-toolbar-group">
          <ToolbarButton
            onClick={() => onFormat("insertUnorderedList")}
            active={formatState.unorderedList}
            disabled={disabled}
            title="Bullet List"
            icon="•"
          />
          <ToolbarButton
            onClick={() => onFormat("insertOrderedList")}
            active={formatState.orderedList}
            disabled={disabled}
            title="Numbered List"
            icon="1."
          />
          <ToolbarButton
            onClick={() => onFormat("outdent")}
            disabled={disabled}
            title="Decrease Indent"
            icon="⇤"
          />
          <ToolbarButton
            onClick={() => onFormat("indent")}
            disabled={disabled}
            title="Increase Indent"
            icon="⇥"
          />
        </div>

        <div className="rte-toolbar-group">
          <ToolbarButton
            onClick={() => onFormat("justifyLeft")}
            disabled={disabled}
            title="Align Left"
            icon="≡"
          />
          <ToolbarButton
            onClick={() => onFormat("justifyCenter")}
            disabled={disabled}
            title="Align Center"
            icon="≣"
          />
          <ToolbarButton
            onClick={() => onFormat("justifyRight")}
            disabled={disabled}
            title="Align Right"
            icon="≡"
          />
          <ToolbarButton
            onClick={() => onFormat("justifyFull")}
            disabled={disabled}
            title="Justify"
            icon="▥"
          />
        </div>

        <div className="rte-toolbar-group">
          <ToolbarButton
            onClick={() => onFormat("table")}
            disabled={disabled}
            title="Insert Table"
            icon="⊞"
          />
          <ToolbarButton
            onClick={() => onFormat("hr")}
            disabled={disabled}
            title="Horizontal Rule"
            icon="―"
          />
          <ToolbarButton
            onClick={() => onFormat("blockquote")}
            disabled={disabled}
            title="Blockquote"
            icon="❝"
          />
        </div>

        <div className="rte-toolbar-group">
          <div className="rte-color-picker">
            <input
              type="color"
              className="rte-color-input"
              onChange={(e) => onFormat("foreColor", e.target.value)}
              disabled={disabled}
              title="Text Color"
              aria-label="Text color"
            />
          </div>
          <div className="rte-color-picker">
            <input
              type="color"
              className="rte-color-input"
              onChange={(e) => onFormat("backColor", e.target.value)}
              disabled={disabled}
              title="Background Color"
              aria-label="Background color"
            />
          </div>
        </div>

        {/* ----- Font family + size dropdowns (reflect selection) ----- */}
        <div className="rte-toolbar-group">
          <select
            className="rte-select"
            value={currentFontRaw === "Mixed" ? "" : currentFontRaw}
            onMouseDown={onSaveSelection}
            onChange={(e) => {
              if (e.target.value) onFormat("fontName", e.target.value);
            }}
            disabled={disabled}
            aria-label="Font family"
            title="Font family"
          >
            <option value="">
              {currentFontRaw === "Mixed" ? "Mixed" : "Font"}
            </option>
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
            {showCustomFont && (
              <option value={currentFontRaw}>
                {textInfo?.fontFamily || currentFontRaw}
              </option>
            )}
          </select>

          <select
            className="rte-select"
            value={
              formatState.fontSize === "Mixed" ? "" : formatState.fontSize || ""
            }
            onMouseDown={onSaveSelection}
            onChange={(e) => {
              if (e.target.value) onFormat("fontSize", e.target.value);
            }}
            disabled={disabled}
            aria-label="Font size"
            title="Font size"
          >
            <option value="">
              {formatState.fontSize === "Mixed" ? "Mixed" : "Size"}
            </option>
            {FONT_SIZE_OPTIONS.map((s) => (
              <option key={s} value={`${s}px`}>
                {s}
              </option>
            ))}
            {showCustomSize && (
              <option value={`${currentSizePx}px`}>{currentSizePx}</option>
            )}
          </select>
        </div>

        <div className="rte-toolbar-group">
          <ToolbarButton
            onClick={() => onFormat("find")}
            disabled={disabled}
            title="Find & Replace (Ctrl+F)"
            icon="🔍"
          />
        </div>

        <div className="rte-toolbar-group">
          <ToolbarButton
            onClick={onUndo}
            disabled={disabled || !canUndo}
            title="Undo (Ctrl+Z)"
            icon="↶"
          />
          <ToolbarButton
            onClick={onRedo}
            disabled={disabled || !canRedo}
            title="Redo (Ctrl+Y)"
            icon="↷"
          />
          <ToolbarButton
            onClick={() => onFormat("removeFormat")}
            disabled={disabled}
            title="Clear Formatting (Ctrl+\\)"
            icon="✕"
          />
        </div>

        <div className="rte-toolbar-spacer" />

        <div className="rte-toolbar-group" style={{ borderRight: "none" }}>
          <ToolbarButton
            onClick={onShowShortcuts}
            disabled={disabled}
            title="Keyboard shortcuts"
            icon="?"
          />
          <ToolbarButton
            onClick={onToggleTheme}
            title={theme === "light" ? "Dark mode" : "Light mode"}
            icon={theme === "light" ? "🌙" : "☀️"}
          />
          <ToolbarButton
            onClick={onToggleFullscreen}
            disabled={disabled}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            icon={isFullscreen ? "⤡" : "⤢"}
          />
        </div>
      </div>
    );
  },
);

/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */
export const RichTextEditor = ({
  label = "Content",
  name,
  value = "",
  onChange,
  required = false,
  error,
  placeholder = "Start typing...",
  disabled = false,
  readOnly = false,
  height = "360px",
  showStatusBar = true,
  showTextInfoBar = true,
  maxLength,
  uploadImage,
}) => {
  const editorRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const savedRangeRef = useRef(null);
  const historyTimeoutRef = useRef(null);
  const isComposingRef = useRef(false);
  const toastTimeoutRef = useRef(null);
  const tableToolbarRef = useRef(null);
  const bubbleToolbarRef = useRef(null);
  const imageToolbarRef = useRef(null);
  const securityModalDismissedRef = useRef(false);

  const dragModeRef = useRef(null);
  const dragDataRef = useRef({});
  const selectedCellsRef = useRef([]);
  const selectedImageRef = useRef(null);

  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    superscript: false,
    subscript: false,
    orderedList: false,
    unorderedList: false,
    fontSize: "",
    link: false,
  });
  const [currentBlock, setCurrentBlock] = useState("");
  const [textInfo, setTextInfo] = useState({
    fontFamily: "Default",
    fontFamilyRaw: "",
    fontSize: "",
    fontSizePt: null,
    blockType: "Paragraph",
    blockTag: "",
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    superscript: false,
    subscript: false,
    foreColor: "",
    backColor: "",
    textAlign: "left",
    lineHeight: "",
    letterSpacing: "",
    direction: "ltr",
    listType: "",
  });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showFindModal, setShowFindModal] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [securityAlert, setSecurityAlert] = useState(null);
  const [linkInitial, setLinkInitial] = useState({ url: "", text: "" });
  const [findMatchCount, setFindMatchCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSourceView, setIsSourceView] = useState(false);
  const [sourceHTML, setSourceHTML] = useState("");
  const [toast, setToast] = useState("");
  const [tableToolbar, setTableToolbar] = useState(null);
  const [bubbleToolbar, setBubbleToolbar] = useState(null);
  const [imageToolbar, setImageToolbar] = useState(null);
  const [cellVAlign, setCellVAlign] = useState("");

  const history = useHistory("", 50);

  /* ---- helpers ---- */
  const getSelectionFontSize = useCallback(() => {
    const selection = window.getSelection();
    if (!editorRef.current || !selection || selection.rangeCount === 0)
      return "";
    const range = selection.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return "";
    const sizes = new Set();
    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
    );
    let node = walker.nextNode();
    while (node) {
      if (node.textContent && range.intersectsNode(node)) {
        const size = window.getComputedStyle(node.parentElement).fontSize;
        if (size) sizes.add(size);
      }
      node = walker.nextNode();
    }
    if (sizes.size === 1) return [...sizes][0];
    if (sizes.size > 1) return "Mixed";
    const element =
      range.startContainer.nodeType === Node.TEXT_NODE
        ? range.startContainer.parentElement
        : range.startContainer;
    return element && editorRef.current.contains(element)
      ? window.getComputedStyle(element).fontSize
      : "";
  }, []);

  const getCurrentBlock = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return "";
    const node = sel.getRangeAt(0).startContainer;
    const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    const block = el?.closest?.("h1,h2,h3,h4,h5,h6,p,blockquote,pre,li");
    if (!block || !editorRef.current.contains(block)) return "";
    const tag = block.tagName.toLowerCase();
    if (["h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre"].includes(tag))
      return tag;
    return "";
  }, []);

  const updateFormatState = useCallback(() => {
    setFormatState({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikethrough: document.queryCommandState("strikeThrough"),
      superscript: document.queryCommandState("superscript"),
      subscript: document.queryCommandState("subscript"),
      orderedList: document.queryCommandState("insertOrderedList"),
      unorderedList: document.queryCommandState("insertUnorderedList"),
      fontSize: getSelectionFontSize(),
      link: (() => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return false;
        const el = sel.getRangeAt(0).startContainer;
        const domEl = el.nodeType === Node.TEXT_NODE ? el.parentElement : el;
        return !!domEl?.closest?.("a");
      })(),
    });
    setCurrentBlock(getCurrentBlock());
    setTextInfo(getTextInfoFromSelection(editorRef.current));
  }, [getSelectionFontSize, getCurrentBlock]);

  const ensureParagraphs = useCallback((element) => {
    if (!element) return;
    const children = Array.from(element.childNodes);
    children.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        const p = document.createElement("p");
        p.appendChild(node.cloneNode(true));
        element.replaceChild(p, node);
      } else if (node.tagName === "BR" && element.childNodes.length === 1) {
        const p = document.createElement("p");
        p.appendChild(node.cloneNode(true));
        element.replaceChild(p, node);
      }
    });
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(""), 1800);
  }, []);

  const refreshCounts = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    setCharCount(text.length);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  }, []);

  const runSecurityCheck = useCallback(() => {
    if (!editorRef.current) return false;
    const savedSel = SelectionUtils.saveSelection(editorRef.current);
    const { detected, cleaned } = enforceSecurityOnTextNodes(editorRef.current);
    if (cleaned) {
      editorRef.current
        .querySelectorAll("script, iframe, object, embed")
        .forEach((n) => n.remove());
      SelectionUtils.restoreSelection(editorRef.current, savedSel);
      setSecurityAlert({ patterns: detected });
      return true;
    }
    return false;
  }, []);

  /* ---- initial load ---- */
  useEffect(() => {
    if (!editorRef.current) return;
    const sanitized = sanitizeHTML(value || "");
    editorRef.current.innerHTML = sanitized;
    editorRef.current.setAttribute("data-placeholder", placeholder);
    ensureParagraphs(editorRef.current);
    TableUtils.prepareAll(editorRef.current);
    normalizeTableAdjacentBlocks(editorRef.current);
    const { detected, cleaned } = enforceSecurityOnTextNodes(editorRef.current);
    if (cleaned) {
      editorRef.current
        .querySelectorAll("script, iframe, object, embed")
        .forEach((n) => n.remove());
      if (detected.length)
        setTimeout(() => setSecurityAlert({ patterns: detected }), 200);
    }
    history.reset(sanitized);
    updateFormatState();
    const text = editorRef.current.innerText || "";
    setCharCount(text.length);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  }, []);

  useEffect(() => {
    if (isFullscreen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  /* ---- input ---- */
  const handleInput = useCallback(() => {
    if (!editorRef.current || isComposingRef.current) return;

    runSecurityCheck();
    TableUtils.prepareAll(editorRef.current);
    normalizeTableAdjacentBlocks(editorRef.current);

    const text = editorRef.current.innerText || "";
    if (maxLength && text.length > maxLength) {
      const snapshot = history.undo();
      if (snapshot !== null) {
        editorRef.current.innerHTML = snapshot;
        history.push(snapshot);
      }
    }
    const html = editorRef.current.innerHTML;
    const sanitized = sanitizeHTML(html);
    if (onChange) onChange(sanitized);
    refreshCounts();
    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
    historyTimeoutRef.current = setTimeout(() => history.push(sanitized), 500);
    updateFormatState();
  }, [
    onChange,
    history,
    updateFormatState,
    refreshCounts,
    maxLength,
    runSecurityCheck,
  ]);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);
  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
    setTimeout(() => {
      if (editorRef.current) {
        runSecurityCheck();
        normalizeTableAdjacentBlocks(editorRef.current);
        const sanitized = sanitizeHTML(editorRef.current.innerHTML);
        if (onChange) onChange(sanitized);
        refreshCounts();
        updateFormatState();
      }
    }, 0);
  }, [onChange, refreshCounts, runSecurityCheck, updateFormatState]);

  /* ---- paste ---- */
  const handlePaste = useCallback(
    (e) => {
      const cd = e.clipboardData || window.clipboardData;
      if (!cd) return;

      const files = cd.files ? Array.from(cd.files) : [];
      const imgFile = files.find((f) => f.type.startsWith("image/"));
      if (imgFile) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = async (ev) => {
          let src = ev.target.result;
          if (uploadImage) {
            try {
              src = await uploadImage(imgFile);
            } catch {
              /* fallback base64 */
            }
          }
          document.execCommand(
            "insertHTML",
            false,
            `<img src="${src}" alt="${imgFile.name}" style="max-width:100%;height:auto;" />`,
          );
          setTimeout(() => handleInput(), 0);
        };
        reader.readAsDataURL(imgFile);
        return;
      }

      if (e.shiftKey) {
        e.preventDefault();
        const text = cd.getData("text/plain");
        const detected = detectDangerousInHTML(text);
        if (detected.length) {
          setSecurityAlert({ patterns: detected });
          return;
        }
        document.execCommand("insertText", false, text);
        setTimeout(() => handleInput(), 0);
        return;
      }

      e.preventDefault();
      const pastedHTML = cd.getData("text/html");
      const pastedText = cd.getData("text/plain");
      const rawHTML = pastedHTML || pastedText;
      const detected = detectDangerousInHTML(rawHTML);
      if (detected.length) setSecurityAlert({ patterns: detected });

      const content = pastedHTML ? sanitizeHTML(pastedHTML) : pastedText;
      document.execCommand("insertHTML", false, content);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!editorRef.current) return;
          editorRef.current
            .querySelectorAll("colgroup")
            .forEach((cg) => cg.remove());
          editorRef.current
            .querySelectorAll("script, iframe, object, embed")
            .forEach((n) => n.remove());
          TableUtils.prepareAll(editorRef.current);
          normalizeTableAdjacentBlocks(editorRef.current);
          runSecurityCheck();
          handleInput();
        });
      });
    },
    [handleInput, uploadImage, runSecurityCheck],
  );

  /* ---- drag & drop ---- */
  const handleDrop = useCallback(
    (e) => {
      const files = e.dataTransfer?.files;
      if (!files || !files.length) return;
      const img = Array.from(files).find((f) => f.type.startsWith("image/"));
      if (!img) return;
      e.preventDefault();
      const reader = new FileReader();
      reader.onload = async (ev) => {
        let src = ev.target.result;
        if (uploadImage) {
          try {
            src = await uploadImage(img);
          } catch {
            /* fallback */
          }
        }
        const range = document.caretRangeFromPoint?.(e.clientX, e.clientY);
        if (range) {
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
        document.execCommand(
          "insertHTML",
          false,
          `<img src="${src}" alt="${img.name}" style="max-width:100%;height:auto;" />`,
        );
        setTimeout(() => handleInput(), 0);
      };
      reader.readAsDataURL(img);
    },
    [handleInput, uploadImage],
  );

  const handleDragOver = useCallback((e) => {
    if (e.dataTransfer?.types?.includes("Files")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  }, []);

  /* ---- undo / redo ---- */
  const handleUndo = useCallback(() => {
    const prevContent = history.undo();
    if (prevContent !== null && editorRef.current) {
      editorRef.current.innerHTML = prevContent;
      ensureParagraphs(editorRef.current);
      TableUtils.prepareAll(editorRef.current);
      normalizeTableAdjacentBlocks(editorRef.current);
      if (onChange) onChange(prevContent);
      refreshCounts();
      updateFormatState();
    }
  }, [history, onChange, ensureParagraphs, refreshCounts, updateFormatState]);

  const handleRedo = useCallback(() => {
    const nextContent = history.redo();
    if (nextContent !== null && editorRef.current) {
      editorRef.current.innerHTML = nextContent;
      ensureParagraphs(editorRef.current);
      TableUtils.prepareAll(editorRef.current);
      normalizeTableAdjacentBlocks(editorRef.current);
      if (onChange) onChange(nextContent);
      refreshCounts();
      updateFormatState();
    }
  }, [history, onChange, ensureParagraphs, refreshCounts, updateFormatState]);

  /* ---- markdown shortcuts ---- */
  const tryMarkdownShortcut = useCallback(
    (e) => {
      if (e.key !== " ") return false;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return false;
      const node = sel.anchorNode;
      if (!node || node.nodeType !== Node.TEXT_NODE) return false;
      const text = node.textContent || "";
      const offset = sel.anchorOffset;
      const before = text.slice(0, offset);

      const patterns = [
        { re: /^(#{1,6})$/, apply: (m) => ({ block: `h${m[1].length}` }) },
        { re: /^[-*]$/, apply: () => ({ list: "ul" }) },
        { re: /^(\d+)\.$/, apply: () => ({ list: "ol" }) },
        { re: /^>$/, apply: () => ({ block: "blockquote" }) },
        { re: /^(```)$/, apply: () => ({ block: "pre" }) },
        { re: /^(---|___|\*\*\*)$/, apply: () => ({ hr: true }) },
      ];

      for (const p of patterns) {
        const m = before.match(p.re);
        if (!m) continue;
        const beforeMarker = text.slice(0, offset - m[0].length);
        if (beforeMarker.trim().length > 0) continue;

        e.preventDefault();
        const newText =
          text.slice(0, offset - m[0].length) + text.slice(offset);
        node.textContent = newText;
        const range = document.createRange();
        range.setStart(node, offset - m[0].length);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);

        const result = p.apply(m);
        if (result.hr)
          document.execCommand("insertHorizontalRule", false, null);
        else if (result.list === "ul")
          document.execCommand("insertUnorderedList", false, null);
        else if (result.list === "ol")
          document.execCommand("insertOrderedList", false, null);
        else if (result.block)
          document.execCommand("formatBlock", false, result.block);
        setTimeout(() => handleInput(), 0);
        return true;
      }
      return false;
    },
    [handleInput],
  );

  /* ---- table Tab ---- */
  const handleTableTab = useCallback(
    (e) => {
      if (e.key !== "Tab") return false;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return false;
      const node = sel.getRangeAt(0).startContainer;
      const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
      const cell = el?.closest?.("td, th");
      if (!cell || !editorRef.current?.contains(cell)) return false;

      e.preventDefault();
      const table = cell.closest("table");
      const cells = Array.from(table.querySelectorAll("td, th"));
      const idx = cells.indexOf(cell);
      if (e.shiftKey) {
        const prev = cells[idx - 1];
        if (prev) TableUtils.focusCell(prev, true);
      } else {
        const next = cells[idx + 1];
        if (next) TableUtils.focusCell(next, false);
        else {
          const newRow = TableUtils.insertRow(cell, "below");
          const firstCell = newRow?.cells?.[0];
          if (firstCell) TableUtils.focusCell(firstCell, false);
        }
      }
      setTimeout(() => handleInput(), 0);
      return true;
    },
    [handleInput],
  );

  /* ---- keyboard ---- */
  const handleKeyDown = useCallback(
    (e) => {
      if (handleTableTab(e)) return;
      if (tryMarkdownShortcut(e)) return;

      if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
        setTimeout(() => {
          if (!editorRef.current) return;
          normalizeTableAdjacentBlocks(editorRef.current);
          resetCaretBlockIfAdjacentToTable(editorRef.current);
        }, 0);

        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const node = range.startContainer;
          const el =
            node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
          const wrapper = el && el.closest(".rte-table-wrapper");
          if (
            wrapper &&
            editorRef.current &&
            editorRef.current.contains(wrapper)
          ) {
            const cell = el.closest("td, th");
            if (cell) {
              const table = cell.closest("table");
              const lastRow = table.rows[table.rows.length - 1];
              const lastCell = lastRow.cells[lastRow.cells.length - 1];
              if (cell === lastCell) {
                e.preventDefault();
                const p = document.createElement("p");
                p.innerHTML = "<br>";
                p.style.setProperty("margin-left", "0", "important");
                p.style.setProperty("text-indent", "0", "important");
                p.style.setProperty("padding-left", "0", "important");
                wrapper.after(p);
                const newRange = document.createRange();
                newRange.setStart(p, 0);
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);
                setTimeout(() => handleInput(), 0);
                return;
              }
            }
          }
          const para = el && el.closest("p, div");
          if (para && editorRef.current && editorRef.current.contains(para)) {
            const ml = parseFloat(para.style.marginLeft) || 0;
            if (ml > 0) {
              setTimeout(() => {
                const newSel = window.getSelection();
                if (newSel && newSel.rangeCount > 0) {
                  const newNode = newSel.getRangeAt(0).startContainer;
                  const newEl =
                    newNode.nodeType === Node.TEXT_NODE
                      ? newNode.parentElement
                      : newNode;
                  const newPara = newEl && newEl.closest("p, div");
                  if (newPara && newPara !== para) resetBlockIndent(newPara);
                }
              }, 0);
            }
          }
        }
      }

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === "b") {
        e.preventDefault();
        document.execCommand("bold");
        updateFormatState();
        setTimeout(handleInput, 0);
      } else if (ctrl && e.key === "i") {
        e.preventDefault();
        document.execCommand("italic");
        updateFormatState();
        setTimeout(handleInput, 0);
      } else if (ctrl && e.key === "u") {
        e.preventDefault();
        document.execCommand("underline");
        updateFormatState();
        setTimeout(handleInput, 0);
      } else if (ctrl && e.shiftKey && (e.key === "X" || e.key === "x")) {
        e.preventDefault();
        document.execCommand("strikeThrough");
        updateFormatState();
        setTimeout(handleInput, 0);
      } else if (ctrl && e.shiftKey && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
        toggleSourceView();
      } else if (ctrl && e.shiftKey && (e.key === "V" || e.key === "v")) {
        /* handled in paste */
      } else if (ctrl && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        savedSelectionRef.current = SelectionUtils.saveSelection(
          editorRef.current,
        );
        const sel = window.getSelection();
        const anchorEl = sel?.anchorNode?.parentElement;
        const a = anchorEl?.closest?.("a");
        setLinkInitial({
          url: a?.getAttribute("href") || "",
          text: a?.textContent || "",
        });
        setShowLinkModal(true);
      } else if (ctrl && (e.key === "f" || e.key === "F")) {
        e.preventDefault();
        setShowFindModal(true);
      } else if (ctrl && e.key === "\\") {
        e.preventDefault();
        applyFormat("removeFormat");
      } else if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (ctrl && e.key === "y") ||
        (ctrl && e.shiftKey && (e.key === "z" || e.key === "Z"))
      ) {
        e.preventDefault();
        handleRedo();
      } else if (
        maxLength &&
        (editorRef.current?.innerText || "").length >= maxLength &&
        ![
          "Backspace",
          "Delete",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Tab",
        ].includes(e.key) &&
        !ctrl
      ) {
        e.preventDefault();
      }
    },
    [
      handleInput,
      handleUndo,
      handleRedo,
      updateFormatState,
      maxLength,
      tryMarkdownShortcut,
      handleTableTab,
    ],
  );

  const applyFormat = useCallback(
    (command, value = null) => {
      if (disabled || readOnly) return;

      if (command === "fontSize") {
        if (savedRangeRef.current && editorRef.current) {
          const sr = savedRangeRef.current;
          if (editorRef.current.contains(sr.commonAncestorContainer)) {
            editorRef.current.focus({ preventScroll: true });
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(sr);
          } else {
            editorRef.current.focus({ preventScroll: true });
          }
        } else {
          editorRef.current?.focus({ preventScroll: true });
        }
      } else {
        editorRef.current?.focus();
      }

      if (
        savedSelectionRef.current &&
        editorRef.current &&
        ["link", "image", "table", "fontName"].includes(command)
      ) {
        SelectionUtils.restoreSelection(
          editorRef.current,
          savedSelectionRef.current,
        );
      }

      switch (command) {
        case "heading":
          document.execCommand(
            "formatBlock",
            false,
            value && value !== "" ? value : "p",
          );
          break;
        case "link": {
          savedSelectionRef.current = SelectionUtils.saveSelection(
            editorRef.current,
          );
          const sel = window.getSelection();
          const anchorEl = sel?.anchorNode?.parentElement;
          const a = anchorEl?.closest?.("a");
          setLinkInitial({
            url: a?.getAttribute("href") || "",
            text: a?.textContent || SelectionUtils.getSelectedText() || "",
          });
          setShowLinkModal(true);
          return;
        }
        case "unlink":
          document.execCommand("unlink", false, null);
          break;
        case "image":
          savedSelectionRef.current = SelectionUtils.saveSelection(
            editorRef.current,
          );
          setShowImageModal(true);
          return;
        case "table":
          savedSelectionRef.current = SelectionUtils.saveSelection(
            editorRef.current,
          );
          setShowTableModal(true);
          return;
        case "find":
          setShowFindModal(true);
          return;
        case "blockquote":
          document.execCommand("formatBlock", false, "blockquote");
          break;
        case "code":
          document.execCommand("formatBlock", false, "pre");
          break;
        case "highlight":
          document.execCommand(
            "hiliteColor",
            false,
            formatState.highlight ? "transparent" : "#ffe066",
          );
          break;
        case "hr":
          document.execCommand("insertHorizontalRule", false, null);
          break;
        case "indent":
          document.execCommand("indent", false, null);
          break;
        case "outdent":
          document.execCommand("outdent", false, null);
          break;
        case "removeFormat":
          document.execCommand("removeFormat", false, null);
          document.execCommand("formatBlock", false, "p");
          break;
        case "foreColor":
        case "backColor":
          if (value) document.execCommand(command, false, value);
          break;
        case "fontName": {
          if (!value) break;
          const editor = editorRef.current;
          if (!editor) break;

          /* Make sure the editor actually has focus and the caret/selection is live */
          editor.focus({ preventScroll: true });
          if (savedSelectionRef.current) {
            SelectionUtils.restoreSelection(editor, savedSelectionRef.current);
          }
          const sel = window.getSelection();
          if (!sel || sel.rangeCount === 0) break;

          /* Use CSS so the browser writes an inline style we can detect later
     (getExplicitFontFamily walks inline style / <font face>). */
          try {
            document.execCommand("styleWithCSS", false, true);
          } catch {
            /* older browsers */
          }

          document.execCommand("fontName", false, value);

          /* Some browsers (Chrome/Safari) also emit a <font face> wrapper when
     styleWithCSS is not honoured — normalise it back to an inline style. */
          const range = sel.getRangeAt(0);
          let container =
            range.commonAncestorContainer.nodeType === Node.TEXT_NODE
              ? range.commonAncestorContainer.parentElement
              : range.commonAncestorContainer;
          if (container && editor.contains(container)) {
            const fontTags = [];
            if (container.tagName === "FONT") fontTags.push(container);
            container
              .querySelectorAll?.("font[face]")
              .forEach((f) => fontTags.push(f));
            fontTags.forEach((f) => {
              const span = document.createElement("span");
              span.style.fontFamily = f.getAttribute("face") || value;
              while (f.firstChild) span.appendChild(f.firstChild);
              f.parentNode.replaceChild(span, f);
            });
          }

          /* Keep the saved range in sync so repeated dropdown changes work. */
          savedRangeRef.current = sel.getRangeAt(0).cloneRange();
          savedSelectionRef.current = SelectionUtils.saveSelection(editor);
          break;
        }
        case "fontSize": {
          if (!value) break;
          const sel = window.getSelection();
          if (!sel || sel.rangeCount === 0 || sel.isCollapsed) break;
          const range = sel.getRangeAt(0);
          if (!editorRef.current.contains(range.commonAncestorContainer)) break;
          const span = document.createElement("span");
          span.style.fontSize = value;
          try {
            const extracted = range.extractContents();
            span.appendChild(extracted);
            range.insertNode(span);
            const newRange = document.createRange();
            newRange.setStartAfter(span);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
          } catch {
            const text = sel.toString();
            if (text) {
              range.deleteContents();
              span.textContent = text;
              range.insertNode(span);
            }
          }
          break;
        }
        default:
          document.execCommand(command, false, value);
      }

      updateFormatState();
      setTimeout(handleInput, 0);
    },
    [disabled, readOnly, handleInput, updateFormatState, formatState.highlight],
  );

  const handleLinkInsert = useCallback(
    ({ url, text, newTab }) => {
      setShowLinkModal(false);
      if (!url) return;
      if (/^\s*javascript\s*:/i.test(url)) {
        setSecurityAlert({ patterns: ["javascript: URL"] });
        return;
      }
      editorRef.current?.focus();
      if (savedSelectionRef.current && editorRef.current) {
        SelectionUtils.restoreSelection(
          editorRef.current,
          savedSelectionRef.current,
        );
      }
      const sel = window.getSelection();
      const anchorEl = sel?.anchorNode?.parentElement;
      const existingLink = anchorEl?.closest?.("a");
      if (existingLink) {
        existingLink.setAttribute("href", url);
        if (newTab) {
          existingLink.setAttribute("target", "_blank");
          existingLink.setAttribute("rel", "noopener noreferrer");
        } else {
          existingLink.removeAttribute("target");
          existingLink.removeAttribute("rel");
        }
        if (text && text !== existingLink.textContent)
          existingLink.textContent = text;
        setTimeout(handleInput, 0);
        return;
      }
      if (text && !SelectionUtils.getSelectedText()) {
        document.execCommand("insertText", false, text);
        const range = window.getSelection().getRangeAt(0);
        range.setStart(range.endContainer, range.endOffset - text.length);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
      }
      document.execCommand("createLink", false, url);
      const sel2 = window.getSelection();
      if (sel2.anchorNode) {
        const link = sel2.anchorNode.parentElement;
        if (link && link.tagName === "A") {
          if (newTab) {
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener noreferrer");
          }
        }
      }
      setTimeout(handleInput, 0);
    },
    [handleInput],
  );

  const handleImageInsert = useCallback(
    ({ url, alt }) => {
      setShowImageModal(false);
      if (!url) return;
      if (/^\s*(javascript|vbscript)\s*:/i.test(url)) {
        setSecurityAlert({ patterns: ["unsafe image URL"] });
        return;
      }
      editorRef.current?.focus();
      if (savedSelectionRef.current && editorRef.current) {
        SelectionUtils.restoreSelection(
          editorRef.current,
          savedSelectionRef.current,
        );
      }
      const safeAlt = (alt || "Image").replace(/"/g, "&quot;");
      const imgHTML = `<img src="${url}" alt="${safeAlt}" style="max-width: 100%; height: auto;" />`;
      document.execCommand("insertHTML", false, imgHTML);
      setTimeout(handleInput, 0);
    },
    [handleInput],
  );

  const handleTableInsert = useCallback(
    ({ rows, cols }) => {
      setShowTableModal(false);
      if (!rows || !cols) return;
      const editor = editorRef.current;
      if (!editor) return;
      const table = document.createElement("table");
      const tbody = document.createElement("tbody");
      for (let i = 0; i < rows; i++) {
        const tr = document.createElement("tr");
        for (let j = 0; j < cols; j++) {
          const cell = document.createElement(i === 0 ? "th" : "td");
          cell.textContent = i === 0 ? "Header" : "Cell";
          tr.appendChild(cell);
        }
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      const trailing = document.createElement("p");
      trailing.innerHTML = "<br>";
      trailing.style.setProperty("margin-left", "0", "important");
      trailing.style.setProperty("text-indent", "0", "important");

      let insertAfter = null;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const anchor = sel.getRangeAt(0).commonAncestorContainer;
        const existingTable = (
          anchor.nodeType === Node.TEXT_NODE ? anchor.parentElement : anchor
        ).closest?.("table");
        if (existingTable)
          insertAfter =
            existingTable.closest(".rte-table-wrapper") || existingTable;
      }

      const leading = document.createElement("p");
      leading.innerHTML = "<br>";
      leading.style.setProperty("margin-left", "0", "important");
      leading.style.setProperty("text-indent", "0", "important");

      if (insertAfter && editor.contains(insertAfter)) {
        insertAfter.after(leading, table, trailing);
      } else {
        const sel2 = window.getSelection();
        let handled = false;
        if (sel2 && sel2.rangeCount > 0) {
          const range2 = sel2.getRangeAt(0);
          const anchor2 = range2.startContainer;
          const anchorEl2 =
            anchor2.nodeType === Node.TEXT_NODE
              ? anchor2.parentElement
              : anchor2;
          let topChild = anchorEl2;
          while (topChild && topChild.parentElement !== editor)
            topChild = topChild.parentElement;
          if (topChild && editor.contains(topChild)) {
            topChild.after(leading, table, trailing);
            handled = true;
          }
        }
        if (!handled) {
          editor.appendChild(leading);
          editor.appendChild(table);
          editor.appendChild(trailing);
        }
      }

      const firstCell = table.querySelector("th, td");
      if (firstCell) {
        firstCell.focus();
        const range = document.createRange();
        range.setStart(firstCell, 0);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      setTimeout(() => {
        handleInput();
        if (editorRef.current) normalizeTableAdjacentBlocks(editorRef.current);
      }, 0);
    },
    [handleInput],
  );

  /* ---- find / replace ---- */
  const handleFindSearch = useCallback((term) => {
    if (!editorRef.current || !term) {
      setFindMatchCount(0);
      return;
    }
    const text = editorRef.current.innerText || "";
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = text.match(regex);
    setFindMatchCount(matches ? matches.length : 0);
  }, []);

  const replaceOnce = useCallback(
    (find, replace) => {
      if (!editorRef.current || !find) return;
      const html = editorRef.current.innerHTML;
      const regex = new RegExp(
        find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      if (regex.test(html)) {
        editorRef.current.innerHTML = html.replace(regex, replace);
        handleInput();
        handleFindSearch(find);
      }
    },
    [handleInput, handleFindSearch],
  );

  const replaceAll = useCallback(
    (find, replace) => {
      if (!editorRef.current || !find) return;
      const html = editorRef.current.innerHTML;
      const regex = new RegExp(
        find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi",
      );
      editorRef.current.innerHTML = html.replace(regex, replace);
      handleInput();
      setFindMatchCount(0);
      showToast("Replaced all matches");
    },
    [handleInput, showToast],
  );

  /* ---- focus / blur / selection ---- */
  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    updateFormatState();
    setTimeout(() => {
      if (editorRef.current) {
        ensureParagraphs(editorRef.current);
        normalizeTableAdjacentBlocks(editorRef.current);
        const sanitized = sanitizeHTML(editorRef.current.innerHTML);
        if (onChange) onChange(sanitized);
      }
    }, 0);
  }, [updateFormatState, ensureParagraphs, onChange]);

  const handleSelectionChange = useCallback(() => {
    if (
      editorRef.current &&
      SelectionUtils.isSelectionInElement(editorRef.current)
    ) {
      updateFormatState();
      const sel = window.getSelection();
      if (
        sel &&
        sel.rangeCount > 0 &&
        !sel.isCollapsed &&
        !readOnly &&
        !disabled &&
        !isSourceView
      ) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const top = Math.max(8, rect.top - 44);
          const left = Math.max(
            8,
            Math.min(rect.left + rect.width / 2 - 150, window.innerWidth - 320),
          );
          setBubbleToolbar({ top, left });
        } else {
          setBubbleToolbar(null);
        }
      } else {
        setBubbleToolbar(null);
      }
    }
  }, [updateFormatState, readOnly, disabled, isSourceView]);

  const saveSelection = useCallback(() => {
    if (editorRef.current) {
      savedSelectionRef.current = SelectionUtils.saveSelection(
        editorRef.current,
      );
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0)
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      else savedRangeRef.current = null;
    }
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [handleSelectionChange]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (isFullscreen) setIsFullscreen(false);
        if (tableToolbar) setTableToolbar(null);
        if (imageToolbar) {
          setImageToolbar(null);
          selectedImageRef.current?.classList.remove("selected");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen, tableToolbar, imageToolbar]);

  /* ---- table interactions ---- */
  const clearCellSelection = useCallback(() => {
    TableUtils.clearSelection(selectedCellsRef.current);
    selectedCellsRef.current = [];
  }, []);

  const hideTableToolbar = useCallback(() => {
    clearCellSelection();
    setTableToolbar(null);
  }, [clearCellSelection]);

  const positionTableToolbarFor = useCallback((cells) => {
    if (!cells.length) return;
    let top = Infinity,
      left = Infinity,
      right = -Infinity;
    cells.forEach((cell) => {
      const rect = cell.getBoundingClientRect();
      top = Math.min(top, rect.top);
      left = Math.min(left, rect.left);
      right = Math.max(right, rect.right);
    });
    const toolbarHeight = 44;
    const desiredTop = top - toolbarHeight - 6;
    const va = cells[0]?.style?.verticalAlign || "";
    setCellVAlign(va);
    setTableToolbar({
      top: Math.max(8, desiredTop),
      left: Math.max(8, Math.min(left, window.innerWidth - 16)),
      canMerge: cells.length > 1,
      canSplit:
        cells.length === 1 &&
        (parseInt(cells[0].getAttribute("rowspan") || "1", 10) > 1 ||
          parseInt(cells[0].getAttribute("colspan") || "1", 10) > 1),
      cellBg: cells[0]?.style?.backgroundColor || "",
    });
  }, []);

  const startCellSelection = useCallback(
    (cell, table) => {
      clearCellSelection();
      dragModeRef.current = "cell-select";
      dragDataRef.current = { table, anchorCell: cell };
      selectedCellsRef.current = TableUtils.selectRange(table, cell, cell);
    },
    [clearCellSelection],
  );

  const getEditorContentWidth = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return 0;
    const cs = getComputedStyle(editor);
    return (
      editor.clientWidth -
      parseFloat(cs.paddingLeft || 0) -
      parseFloat(cs.paddingRight || 0)
    );
  }, []);

  const startTableResize = useCallback(
    (wrapper, clientX) => {
      dragModeRef.current = "table-resize";
      const editorWidth = getEditorContentWidth();
      const startPct =
        editorWidth > 0 ? (wrapper.offsetWidth / editorWidth) * 100 : 100;
      dragDataRef.current = { wrapper, editorWidth, startX: clientX, startPct };
    },
    [getEditorContentWidth],
  );

  const startTableResizeLeft = useCallback(
    (wrapper, clientX) => {
      dragModeRef.current = "table-resize-left";
      const editorWidth = getEditorContentWidth();
      const startWidthPct =
        editorWidth > 0 ? (wrapper.offsetWidth / editorWidth) * 100 : 100;
      const startMarginPct = parseFloat(wrapper.style.marginLeft) || 0;
      dragDataRef.current = {
        wrapper,
        editorWidth,
        startX: clientX,
        startWidthPct,
        startMarginPct,
      };
    },
    [getEditorContentWidth],
  );

  const startTableResizeBottom = useCallback((wrapper, clientY) => {
    dragModeRef.current = "table-resize-bottom";
    dragDataRef.current = {
      wrapper,
      startY: clientY,
      startHeight: wrapper.offsetHeight,
    };
  }, []);

  const startColumnResize = useCallback((cell, table, clientX) => {
    const colgroup = TableUtils.freezeColumnWidths(table);
    if (!colgroup) return;
    const colIndex = TableUtils.getColIndex(cell);
    const col = colgroup.children[colIndex];
    if (!col) return;
    const nextCol = colgroup.children[colIndex + 1];
    const startPct =
      parseFloat(col.style.width) || 100 / colgroup.children.length;
    const nextStartPct = nextCol
      ? parseFloat(nextCol.style.width) || 100 / colgroup.children.length
      : 0;
    dragModeRef.current = "col-resize";
    dragDataRef.current = {
      table,
      colgroup,
      colIndex,
      startX: clientX,
      startPct,
      totalPct: startPct + nextStartPct,
    };
  }, []);

  const startRowResize = useCallback((cell, clientY) => {
    const row = cell.closest("tr");
    dragModeRef.current = "row-resize";
    dragDataRef.current = {
      row,
      startY: clientY,
      startHeight: row.getBoundingClientRect().height,
    };
  }, []);

  const handleEditorMouseMove = useCallback((e) => {
    if (dragModeRef.current || !editorRef.current) return;
    if (e.target.classList) {
      if (
        e.target.classList.contains("rte-table-resize-handle") ||
        e.target.classList.contains("rte-table-resize-handle-left")
      ) {
        editorRef.current.style.cursor = "ew-resize";
        return;
      }
      if (e.target.classList.contains("rte-table-resize-handle-bottom")) {
        editorRef.current.style.cursor = "ns-resize";
        return;
      }
      if (e.target.tagName === "IMG") {
        editorRef.current.style.cursor = "pointer";
        return;
      }
    }
    const cell = e.target.closest && e.target.closest("td, th");
    if (!cell || !editorRef.current.contains(cell)) {
      editorRef.current.style.cursor = "";
      return;
    }
    const rect = cell.getBoundingClientRect();
    const nearRight = rect.right - e.clientX <= 6;
    const nearBottom = rect.bottom - e.clientY <= 6;
    editorRef.current.style.cursor = nearRight
      ? "col-resize"
      : nearBottom
        ? "row-resize"
        : "";
  }, []);

  const handleEditorMouseDown = useCallback(
    (e) => {
      if (e.target.tagName === "IMG" && editorRef.current?.contains(e.target)) {
        if (selectedImageRef.current && selectedImageRef.current !== e.target) {
          selectedImageRef.current.classList.remove("selected");
        }
        selectedImageRef.current = e.target;
        e.target.classList.add("selected");
        const rect = e.target.getBoundingClientRect();
        const align = e.target.getAttribute("data-align") || "";
        setImageToolbar({
          top: Math.max(8, rect.top - 40),
          left: Math.max(8, Math.min(rect.left, window.innerWidth - 340)),
          align,
        });
        return;
      } else if (selectedImageRef.current) {
        selectedImageRef.current.classList.remove("selected");
        selectedImageRef.current = null;
        setImageToolbar(null);
      }

      if (e.target.classList) {
        if (e.target.classList.contains("rte-table-resize-handle")) {
          const wrapper = e.target.parentElement;
          if (
            wrapper &&
            editorRef.current &&
            editorRef.current.contains(wrapper)
          ) {
            e.preventDefault();
            startTableResize(wrapper, e.clientX);
            return;
          }
        }
        if (e.target.classList.contains("rte-table-resize-handle-left")) {
          const wrapper = e.target.parentElement;
          if (
            wrapper &&
            editorRef.current &&
            editorRef.current.contains(wrapper)
          ) {
            e.preventDefault();
            startTableResizeLeft(wrapper, e.clientX);
            return;
          }
        }
        if (e.target.classList.contains("rte-table-resize-handle-bottom")) {
          const wrapper = e.target.parentElement;
          if (
            wrapper &&
            editorRef.current &&
            editorRef.current.contains(wrapper)
          ) {
            e.preventDefault();
            startTableResizeBottom(wrapper, e.clientY);
            return;
          }
        }
      }

      const cell = e.target.closest && e.target.closest("td, th");
      if (!cell || !editorRef.current || !editorRef.current.contains(cell))
        return;
      const table = cell.closest("table");
      if (!table) return;

      const rect = cell.getBoundingClientRect();
      const nearRight =
        rect.right - e.clientX <= 6 && e.clientX <= rect.right + 2;
      const nearBottom =
        rect.bottom - e.clientY <= 6 && e.clientY <= rect.bottom + 2;

      if (nearRight) {
        e.preventDefault();
        startColumnResize(cell, table, e.clientX);
        return;
      }
      if (nearBottom) {
        e.preventDefault();
        startRowResize(cell, e.clientY);
        return;
      }
      startCellSelection(cell, table);
    },
    [
      startTableResize,
      startTableResizeLeft,
      startTableResizeBottom,
      startColumnResize,
      startRowResize,
      startCellSelection,
    ],
  );

  useEffect(() => {
    const onDocMouseMove = (e) => {
      const mode = dragModeRef.current;
      if (!mode) return;
      if (mode === "table-resize") {
        const { wrapper, editorWidth, startX, startPct } = dragDataRef.current;
        if (!editorWidth) return;
        const deltaPct = ((e.clientX - startX) / editorWidth) * 100;
        const newPct = Math.min(100, Math.max(10, startPct + deltaPct));
        wrapper.style.width = `${Math.round(newPct * 10) / 10}%`;
      } else if (mode === "table-resize-left") {
        const { wrapper, editorWidth, startX, startWidthPct, startMarginPct } =
          dragDataRef.current;
        if (!editorWidth) return;
        const deltaPct = ((e.clientX - startX) / editorWidth) * 100;
        const newWidthPct = Math.min(
          100,
          Math.max(10, startWidthPct - deltaPct),
        );
        const newMarginPct = Math.min(
          90,
          Math.max(0, startMarginPct + deltaPct),
        );
        if (newMarginPct + newWidthPct <= 100) {
          wrapper.style.width = `${Math.round(newWidthPct * 10) / 10}%`;
          wrapper.style.marginLeft = `${Math.round(newMarginPct * 10) / 10}%`;
        }
      } else if (mode === "table-resize-bottom") {
        const { wrapper, startY, startHeight } = dragDataRef.current;
        const delta = e.clientY - startY;
        const newHeight = Math.max(40, startHeight + delta);
        wrapper.style.minHeight = `${newHeight}px`;
        wrapper.style.overflow = "hidden";
      } else if (mode === "col-resize") {
        const { colgroup, colIndex, startX, startPct, totalPct, table } =
          dragDataRef.current;
        const tableWidth = table.offsetWidth;
        if (!tableWidth) return;
        const deltaPct = ((e.clientX - startX) / tableWidth) * 100;
        const newPct = Math.max(2, startPct + deltaPct);
        const nextCol = colgroup.children[colIndex + 1];
        if (nextCol) {
          const nextPct = Math.max(2, totalPct - newPct);
          colgroup.children[colIndex].style.width =
            `${Math.round(newPct * 10) / 10}%`;
          nextCol.style.width = `${Math.round(nextPct * 10) / 10}%`;
        } else {
          colgroup.children[colIndex].style.width =
            `${Math.round(newPct * 10) / 10}%`;
        }
      } else if (mode === "row-resize") {
        const { row, startY, startHeight } = dragDataRef.current;
        const delta = e.clientY - startY;
        const newHeight = Math.max(24, startHeight + delta);
        Array.from(row.children).forEach((c) => {
          c.style.height = `${newHeight}px`;
        });
      } else if (mode === "cell-select") {
        const { table, anchorCell } = dragDataRef.current;
        const target = document.elementFromPoint(e.clientX, e.clientY);
        const cell = target && target.closest && target.closest("td, th");
        if (!cell || cell.closest("table") !== table) return;
        TableUtils.clearSelection(selectedCellsRef.current);
        selectedCellsRef.current = TableUtils.selectRange(
          table,
          anchorCell,
          cell,
        );
      }
    };

    const onDocMouseUp = () => {
      const mode = dragModeRef.current;
      if (!mode) return;
      dragModeRef.current = null;

      if (mode === "table-resize" || mode === "table-resize-left") {
        const { wrapper } = dragDataRef.current;
        const table = wrapper && wrapper.querySelector("table");
        if (table && wrapper.style.width) {
          table.setAttribute("data-width", wrapper.style.width);
          table.setAttribute(
            "data-margin-left",
            wrapper.style.marginLeft || "0%",
          );
        }
        dragDataRef.current = {};
        setTimeout(() => {
          if (editorRef.current)
            normalizeTableAdjacentBlocks(editorRef.current);
          handleInput();
        }, 0);
      } else if (mode === "table-resize-bottom") {
        dragDataRef.current = {};
        setTimeout(() => {
          if (editorRef.current)
            normalizeTableAdjacentBlocks(editorRef.current);
          handleInput();
        }, 0);
      } else if (mode === "col-resize" || mode === "row-resize") {
        const { table } = dragDataRef.current;
        if (table) {
          const wrapper = table.closest(".rte-table-wrapper");
          if (wrapper && wrapper.style.width)
            table.setAttribute("data-width", wrapper.style.width);
        }
        dragDataRef.current = {};
        setTimeout(() => handleInput(), 0);
      } else if (mode === "cell-select") {
        positionTableToolbarFor(selectedCellsRef.current);
      }
    };

    document.addEventListener("mousemove", onDocMouseMove);
    document.addEventListener("mouseup", onDocMouseUp);
    return () => {
      document.removeEventListener("mousemove", onDocMouseMove);
      document.removeEventListener("mouseup", onDocMouseUp);
    };
  }, [positionTableToolbarFor, handleInput]);

  useEffect(() => {
    const onDocMouseDownCapture = (e) => {
      if (tableToolbarRef.current && tableToolbarRef.current.contains(e.target))
        return;
      if (
        bubbleToolbarRef.current &&
        bubbleToolbarRef.current.contains(e.target)
      )
        return;
      if (imageToolbarRef.current && imageToolbarRef.current.contains(e.target))
        return;

      const cell = e.target.closest && e.target.closest("td, th");
      if (
        cell &&
        selectedCellsRef.current.some(
          (c) => c.closest("table") === cell.closest("table"),
        )
      )
        return;
      if (selectedCellsRef.current.length) hideTableToolbar();
    };
    document.addEventListener("mousedown", onDocMouseDownCapture, true);
    return () =>
      document.removeEventListener("mousedown", onDocMouseDownCapture, true);
  }, [hideTableToolbar]);

  const handleTableToolbarAction = useCallback(
    (action, value) => {
      const cells = selectedCellsRef.current;
      if (!cells.length && action !== "deleteTable") return;
      const referenceCell = cells[0];
      switch (action) {
        case "merge":
          TableUtils.mergeCells(cells);
          break;
        case "split":
          TableUtils.splitCell(referenceCell);
          break;
        case "insertRowAbove":
          TableUtils.insertRow(referenceCell, "above");
          break;
        case "insertRowBelow":
          TableUtils.insertRow(referenceCell, "below");
          break;
        case "insertColLeft":
          TableUtils.insertColumn(referenceCell, "left");
          break;
        case "insertColRight":
          TableUtils.insertColumn(referenceCell, "right");
          break;
        case "deleteRow":
          TableUtils.deleteRow(referenceCell);
          break;
        case "deleteCol":
          TableUtils.deleteColumn(referenceCell);
          break;
        case "deleteTable":
          TableUtils.deleteTable(referenceCell);
          break;
        case "distributeCols":
          TableUtils.distributeColumns(referenceCell.closest("table"));
          break;
        case "valignTop":
          TableUtils.setCellVerticalAlign(cells, "top");
          setCellVAlign("top");
          break;
        case "valignMiddle":
          TableUtils.setCellVerticalAlign(cells, "middle");
          setCellVAlign("middle");
          break;
        case "valignBottom":
          TableUtils.setCellVerticalAlign(cells, "bottom");
          setCellVAlign("bottom");
          break;
        case "cellBg":
          TableUtils.setCellBackground(cells, value);
          break;
        default:
          break;
      }
      if (action !== "cellBg" && !action.startsWith("valign"))
        hideTableToolbar();
      setTimeout(() => {
        if (editorRef.current) normalizeTableAdjacentBlocks(editorRef.current);
        handleInput();
      }, 0);
    },
    [hideTableToolbar, handleInput],
  );

  const handleImageAction = useCallback(
    (action, value) => {
      const img = selectedImageRef.current;
      if (!img) return;
      switch (action) {
        case "align": {
          img.setAttribute("data-align", value);
          img.style.display = "block";
          if (value === "left") {
            img.style.marginLeft = "0";
            img.style.marginRight = "auto";
          } else if (value === "center") {
            img.style.marginLeft = "auto";
            img.style.marginRight = "auto";
          } else if (value === "right") {
            img.style.marginLeft = "auto";
            img.style.marginRight = "0";
          }
          setImageToolbar((t) => (t ? { ...t, align: value } : t));
          break;
        }
        case "size":
          img.style.width = value;
          img.style.height = "auto";
          break;
        case "replace":
          savedSelectionRef.current = null;
          setShowImageModal(true);
          dragDataRef.current.replaceImage = img;
          return;
        case "delete":
          img.remove();
          selectedImageRef.current = null;
          setImageToolbar(null);
          break;
        default:
          break;
      }
      setTimeout(() => handleInput(), 0);
    },
    [handleInput],
  );

  const handleImageInsertWrapped = useCallback(
    (data) => {
      const target = dragDataRef.current.replaceImage;
      if (target && target.parentNode && editorRef.current?.contains(target)) {
        setShowImageModal(false);
        target.setAttribute("src", data.url);
        if (data.alt) target.setAttribute("alt", data.alt);
        dragDataRef.current.replaceImage = null;
        setImageToolbar(null);
        selectedImageRef.current?.classList.remove("selected");
        selectedImageRef.current = null;
        setTimeout(() => handleInput(), 0);
        return;
      }
      handleImageInsert(data);
    },
    [handleImageInsert, handleInput],
  );

  /* ---- source view ---- */
  const toggleSourceView = useCallback(() => {
    if (!editorRef.current) return;
    if (!isSourceView) {
      const html = editorRef.current.innerHTML;
      setSourceHTML(html);
      setIsSourceView(true);
    } else {
      const detected = detectDangerousInHTML(sourceHTML);
      if (detected.length) setSecurityAlert({ patterns: detected });
      const sanitized = sanitizeHTML(sourceHTML);
      editorRef.current.innerHTML = sanitized;
      enforceSecurityOnTextNodes(editorRef.current);
      editorRef.current
        .querySelectorAll("script, iframe, object, embed")
        .forEach((n) => n.remove());
      ensureParagraphs(editorRef.current);
      TableUtils.prepareAll(editorRef.current);
      normalizeTableAdjacentBlocks(editorRef.current);
      setIsSourceView(false);
      if (onChange) onChange(sanitized);
      refreshCounts();
      setTimeout(() => handleInput(), 0);
    }
  }, [
    isSourceView,
    sourceHTML,
    onChange,
    ensureParagraphs,
    refreshCounts,
    handleInput,
  ]);

  const containerClasses = [
    "rte-container",
    isFocused ? "focus" : "",
    error ? "error" : "",
    disabled ? "disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const isOverLimit = maxLength && charCount >= maxLength;
  const isNearLimit = maxLength && !isOverLimit && charCount >= maxLength * 0.9;

  return (
    <div className="rte-scope" data-theme={theme}>
      <style>{RTE_STYLES}</style>

      <div className={`rte-wrapper ${isFullscreen ? "fullscreen" : ""}`}>
        <div style={{ width: "100%" }}>
          {label && (
            <label
              className={`rte-label ${required ? "rte-label-required" : ""}`}
            >
              {label}
            </label>
          )}

          <div className={containerClasses}>
            <EditorToolbar
              onFormat={applyFormat}
              onSaveSelection={saveSelection}
              formatState={formatState}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={history.canUndo}
              canRedo={history.canRedo}
              disabled={disabled || readOnly}
              theme={theme}
              onToggleTheme={() =>
                setTheme((t) => (t === "light" ? "dark" : "light"))
              }
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen((f) => !f)}
              isSourceView={isSourceView}
              onToggleSource={toggleSourceView}
              onShowShortcuts={() => setShowShortcuts(true)}
              currentBlock={currentBlock}
              textInfo={textInfo}
            />

            {isSourceView ? (
              <textarea
                className="rte-source-view"
                value={sourceHTML}
                onChange={(e) => setSourceHTML(e.target.value)}
                spellCheck={false}
                style={{ minHeight: height }}
              />
            ) : (
              <div
                ref={editorRef}
                className="rte-editor"
                contentEditable={!disabled && !readOnly}
                onInput={handleInput}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                onPaste={handlePaste}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onKeyDown={handleKeyDown}
                onKeyUp={updateFormatState}
                onMouseUp={updateFormatState}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onMouseDown={handleEditorMouseDown}
                onMouseMove={handleEditorMouseMove}
                style={{ minHeight: height, height: "auto" }}
                aria-label={label || "Rich text editor"}
                role="textbox"
                aria-multiline="true"
                aria-required={required}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                name={name}
              />
            )}

            {showTextInfoBar && !isSourceView && (
              <TextInfoBar info={textInfo} visible={true} />
            )}

            {showStatusBar && (
              <div className="rte-status-bar">
                <div className="rte-status-info">
                  <span
                    className={
                      isOverLimit
                        ? "over-limit"
                        : isNearLimit
                          ? "near-limit"
                          : ""
                    }
                  >
                    {charCount}
                    {maxLength ? ` / ${maxLength}` : ""} characters
                  </span>
                  <span>{wordCount} words</span>
                  {toast && <span className="rte-toast">{toast}</span>}
                </div>
                <div className="rte-status-info">
                  <span style={{ fontSize: 11 }}>
                    {isSourceView ? "HTML Source" : "Rich Text"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && <span className="rte-error">{error}</span>}
        </div>
      </div>

      {tableToolbar && (
        <div ref={tableToolbarRef}>
          <TableToolbar
            top={tableToolbar.top}
            left={tableToolbar.left}
            canMerge={tableToolbar.canMerge}
            canSplit={tableToolbar.canSplit}
            cellBg={tableToolbar.cellBg}
            cellVAlign={cellVAlign}
            onAction={handleTableToolbarAction}
            onClose={hideTableToolbar}
          />
        </div>
      )}

      {bubbleToolbar && !tableToolbar && !imageToolbar && (
        <div ref={bubbleToolbarRef}>
          <BubbleToolbar
            top={bubbleToolbar.top}
            left={bubbleToolbar.left}
            formatState={formatState}
            onFormat={applyFormat}
            onLink={() => applyFormat("link")}
            onUnlink={() => applyFormat("unlink")}
          />
        </div>
      )}

      {/* {imageToolbar && (
        <div ref={imageToolbarRef}>
          <ImageToolbar
            top={imageToolbar.top}
            left={imageToolbar.left}
            align={imageToolbar.align}
            onAction={handleImageAction}
            onClose={() => {
              selectedImageRef.current?.classList.remove("selected");
              selectedImageRef.current = null;
              setImageToolbar(null);
            }}
          />
        </div>
      )} */}

      {/* {showLinkModal && (
        <LinkModal
          onInsert={handleLinkInsert}
          onClose={() => setShowLinkModal(false)}
          initialUrl={linkInitial.url}
          initialText={linkInitial.text}
        />
      )} */}
      {/* {showImageModal && (
        <ImageModal
          onInsert={handleImageInsertWrapped}
          onClose={() => setShowImageModal(false)}
        />
      )} */}
      {showTableModal && (
        <TableModal
          onInsert={handleTableInsert}
          onClose={() => setShowTableModal(false)}
        />
      )}
      {showFindModal && (
        <FindReplaceModal
          onFind={handleFindSearch}
          onReplace={replaceOnce}
          onReplaceAll={replaceAll}
          onClose={() => {
            setShowFindModal(false);
            setFindMatchCount(0);
          }}
          matchCount={findMatchCount}
        />
      )}
      {showShortcuts && (
        <ShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
      {securityAlert && (
        <SecurityModal
          patterns={securityAlert.patterns}
          onClose={() => setSecurityAlert(null)}
        />
      )}
    </div>
  );
};

export default RichTextEditor;
