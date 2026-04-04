<script lang="ts" setup>
import { nextTick, onUnmounted, shallowRef, watch, computed } from "vue";
import { isPaletteOpen } from "./store";
import { colors } from "./theme";
import { addPaletteHandler } from "./hotkeys";
import { searchCommands } from "./commands";

const accentColor = colors.lightWhite;
const fg = colors.fg;

const inputRef = shallowRef<HTMLInputElement>();
const searchQuery = shallowRef("");
const selectedIndex = shallowRef(0);

const filteredCommands = computed(() => searchCommands(searchQuery.value));

watch(isPaletteOpen, async (open) => {
  if (!inputRef.value) return;
  if (open) {
    await nextTick();
    inputRef.value.focus();
    inputRef.value.value = "";
    searchQuery.value = "";
    selectedIndex.value = 0;
  }
});

watch(searchQuery, () => {
  selectedIndex.value = 0;
});

const handleInput = (e: Event) => {
  searchQuery.value = (e.target as HTMLInputElement).value;
};

const handleArrowDown = (e: KeyboardEvent) => {
  e.preventDefault();
  if (selectedIndex.value < filteredCommands.value.length - 1) {
    selectedIndex.value++;
  }
};

const handleArrowUp = (e: KeyboardEvent) => {
  e.preventDefault();
  if (selectedIndex.value > 0) {
    selectedIndex.value--;
  }
};

const executeSelected = () => {
  const selected = filteredCommands.value[selectedIndex.value];
  if (selected) {
    selected.action();
    isPaletteOpen.value = false;
  }
};

const handleEnter = (e: KeyboardEvent) => {
  e.preventDefault();
  executeSelected();
};

const unsubFromEscape = addPaletteHandler("Escape", (e) => {
  isPaletteOpen.value = false;
  e.preventDefault();
});

const unsubFromArrowDown = addPaletteHandler("ArrowDown", handleArrowDown);
const unsubFromArrowUp = addPaletteHandler("ArrowUp", handleArrowUp);
const unsubFromEnter = addPaletteHandler("Enter", handleEnter);
const unsubFromTab = addPaletteHandler("Tab", (e) => e.preventDefault());

onUnmounted(() => {
  unsubFromEscape();
  unsubFromArrowDown();
  unsubFromArrowUp();
  unsubFromEnter();
  unsubFromTab();
});
</script>

<template>
  <div
    v-show="isPaletteOpen"
    :class="$style.palette_wrapper"
    @click.self="isPaletteOpen = false"
  >
    <div :class="$style.palette">
      <input
        type="text"
        data-focus-allowed
        ref="inputRef"
        @input="handleInput"
        placeholder=":command"
        tabindex="-1"
      />
      <div :class="$style.results">
        <div
          v-for="(cmd, index) in filteredCommands"
          :key="cmd.id"
          :class="[$style.item, { [$style.selected]: index === selectedIndex }]"
          @click="executeSelected"
          @mouseenter="selectedIndex = index"
        >
          <div :class="$style.item_main">
            <span :class="$style.aliases">{{ cmd.aliases.join(", ") }}</span>
            <span :class="$style.title">{{ cmd.title }}</span>
          </div>
          <div v-if="cmd.description" :class="$style.description">
            {{ cmd.description }}
          </div>
        </div>
        <div v-if="filteredCommands.length === 0" :class="$style.empty">
          No matching commands
        </div>
      </div>
    </div>
  </div>
</template>

<style module>
* {
  color: v-bind(fg);
}

input {
  background: transparent;
  width: 100%;
  border: none;
  outline: none;
  padding: 12px;
  font-family: monospace;
}

input::placeholder {
  opacity: 0.5;
}

.palette_wrapper {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
  width: 100%;
  left: 0;
  top: 0;
  height: 100%;
  z-index: 100;
  position: absolute;
}

.results {
  max-height: 50vh;
  overflow-y: auto;
}

.item {
  padding: 10px 12px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: background 0.1s;
}

.item:hover,
.item.selected {
  background: rgba(255, 255, 255, 0.1);
}

.item.selected {
  border-left-color: v-bind(accentColor);
}

.item_main {
  display: flex;
  gap: 12px;
}

.aliases {
  font-family: monospace;
  color: v-bind(accentColor);
  font-weight: bold;
  min-width: 80px;
}

.description {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 4px;
  padding-left: 92px;
}

.empty {
  padding: 24px;
  text-align: center;
  opacity: 0.5;
}

.palette {
  margin-inline: auto;
  margin-top: 10vh;
  border: 2px solid v-bind(accentColor);
  width: 70%;
  max-width: 600px;
  background: #1a1a1a;
  border-radius: 8px;
}
</style>
