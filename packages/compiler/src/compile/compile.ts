import type { ShellAST } from '../ast';
import type { PipelineIR, SourceIR, StepIR } from '../ir';
import { CommandHandler } from './command/handler';

export function compile(ast: ShellAST): PipelineIR {
	const [first] = ast.commands;

	if (!first) {
		throw new Error('Pipeline must contain at least one command');
	}

	const source = compileSource(first);
	const steps = ast.commands.map(compileStep);

	return { source, steps };
}

function compileSource(cmd: { name: string; args: string[] }): SourceIR {
	// convention: first arg of first command is glob
	if (cmd.args.length === 0) {
		throw new Error(`Missing source argument for ${cmd.name}`);
	}

	return { glob: cmd.args[cmd.args.length - 1] as string, kind: 'fs' };
}

function compileStep(cmd: { name: string; args: string[] }): StepIR {
	const handler = CommandHandler.get(cmd.name);

	return handler(cmd);
}
