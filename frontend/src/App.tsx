import { useEffect, useState } from "react";
import { Editor } from "./Editor";
import { TagsService, NoteService } from "../bindings/jot";
import { Events } from "@wailsio/runtime";

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
    // Загружаем кеш сразу
    TagsService.GetTags().then((cached) => {
      if (cached?.length) setTags(cached);
    });

    // Запускаем фоновый скан
    TagsService.ScanTags();

    // Обновляем когда скан завершён
    const unsub = Events.On("tags-ready", (e) => {
      setTags(e.data as string[]);
    });

    return () => unsub();
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
