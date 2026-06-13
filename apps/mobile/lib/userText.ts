/** Strip partial/invalid and literal \\uXXXX escape sequences from user-entered text. */
export function sanitizeUserText(input: string): string {
  return input
    .replace(/\\u[0-9a-fA-F]{4}/g, "")
    .replace(/\\u[0-9a-fA-F]{0,3}(?![0-9a-fA-F])/g, "")
    .trim();
}
