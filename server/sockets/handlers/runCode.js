const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const crypto = require("crypto");

const LANG_CONFIG = {
  javascript: {
    ext: "js",
    cmd: (f) => `node "${f}"`,
  },

  python: {
    ext: "py",
    cmd: (f) => `python "${f}"`,
  },

  typescript: {
    ext: "ts",
    cmd: (f) => `npx ts-node "${f}"`,
  },

  cpp: {
    ext: "cpp",
    cmd: (f) => {
      const out = os.platform() === "win32" ? `${f}.exe` : `${f}.out`;
      return `g++ "${f}" -o "${out}" && "${out}"`;
    },
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

const runCode = ({ code, lang, roomId, fileId }, io) => {

  const config = LANG_CONFIG[lang];

  // Language not supported
  if (!config) {

    io.to(roomId).emit("run-output", { fileId,
      error: `Language "${lang}" is not supported.`,
    });

    return;
  }

  // Create temp file
  const filename = path.join(
    os.tmpdir(),
    `codesync_${crypto.randomUUID()}.${config.ext}`
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

        io.to(roomId).emit("run-output", { fileId,
          output: null,
          error: "⏱ Execution timed out (10s limit exceeded)",
        });

        return;
      }

      // Emit result
      io.to(roomId).emit("run-output", { fileId,
        output: stdout || null,
        error: stderr || (error ? error.message : null),
      });

    }
  );
};

module.exports = runCode;