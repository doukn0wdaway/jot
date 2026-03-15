import { useEffect, useRef, useState } from "react";
import { EditorView, minimalSetup } from "codemirror";
import { Compartment, EditorState } from "@codemirror/state";
import { vim } from "@replit/codemirror-vim";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import { markdown } from "@codemirror/lang-markdown";
import { tokyoNightMoon } from "./theme";
import { javascript } from "@codemirror/lang-javascript";
import { languages } from "@codemirror/language-data";

const vimCompartment = new Compartment();

interface EditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
}

function myTagCompletions(context: CompletionContext) {
  let word = context.matchBefore(/#\w*/);

  if (!word || (word.from === word.to && !context.explicit)) return null;

  return {
    from: word.from,
    options: [
      { label: "#todo", type: "keyword" },
      { label: "#idea", type: "keyword" },
      { label: "#work", type: "keyword" },
      { label: "#personal", type: "keyword" },
    ],
  };
}

export const Editor = ({ initialValue, onChange }: EditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<EditorView | null>(null);
  const [useVimMotions, setUseVimMotions] = useState<boolean>(false);

  useEffect(() => {
    if (!editorRef.current || view) return;
    const state = EditorState.create({
      doc: initialValue,

      extensions: [
        vimCompartment.of(useVimMotions ? vim() : []),
        minimalSetup,
        markdown({
          codeLanguages: languages,
        }),
        autocompletion({
          override: [myTagCompletions],
          activateOnTypingDelay: 0,
        }),
        javascript({
          jsx: true,
          typescript: true,
        }),
        tokyoNightMoon,
        // EditorView.updateListener.of((update) => {
        //   if (update.docChanged) {
        //     onChange(update.state.doc.toString());
        //   }
        // }),
        EditorView.theme({
          "&": { height: "100%" },
          ".cm-scroller": { overflow: "auto" },
        }),
      ],
    });

    const editorView = new EditorView({
      state,
      parent: editorRef.current,
    });

    setView(editorView);

    return () => {
      editorView.destroy();
      setView(null);
    };
  }, []);

  useEffect(() => {
    if (!view) return;

    view.dispatch({
      effects: [vimCompartment.reconfigure(useVimMotions ? vim() : [])],
    });
  }, [useVimMotions, setUseVimMotions, view]);

  return (
    <div style={{ height: "100%" }}>
      <div
        ref={editorRef}
        className="wails-editor-container"
        style={{
          height: "100%",
          width: "100%",
          textAlign: "left",
        }}
      />

      <div style={{ position: "absolute", right: 0, top: 0 }}>
        <button onClick={() => setUseVimMotions((prev) => !prev)}>
          turn vim motions
        </button>
      </div>
    </div>
  );
};
