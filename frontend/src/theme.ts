import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

export const colors = {
  bg: "#222436",
  bgDarker: "#181a36",
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
      fontSize: "14px",
      color: colors.fg,
      backgroundColor: colors.bg,
    },
    ".cm-content": {
      caretColor: colors.cursor,
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: colors.cursor,
    },
    ".cm-selectionBackground, ::selection": {
      backgroundColor: `${colors.selection} !important`,
    },
    ".cm-gutters": {
      backgroundColor: colors.bg,
      color: colors.gray,
      border: "none",
    },
    ".cm-activeLine": {
      backgroundColor: "#2f334d66", // inactive_tab_background с прозрачностью
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#2f334d66",
      color: colors.blue,
    },
    // Стиль для Vim-курсора (блочный)
    ".cm-fat-cursor": {
      backgroundColor: `${colors.cursor} !important`,
      color: `${colors.cursorText} !important`,
    },
    "&.cm-focused .cm-fat-cursor": {
      backgroundColor: `${colors.cursor} !important`,
    },
    // Тултипы
    ".cm-tooltip": {
      backgroundColor: colors.black,
      border: `1px solid ${colors.gray}`,
      color: colors.fg,
    },

    ".cm-vim-panel": {
      backgroundColor: colors.bgDarker,
      "& *": {
        backgroundColor: "transparent !important",
        border: "none !important",
        outline: "none !important",
      },
    },
    ".cm-vim-panel input": {
      all: "unset",

      color: `${colors.lightWhite} !important`,
      backgroundColor: "transparent !important",

      display: "inline-block",
      flex: "1",
      fontFamily: "monospace",
      fontSize: "inherit",
      caretColor: colors.cursor,
    },

    ".cm-vim-panel span": {
      color: colors.lightWhite,
      display: "flex",
      alignItems: "center",
    },
  },
  { dark: true },
);

export const tokyoNightMoonHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.operator, t.modifier], color: colors.magenta },
  { tag: [t.string, t.regexp, t.special(t.string)], color: colors.green },
  {
    tag: [t.variableName, t.definition(t.variableName), t.propertyName],
    color: colors.cyan,
  },
  { tag: [t.function(t.variableName), t.labelName], color: colors.blue },
  { tag: [t.typeName, t.className, t.number, t.changed], color: colors.orange },
  { tag: [t.comment, t.quote], color: colors.gray, fontStyle: "italic" },
  {
    tag: [t.heading1, t.heading2, t.heading3],
    color: colors.blue,
    fontWeight: "bold",
  },
  { tag: [t.url, t.link], color: colors.url, textDecoration: "underline" },
  { tag: [t.strong], fontWeight: "bold", color: colors.orange },
  { tag: [t.emphasis], fontStyle: "italic", color: colors.magenta },
  { tag: [t.strikethrough], textDecoration: "line-through" },
  { tag: [t.atom, t.bool], color: colors.orange },
  { tag: [t.invalid], color: colors.darkRed },
]);

export const tokyoNightMoon = [
  tokyoNightMoonTheme,
  syntaxHighlighting(tokyoNightMoonHighlight),
];
