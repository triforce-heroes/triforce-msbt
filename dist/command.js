#!/usr/bin/env node
import{program as i}from"commander";import{RebuildCommand as e}from"./commands/RebuildCommand.js";import{TranspileCommand as m}from"./commands/TranspileCommand.js";i.command("transpile").description("transpile MSBT file to JSON").argument("<input>","MSBT file to be transpiled").action(m),i.command("rebuild").description("Rebuild JSON file to MSBT").argument("<input>","JSON file to be rebuilded").action(e),i.parse();