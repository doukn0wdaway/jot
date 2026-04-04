import { shallowRef } from "vue";

export interface Command {
  id: string;
  aliases: string[];
  title: string;
  description?: string;
  action: () => void;
}

const commandsRegistry = new Map<string, Command>();
export const commands = shallowRef<Command[]>([]);

function updateCommands() {
  commands.value = Array.from(commandsRegistry.values());
}

export function registerCommand(command: Command) {
  if (commandsRegistry.has(command.id)) {
    console.error(`Command "${command.id}" already registered`);
    return () => {};
  }

  commandsRegistry.set(command.id, command);
  updateCommands();

  return () => {
    commandsRegistry.delete(command.id);
    updateCommands();
  };
}

export function searchCommands(query: string): Command[] {
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return commands.value;

  const exactMatches: Command[] = [];
  const partialMatches: Command[] = [];

  for (const cmd of commands.value) {
    const hasExactAlias = cmd.aliases.some(
      (alias) => alias.toLowerCase() === lowerQuery,
    );

    if (hasExactAlias) {
      exactMatches.push(cmd);
      continue;
    }

    const hasPartialMatch =
      cmd.aliases.some((alias) => alias.toLowerCase().startsWith(lowerQuery)) ||
      cmd.title.toLowerCase().includes(lowerQuery) ||
      cmd.description?.toLowerCase().includes(lowerQuery);

    if (hasPartialMatch) {
      partialMatches.push(cmd);
    }
  }

  return [...exactMatches, ...partialMatches];
}
