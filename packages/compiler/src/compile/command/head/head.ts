import type { ShellCommand } from '../../../ast';
import type { StepIR } from '../../../ir';

const NEGATIVE_NUMBER_REGEX = /^-\d+$/;

export function compileHead(cmd: ShellCommand): StepIR {
	let n = 10; // default
	const files: string[] = [];

	let skipNext = false;
	for (const [i, arg] of cmd.args.entries()) {
		if (skipNext) {
			skipNext = false;
			continue;
		}

		if (!arg) {
			continue;
		}

		// Handle -n N format (e.g., -n 10)
		if (arg === '-n') {
			const numArg = cmd.args[i + 1];
			if (!numArg) {
				throw new Error('head -n requires a number');
			}
			n = Number(numArg);
			if (!Number.isFinite(n)) {
				throw new Error('Invalid head count');
			}
			skipNext = true;
		}
		// Handle -N format (e.g., -10)
		else if (arg.startsWith('-') && NEGATIVE_NUMBER_REGEX.test(arg)) {
			n = Number(arg.slice(1));
		}
		// Everything else is a file
		else if (arg.startsWith('-')) {
			throw new Error('Unknown head option');
		} else {
			files.push(arg);
		}
	}

	return {
		args: { files, n },
		cmd: 'head',
	} as const;
}
