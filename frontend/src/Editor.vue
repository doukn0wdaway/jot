<script lang="ts" setup>
import { onMounted, onUnmounted, shallowRef, watch } from "vue";
import { EditorView, minimalSetup } from "codemirror";
import { Compartment, EditorState } from "@codemirror/state";
import { getCM, Vim, vim } from "@replit/codemirror-vim";
import { autocompletion } from "@codemirror/autocomplete";
import { markdown } from "@codemirror/lang-markdown";
import { javascript } from "@codemirror/lang-javascript";
import { languages } from "@codemirror/language-data";
import { tokyoNightMoon } from "./theme";
import { togglePalette, isPaletteOpen, isVimModeEnabled } from "./store";
import Palette from "./Palette.vue";
import { addVimHandler } from "./hotkeys";

const props = defineProps<{
  initialValue?: string;
  tags: string[];
  onSave: (text: string) => void;
  onNew: () => void;
}>();

const editorRef = shallowRef<HTMLDivElement>();
const viewRef = shallowRef<EditorView>();

const vimCompartment = new Compartment();
const completionCompartment = new Compartment();

watch(isPaletteOpen, async (open) => {
  if (!open) {
    viewRef.value?.focus();
  }
});

const unsubFromEscape = addVimHandler("Escape", (_) => {
  if (viewRef?.value) {
    const cm = getCM(viewRef?.value);
    if (cm) Vim.handleKey(cm, "<Esc>", "vim");
  }
});

onMounted(() => {
  if (!editorRef.value) return;
  //
  // Vim.defineEx("write", "w", () => {
  // const text = viewRef.value?.state.doc.toString() ?? "";
  //   props.onSave(text);
  // });
  //
  // Vim.defineEx("quit", "q", () => {
  //   const view = viewRef.value;
  //   if (!view) return;
  //   Window.Hide();
  // });
  //
  // Vim.defineEx("new", "n", () => {
  //   view.dispatch({
  //     changes: { from: 0, to: view.state.doc.length, insert: "" },
  //   });
  //   props.onNew();
  // });
  //
  // Vim.defineEx("wq", "wq", () => {
  //   const view = viewRef.value;
  //   if (!view) return;
  //   props.onSave(view.state.doc.toString() ?? "");
  //   Window.Hide();
  // });
  //
  // Vim.defineAction("hideWindow", () => Window.Hide());
  // Vim.mapCommand("<Esc>", "action", "hideWindow", {}, { context: "normal" });
  // Vim.mapCommand("<C-p>", "action", "togglePalette", {}, { context: "normal" });
  // Vim.mapCommand("<C-p>", "action", "togglePalette", {}, { context: "insert" });

  Vim.defineAction("togglePalette", togglePalette);
  Vim.mapCommand(":", "action", "togglePalette", {}, { context: "normal" });

  const state = EditorState.create({
    doc: props.initialValue,
    extensions: [
      vimCompartment.of(isVimModeEnabled.value ? [vim()] : []),
      minimalSetup,
      markdown({ codeLanguages: languages }),
      javascript({ jsx: true, typescript: true }),
      tokyoNightMoon,
      completionCompartment.of(
        autocompletion({
          override: [
            (context) => {
              const word = context.matchBefore(/#\w*/);
              if (!word || (word.from === word.to && !context.explicit))
                return null;

              const staticTags = props.tags.map((t) => "#" + t);
              const text = context.state.doc.toString();
              const dynamicTags: string[] = [];

              for (const match of text.matchAll(/#(\w+)/g)) {
                if (match.index !== word.from) dynamicTags.push(match[0]);
              }

              const allUniqueTags = [
                ...new Set([...staticTags, ...dynamicTags]),
              ];

              return {
                from: word.from,
                options: allUniqueTags.map((tag) => ({
                  label: tag,
                  type: "keyword",
                  boost: staticTags.includes(tag) ? 1 : 0,
                })),
                filter: true,
              };
            },
          ],
          activateOnTypingDelay: 0,
        }),
      ),
      EditorView.theme({
        "&": { height: "100%" },
        ".cm-scroller": { overflow: "auto" },
      }),
    ],
  });

  const view = new EditorView({ state, parent: editorRef.value });
  viewRef.value = view;
  view.focus();
});

onUnmounted(() => {
  viewRef.value?.destroy();
  unsubFromEscape();
});

watch(isVimModeEnabled, (enabled) => {
  if (viewRef.value) {
    viewRef.value.dispatch({
      effects: vimCompartment.reconfigure(enabled ? [vim()] : []),
    });
  }
});
</script>

<template>
  <div :class="$style.wrapper">
    <div ref="editorRef" :class="$style.editor" data-focus-allowed />
  </div>
  <Palette />
</template>

<style module>
.wrapper {
  height: 100%;
  position: relative;
}
.editor {
  height: 100%;
}
</style>
