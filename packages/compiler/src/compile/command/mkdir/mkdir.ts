import type { ShellCommand } from '../../../ast';
import type { StepIR } from '../../../ir';

export function compileMkdir(cmd: ShellCommand): StepIR {
	const recursive = cmd.args.includes('-p');
	const paths = cmd.args.filter((a) => a !== '-p');

	if (paths.length === 0) {
		throw new Error('mkdir requires at least one path');
	}

	return {
		args: { paths, recursive },
		cmd: 'mkdir',
	} as const;
}
