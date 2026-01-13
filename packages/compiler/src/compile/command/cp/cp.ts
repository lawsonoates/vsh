/**
 * cp command handler for the AST-based compiler.
 */

import {
	type ExpandedWord,
	expandedWordToString,
	type SimpleCommandIR,
	type StepIR,
} from '../../../ir';

/**
 * Compile a cp command from SimpleCommandIR to StepIR.
 */
export function compileCp(cmd: SimpleCommandIR): StepIR {
	let recursive = false;
	const filteredArgs: ExpandedWord[] = [];

	for (const arg of cmd.args) {
		const argStr = expandedWordToString(arg);
		if (argStr === '-r') {
			recursive = true;
		} else if (argStr !== '-f' && argStr !== '-i') {
			filteredArgs.push(arg);
		}
	}

	if (filteredArgs.length < 2) {
		throw new Error('cp requires source and destination');
	}

	const dest = filteredArgs.pop();
	if (!dest) {
		throw new Error('cp requires source and destination');
	}
	const srcs = filteredArgs;

	return {
		cmd: 'cp',
		args: { dest, recursive, srcs },
	} as const;
}
