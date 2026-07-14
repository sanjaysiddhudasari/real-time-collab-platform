export function parseAISuggestions(text) {
  if (!text || text.trim() === "LGTM") {
    return [];
  }

  const suggestions = [];

  // Split whenever a new issue starts
  const blocks = text
    .split(/(?=LINE\s+\d+:)/)
    .map((b) => b.trim())
    .filter(Boolean);

  for (const block of blocks) {
    const lines = block.split("\n");

    // LINE 4: [Style] - Missing spaces
    const match = lines[0].match(
      /^LINE\s+(\d+):\s*\[(.+?)\]\s*-\s*(.+)$/
    );

    if (!match) continue;

    const [, line, type, explanation] = match;

    let suggestion = "";

    const suggestionLine = lines.find((l) =>
      l.startsWith("Suggestion:")
    );

    if (suggestionLine) {
      suggestion = suggestionLine.replace("Suggestion:", "").trim();
    }

    suggestions.push({
      line: Number(line),
      type,
      explanation,
      suggestion,
    });
  }

  return suggestions;
}