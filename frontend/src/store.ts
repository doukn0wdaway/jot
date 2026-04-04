import { ref } from "vue";
import { SettingsService } from "../bindings/jot/internal/settings";

export const isPaletteOpen = ref<boolean>(false);
export const togglePalette = () => {
  isPaletteOpen.value = !isPaletteOpen.value;
};

export const isVimModeEnabled = ref<boolean>(true);
export const toggleVimMode = () => {
  SettingsService.ToggleVimMode().then((res) => (isVimModeEnabled.value = res));
};

export function onStartup() {
  SettingsService.Get().then(
    (res) => (isVimModeEnabled.value = res.isVimModeEnabled),
  );
}
