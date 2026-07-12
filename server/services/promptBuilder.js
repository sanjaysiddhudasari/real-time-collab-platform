const SYSTEM = `You are a senior software engineer reviewing code.
For each issue, respond in EXACTLY this format:
LINE {number}: [Bug/Performance/Style] - explanation. Suggestion: fix.
Give at most 5 suggestions. If no issues, say "LGTM".`;

function buildPrompt(code, language) {
  return {
    systemPrompt: SYSTEM,
    userMessage: `Review this ${language} code:

\`\`\`${language}
${code}
\`\`\``,
  };
}

module.exports = {
  buildPrompt,
};