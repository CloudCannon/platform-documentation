const tabNames: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  toml: "TOML",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  shell: "Shell",
  bash: "Bash",
  markdown: "Markdown",
  ruby: "Ruby",
  python: "Python",
  go: "Go",
  jsx: "JSX",
  liquid: "Liquid",
  plaintext: "Text",
};

export function getLanguageLabel(lang: string): string {
  return tabNames[lang.toLowerCase()] || lang.toUpperCase();
}
