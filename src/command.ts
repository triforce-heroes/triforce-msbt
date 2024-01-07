#!/usr/bin/env node
import { program } from "commander";

import { TranspileCommand } from "./commands/TranspileCommand.js";

program
  .command("transpile")
  .description("transpile MSBT file to JSON")
  .argument("<input>", "MSBT file to be transpiled")
  .action(TranspileCommand);

program.parse();
