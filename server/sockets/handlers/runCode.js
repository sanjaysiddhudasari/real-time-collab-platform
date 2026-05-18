const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { v4: uuid } = require("uuid");

const LANG_CONFIG = {
  javascript: {
    ext: "js",
    cmd: (f) => `node "${f}"`,
  },

  python: {
    ext: "py",
    cmd: (f) => `python3 "${f}"`,
  },

  typescript: {
    ext: "ts",
    cmd: (f) => `npx ts-node "${f}"`,
  },

  cpp: {
    ext: "cpp",
    cmd: (f) => `g++ "${f}" -o "${f}.out" && "${f}.out"`,
  },

  java: {
    ext: "java",
    cmd: (f) =>
      `javac "${f}" && java -cp "${path.dirname(f)}" Main`,
  },

  go: {
    ext: "go",
    cmd: (f) => `go run "${f}"`,
  },
};

const runCode = ({ code, lang, roomId }, io) => {

  const config = LANG_CONFIG[lang];

  // Language not supported
  if (!config) {

    io.to(roomId).emit("run-output", {
      error: `Language "${lang}" is not supported.`,
    });

    return;
  }

  // Create temp file
  const filename = path.join(
    os.tmpdir(),
    `codesync_${uuid()}.${config.ext}`
  );

  fs.writeFileSync(filename, code);

  console.log(`Running [${lang}] → ${filename}`);

  // Execute
  exec(
    config.cmd(filename),
    { timeout: 10000 },

    (error, stdout, stderr) => {

      // Cleanup
      fs.unlink(filename, () => {});

      // Timeout
      if (error?.killed) {

        io.to(roomId).emit("run-output", {
          output: null,
          error: "⏱ Execution timed out (10s limit exceeded)",
        });

        return;
      }

      // Emit result
      io.to(roomId).emit("run-output", {
        output: stdout || null,
        error: stderr || (error ? error.message : null),
      });

    }
  );
};

module.exports = runCode;