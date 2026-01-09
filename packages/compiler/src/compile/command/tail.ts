import type { ShellCommand } from '../../ast';
import type { StepIR } from '../../ir';

export function compileTail(cmd: ShellCommand): StepIR {
	let n: number;
	const firstArg = cmd.args[0];

	if (!firstArg) {
		throw new Error('tail requires -N or -n N');
	}

	// Handle -N format (e.g., -10)
	if (firstArg.startsWith('-') && /^-\d+$/.test(firstArg)) {
		n = Number(firstArg.slice(1));
	}
	// Handle -n N format (e.g., -n 10)
	else if (firstArg === '-n') {
		const numArg = cmd.args[1];
		if (!numArg) {
			throw new Error('tail -n requires a number');
		}
		n = Number(numArg);
	} else {
		throw new Error('tail requires -N or -n N');
	}

	if (!Number.isFinite(n)) {
		throw new Error('Invalid tail count');
	}
	return { args: { n }, cmd: 'tail' };
}
