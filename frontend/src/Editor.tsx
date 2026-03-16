import { useEffect, useRef, useState } from "react";
import { EditorView, minimalSetup } from "codemirror";
import { Compartment, EditorState } from "@codemirror/state";
import { Vim, vim } from "@replit/codemirror-vim";
import { autocompletion } from "@codemirror/autocomplete";
import { markdown } from "@codemirror/lang-markdown";
import { tokyoNightMoon } from "./theme";
import { javascript } from "@codemirror/lang-javascript";
import { languages } from "@codemirror/language-data";
import { Window } from "@wailsio/runtime";

const vimCompartment = new Compartment();
const completionCompartment = new Compartment();

interface EditorProps {
  initialValue?: string;
  onSave: (text: string) => void;
  onDiscard: () => void;
  tags: string[];
}

export const Editor = ({ initialValue, onSave, onDiscard, tags }: EditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const dataRef = useRef({ onSave, onDiscard, tags });
  const [useVimMotions, _setUseVimMotions] = useState(true);

  useEffect(() => {
    dataRef.current = { onSave, onDiscard, tags };
  }, [onSave, onDiscard, tags]);

  useEffect(() => {
    if (!editorRef.current) return;

    Vim.defineEx("write", "w", () => {
      const view = viewRef.current;
      if (!view) return;

      const text = view.state.doc.toString() || "";
      dataRef.current.onSave(text);
    });

    Vim.defineEx("quit", "q", () => {
      const view = viewRef.current;
      if (!view) return;
      dataRef.current.onDiscard();
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: "" } });
      Window.Hide();
    });

    Vim.defineEx("wq", "wq", () => {
      const view = viewRef.current;
      if (!view) return;
      const text = view.state.doc.toString() || "";
      dataRef.current.onSave(text);
      dataRef.current.onDiscard();
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: "" } });
      Window.Hide();
    });

    const state = EditorState.create({
      doc: initialValue,
      extensions: [
        vimCompartment.of(useVimMotions ? vim() : []),
        minimalSetup,
        markdown({ codeLanguages: languages }),
        javascript({ jsx: true, typescript: true }),
        tokyoNightMoon,
        completionCompartment.of(
          autocompletion({
            override: [
              (context) => {
                let word = context.matchBefore(/#\w*/);
                if (!word || (word.from === word.to && !context.explicit))
                  return null;

                const staticTags = dataRef.current.tags.map((t) => "#" + t);

                const text = context.state.doc.toString();

                const currentWordStart = word.from;

                const dynamicTags: string[] = [];
                const matches = text.matchAll(/#(\w+)/g);

                for (const match of matches) {
                  const matchStart = match.index!;
                  const matchText = match[0];

                  if (matchStart === currentWordStart) {
                    continue;
                  }

                  dynamicTags.push(matchText);
                }

                const allUniqueTags = Array.from(
                  new Set([...staticTags, ...dynamicTags]),
                );

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

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;
    view.focus();

    return () => view.destroy();
  }, []);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: vimCompartment.reconfigure(useVimMotions ? vim() : []),
    });
  }, [useVimMotions]);

  return (
    <div style={{ height: "100%", position: "relative" }}>
      <div
        ref={editorRef}
        data-focus-allowed
        className="wails-editor-container"
        style={{ height: "100%" }}
      />
      <div
        style={{
          position: "absolute",
          right: 10,
          top: 10,
          display: "flex",
          gap: "5px",
        }}
      >
        {/* <button onClick={() => setUseVimMotions((prev) => !prev)}> */}
        {/*   Vim: {useVimMotions ? "ON" : "OFF"} */}
        {/* </button> */}
      </div>
    </div>
  );
};
