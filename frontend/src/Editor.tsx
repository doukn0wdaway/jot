import { useCallback, useEffect, useRef, useState } from "react";
import { EditorView, minimalSetup } from "codemirror";
import { Compartment, EditorState } from "@codemirror/state";
import { vim } from "@replit/codemirror-vim";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import { markdown } from "@codemirror/lang-markdown";
import { tokyoNightMoon } from "./theme";
import { javascript } from "@codemirror/lang-javascript";
import { languages } from "@codemirror/language-data";

const vimCompartment = new Compartment();
const completionCompartment = new Compartment();

interface EditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
}

export const Editor = ({ initialValue, onChange }: EditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<EditorView | null>(null);
  const [useVimMotions, setUseVimMotions] = useState<boolean>(true);
  const [tags, setTags] = useState<string[]>([
    "todo",
    "idea",
    "work",
    "personal",
  ]);

  function tagCompletions(context: CompletionContext) {
    let word = context.matchBefore(/#\w*/);

    if (!word || (word.from === word.to && !context.explicit)) return null;

    return {
      from: word.from,
      options: tags.map((i) => ({ label: "#" + i, type: "keyword" })),
    };
  }

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
        completionCompartment.of(
          autocompletion({
            override: [tagCompletions],

            activateOnTypingDelay: 0,
          }),
        ),
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

    editorView.focus();
    setView(editorView);

    return () => {
      editorView.destroy();
      setView(null);
    };
  }, []);

  useEffect(() => {
    if (!view) return;

    view.dispatch({
      effects: completionCompartment.reconfigure(
        autocompletion({ override: [tagCompletions] }),
      ),
    });
  }, [tags, view, tagCompletions]);

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
        data-focus-allowed
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

        <button
          onClick={() => setTags((prev) => [...prev, "aboba" + prev.length])}
        >
          add
          {tags}
        </button>
        <button onClick={() => alert(view.state.doc.toString())}>
          something
        </button>
      </div>
    </div>
  );
};
