/**
 * Content still to be written is marked `TODO(conținut)` in the project files.
 * The marks are notes to Tudor, in Romanian, so they show while he works on
 * the site (`astro dev`) and never on the published one: a field that is still
 * a TODO is left out of the page rather than shown to an employer.
 *
 * Unwritten body sections live in the `todo` frontmatter field instead,
 * which is never rendered.
 */
export const TODO_MARK = 'TODO(conținut)';

const showTodo = import.meta.env.DEV;

export function isTodo(text: string | undefined): boolean {
  return !!text && text.trim().startsWith(TODO_MARK);
}

/** The text, or undefined when it is still a TODO on the published site. */
export function shown(text: string | undefined): string | undefined {
  if (!text) return undefined;
  return showTodo || !isTodo(text) ? text : undefined;
}

/** A list without its TODO entries on the published site. */
export function shownAll(items: string[]): string[] {
  return showTodo ? items : items.filter((item) => !isTodo(item));
}
