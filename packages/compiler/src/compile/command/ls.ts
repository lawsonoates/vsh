import type { ShellCommand } from '../../ast';
import type { StepIR } from '../../ir';

export function compileLs(cmd: ShellCommand): StepIR {
	const path = cmd.args[0] ?? '.';
	return { args: { path }, cmd: 'ls' };
}
