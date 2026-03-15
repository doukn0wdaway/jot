import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

const kitty = {
  bg: "#222436",
  fg: "#c8d3f5",
  selection: "#2d3f76",
  cursor: "#c8d3f5",
  cursorText: "#222436",
  url: "#4fd6be",

  // Normal colors
  black: "#1b1d2b",
  red: "#ff757f",
  green: "#c3e88d",
  yellow: "#ffc777",
  blue: "#82aaff",
  magenta: "#c099ff",
  cyan: "#86e1fc",
  white: "#828bb8",

  // Bright/Extended
  orange: "#ff966c",
  darkRed: "#c53b53",
  gray: "#444a73",
  lightWhite: "#c8d3f5",
};

export const tokyoNightMoonTheme = EditorView.theme(
  {
    "&": {
      color: kitty.fg,
      backgroundColor: kitty.bg,
    },
    ".cm-content": {
      caretColor: kitty.cursor,
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: kitty.cursor,
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection":
      {
        backgroundColor: kitty.selection,
        color: kitty.fg,
      },
    ".cm-gutters": {
      backgroundColor: kitty.bg,
      color: kitty.gray,
      border: "none",
    },
    ".cm-activeLine": {
      backgroundColor: "#2f334d66", // inactive_tab_background с прозрачностью
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#2f334d66",
      color: kitty.blue,
    },
    // Стиль для Vim-курсора (блочный)
    ".cm-fat-cursor": {
      backgroundColor: `${kitty.cursor} !important`,
      color: `${kitty.cursorText} !important`,
    },
    "&.cm-focused .cm-fat-cursor": {
      backgroundColor: `${kitty.cursor} !important`,
    },
    // Тултипы
    ".cm-tooltip": {
      backgroundColor: kitty.black,
      border: `1px solid ${kitty.gray}`,
      color: kitty.fg,
    },
  },
  { dark: true },
);

export const tokyoNightMoonHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.operator, t.modifier], color: kitty.magenta },
  { tag: [t.string, t.regexp, t.special(t.string)], color: kitty.green },
  {
    tag: [t.variableName, t.definition(t.variableName), t.propertyName],
    color: kitty.cyan,
  },
  { tag: [t.function(t.variableName), t.labelName], color: kitty.blue },
  { tag: [t.typeName, t.className, t.number, t.changed], color: kitty.orange },
  { tag: [t.comment, t.quote], color: kitty.gray, fontStyle: "italic" },
  {
    tag: [t.heading1, t.heading2, t.heading3],
    color: kitty.blue,
    fontWeight: "bold",
  },
  { tag: [t.url, t.link], color: kitty.url, textDecoration: "underline" },
  { tag: [t.strong], fontWeight: "bold", color: kitty.orange },
  { tag: [t.emphasis], fontStyle: "italic", color: kitty.magenta },
  { tag: [t.strikethrough], textDecoration: "line-through" },
  { tag: [t.atom, t.bool], color: kitty.orange },
  { tag: [t.invalid], color: kitty.darkRed },
]);

export const tokyoNightMoon = [
  tokyoNightMoonTheme,
  syntaxHighlighting(tokyoNightMoonHighlight),
];
