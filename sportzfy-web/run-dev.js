const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

// Resolve physical directory if running within an NTFS junction or symlink
const realDir = fs.realpathSync(process.cwd());
process.chdir(realDir);

const args = ["dev", ...process.argv.slice(2)];
const nextBin = path.join(realDir, "node_modules", "next", "dist", "bin", "next");

const child = spawn(process.execPath, [nextBin, ...args], {
  cwd: realDir,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

