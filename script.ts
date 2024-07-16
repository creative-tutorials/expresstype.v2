import { exec } from "child_process";
import chalk from "chalk";
import { env } from "./src/env";

// Print header information
console.log(chalk.cyan(process.env.npm_package_name));
console.log(
  `- Local:        ${chalk.underline(`http://localhost:${env.PORT}`)}`
);
// check if env is set
if (env.PORT) {
  console.log(`- Environments: .env`);
}

console.log(`${chalk.green("✓")} ${chalk.white("Starting...\n")}`);

// Function to run a command and print its output
function runCommand(command: string, name: string) {
  return new Promise<void>((resolve, reject) => {
    const process = exec(command);

    process.stdout?.on("data", (data) => {
      console.log(chalk.white(`[${name}] ${data.toString()}`));
    });

    process.stderr?.on("data", (data) => {
      console.error(chalk.red(`[${name}] ${data.toString()}`));
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${name} exited with code ${code}`));
      }
    });
  });
}

// Run the dev commands in parallel
Promise.all([
  runCommand("bunx --bun tsc --watch", "tsc-watch"),
  runCommand("bun run --watch build/src/index.js", "build-watch"),
])
  .then(() => {
    console.log(chalk.green("\n ✓ Ready"));
  })
  .catch((error) => {
    console.error(chalk.red(`\n ✗ Error: ${error.message}`));
  });
