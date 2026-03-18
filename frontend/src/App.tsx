import { useEffect, useState } from "react";
import { Editor } from "./Editor";
import { Events } from "@wailsio/runtime";
import { TagsService } from "../bindings/jot/internal/tags";
import { NoteService } from "../bindings/jot/internal/note";

function preventAlt(e: KeyboardEvent) {
  if (e.key === "Alt") {
    e.preventDefault;
  }
}

function App() {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as Element;
      if (!target.closest("[data-focus-allowed]")) {
        (e.relatedTarget as HTMLElement)?.focus();
      }
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, []);

  useEffect(() => {
    TagsService.GetTags().then((cached) => {
      if (cached?.length) setTags(cached);
    });

    TagsService.ScanTags();

    const unsub = Events.On("tags-ready", (e) => {
      setTags(e.data as string[]);
    });

    window.addEventListener("keydown", preventAlt);
    window.addEventListener("keyup", preventAlt);

    return () => {
      window.removeEventListener("keydown", preventAlt);
      window.removeEventListener("keyup", preventAlt);
      unsub();
    };
  }, []);

  return (
    <Editor
      initialValue=""
      onSave={(val) =>
        NoteService.SaveNote(val).catch((err: any) =>
          console.error("SaveNote:", err),
        )
      }
      onDiscard={() => NoteService.ResetCurrNotePath()}
      tags={tags}
    />
  );
}

export default App;
