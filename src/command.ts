#!/usr/bin/env node
import { program } from "commander";

import { RebuildCommand } from "./commands/RebuildCommand.js";
import { TranspileCommand } from "./commands/TranspileCommand.js";

program
  .command("transpile")
  .description("transpile MSBT file to JSON")
  .argument("<input>", "MSBT file to be transpiled")
  .action(TranspileCommand);

program
  .command("rebuild")
  .description("Rebuild JSON file to MSBT")
  .argument("<input>", "JSON file to be rebuilded")
  .action(RebuildCommand);

program.parse();
