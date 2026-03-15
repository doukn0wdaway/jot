import { useEffect, useRef, useState } from "react";
import { EditorView, minimalSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { vim } from "@replit/codemirror-vim";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";

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

  useEffect(() => {
    if (!editorRef.current || view) return;

    const state = EditorState.create({
      doc: initialValue,

      extensions: [
        vim(),
        minimalSetup,
        autocompletion({
          override: [myTagCompletions],
          activateOnTypingDelay: 0,
        }),
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

  return (
    <div
      ref={editorRef}
      className="wails-editor-container"
      style={{
        height: "100%",
        width: "100%",
        textAlign: "left",
      }}
    />
  );
};
