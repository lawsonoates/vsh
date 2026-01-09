import type { ShellCommand } from '../../ast';
import type { StepIR } from '../../ir';

export function compileCp(cmd: ShellCommand): StepIR {
	const src = cmd.args[0];
	const dest = cmd.args[1];
	if (!src || !dest) {
		throw new Error('cp requires source and destination');
	}
	return { args: { dest, src }, cmd: 'cp' };
}
