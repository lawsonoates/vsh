import type { ShellCommand } from '../../../ast';
import type { StepIR } from '../../../ir';

export function compileTouch(cmd: ShellCommand): StepIR {
	const args = cmd.args.filter((a) => !a.startsWith('-'));

	if (args.length === 0) {
		throw new Error('touch requires at least one file');
	}

	return {
		args: { files: args },
		cmd: 'touch',
	} as const;
}
