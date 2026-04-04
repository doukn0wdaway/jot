import { SettingsService } from "../bindings/jot/internal/settings";
import { isPaletteOpen, togglePalette, isVimModeEnabled } from "./store";

type KeyDownHandler = (e: KeyboardEvent) => void;

function addHandler(
  handlersList: Map<string, KeyDownHandler>,
  key: string,
  cb: KeyDownHandler,
) {
  if (handlersList.get(key) !== undefined) {
    console.error(
      "You are trying to register callback for already defined key",
    );
  }

  handlersList.set(key, cb);

  return () => {
    if (handlersList.get(key) === cb) {
      handlersList.delete(key);
    }
  };
}
const paletteHandlers = new Map<string, KeyDownHandler>();
export function addPaletteHandler(key: string, cb: KeyDownHandler) {
  return addHandler(paletteHandlers, key, cb);
}

const vimHandlers = new Map<string, KeyDownHandler>();
export function addVimHandler(key: string, cb: KeyDownHandler) {
  return addHandler(vimHandlers, key, cb);
}

export const handleGlobalKeyDown = (e: KeyboardEvent) => {
  const isCmd = e.ctrlKey || e.metaKey;

  if (isCmd && e.key.toLowerCase() === "p") {
    e.preventDefault();
    togglePalette();
    return;
  }

  if (isPaletteOpen.value) {
    const cb = paletteHandlers.get(e.key);
    if (cb) {
      cb(e);
      return;
    }
  }

  if (isVimModeEnabled.value) {
    const cb = vimHandlers.get(e.key);
    if (cb) {
      cb(e);
      return;
    }
    return;
  }
};
