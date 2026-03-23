import { ref } from "vue";

export const isPaletteOpen = ref<boolean>(false);
export const togglePalette = () => {
  isPaletteOpen.value = !isPaletteOpen.value;
};

export const isVimModeEnabled = ref<boolean>(true);
export const toggleVimMode = () => {
  isVimModeEnabled.value = !isVimModeEnabled.value;
};
