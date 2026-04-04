<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { Events } from "@wailsio/runtime";
import { TagsService } from "../bindings/jot/internal/tags";
import Editor from "./Editor.vue";
import { NoteService } from "../bindings/jot/internal/note";
import { handleGlobalKeyDown } from "./hotkeys";
import { onStartup } from "./store";

let tagsReadyEvent: () => void;

function preventAlt(e: KeyboardEvent) {
  if (e.key === "Alt") {
    e.preventDefault();
  }
}

function preventTab(e: KeyboardEvent) {
  if (e.key === "Tab") {
    e.preventDefault();
  }
}

const isFocusAllowed = (e: FocusEvent) => {
  const target = e.target as Element;
  if (!target.closest("[data-focus-allowed]")) {
    (e.relatedTarget as HTMLElement)?.focus();
  }
};

const tags = ref<string[]>([]);

onMounted(async () => {
  document.addEventListener("focusin", isFocusAllowed);

  tags.value = await TagsService.GetTags();
  TagsService.ScanTags();
  onStartup();

  tagsReadyEvent = Events.On("tags-ready", (e) => {
    tags.value = e.data;
  });

  window.addEventListener("keyup", preventAlt);
  window.addEventListener("keydown", preventAlt);
  window.addEventListener("keydown", preventTab);
  window.addEventListener("keydown", handleGlobalKeyDown, true);
});

onUnmounted(() => {
  document.removeEventListener("focusin", isFocusAllowed);

  window.removeEventListener("keyup", preventAlt);
  window.removeEventListener("keydown", preventAlt);
  window.removeEventListener("keydown", preventTab);
  window.removeEventListener("keydown", handleGlobalKeyDown);
  tagsReadyEvent();
});

const onSave = (text: string) => {
  NoteService.SaveNote(text).catch((err: any) =>
    console.error("SaveNote:", err),
  );
};

const onNew = () => {
  NoteService.ResetCurrNotePath();
};
</script>

<template>
  <Editor :tags v-on:new="onNew" v-on:save="onSave" />
</template>

<style module>
@import "./reset.css";
</style>
