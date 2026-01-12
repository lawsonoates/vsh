import type { ShellCommand } from '../../../ast';
import type { StepIR } from '../../../ir';

export function compileMv(cmd: ShellCommand): StepIR {
	const args = cmd.args.filter((a) => a !== '-f' && a !== '-i');

	if (args.length < 2) {
		throw new Error('mv requires source and destination');
	}

	const dest = args.pop();
	if (!dest) {
		throw new Error('mv requires source and destination');
	}
	const srcs = args;

	return {
		args: { dest, srcs },
		cmd: 'mv',
	} as const;
}
