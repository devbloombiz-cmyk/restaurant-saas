import { existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const logsDir = path.join(root, "logs");

if (!existsSync(logsDir)) {
  console.log("No logs directory found.");
  process.exit(0);
}

const removed = [];
for (const fileName of readdirSync(logsDir)) {
  if (!fileName.startsWith("api.log")) {
    continue;
  }

  const target = path.join(logsDir, fileName);
  rmSync(target, { force: true });
  removed.push(fileName);
}

if (removed.length === 0) {
  console.log("No API log files found to clear.");
  process.exit(0);
}

console.log(`Cleared ${removed.length} file(s): ${removed.join(", ")}`);
