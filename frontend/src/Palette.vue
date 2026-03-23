<script lang="ts" setup>
import { nextTick, onUnmounted, shallowRef, watch } from "vue";
import { isPaletteOpen } from "./store";
import { colors } from "./theme";
import { addPaletteHandler } from "./hotkeys";

const accentColor = colors.lightWhite;
const fg = colors.fg;
const inputRef = shallowRef<HTMLInputElement>();

watch(isPaletteOpen, async (open) => {
  if (!inputRef.value) return;

  if (open) {
    await nextTick();
    inputRef.value.focus();
    inputRef.value.value = "";
  }
});

const unsubFromEscape = addPaletteHandler("Escape", (e) => {
  isPaletteOpen.value = false;
  e.preventDefault();

  return;
});

onUnmounted(unsubFromEscape);
</script>

<template>
  <div
    v-show="isPaletteOpen"
    :class="$style.palette_wrapper"
    @click.self="isPaletteOpen = false"
  >
    <div :class="$style.palette">
      <input type="text" data-focus-allowed ref="inputRef" />
    </div>
  </div>
</template>

<style module>
input {
  background: transparent;
  width: 100%;
  height: 100%;
  color: v-bind(fg);
  border: none;
  outline: none;
  padding: 12px;
}
.palette_wrapper {
  background: rgba(0, 0, 0, 0.2); /* Легкое затемнение всего окна */
  backdrop-filter: blur(2px); /* Блюр редактора под палеткой */
  width: 100%;
  left: 0;
  top: 0;
  height: 100%;
  z-index: 100;
  position: absolute;
}

.palette {
  margin-inline: auto;
  margin-top: 10vh;
  border: 2px solid v-bind(accentColor);
  border-radius: 12px;

  width: 70%;
  height: 40px;
}
</style>
