/**
 * mkdir command handler for the AST-based compiler.
 */

import {
	type ExpandedWord,
	expandedWordToString,
	type SimpleCommandIR,
	type StepIR,
} from '../../../ir';

/**
 * Compile a mkdir command from SimpleCommandIR to StepIR.
 */
export function compileMkdir(cmd: SimpleCommandIR): StepIR {
	let recursive = false;
	const paths: ExpandedWord[] = [];

	for (const arg of cmd.args) {
		const argStr = expandedWordToString(arg);
		if (argStr === '-p') {
			recursive = true;
		} else {
			paths.push(arg);
		}
	}

	if (paths.length === 0) {
		throw new Error('mkdir requires at least one path');
	}

	return {
		cmd: 'mkdir',
		args: { paths, recursive },
	} as const;
}
