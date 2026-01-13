/**
 * touch command handler for the AST-based compiler.
 */

import {
	type ExpandedWord,
	expandedWordToString,
	type SimpleCommandIR,
	type StepIR,
} from '../../../ir';

/**
 * Compile a touch command from SimpleCommandIR to StepIR.
 */
export function compileTouch(cmd: SimpleCommandIR): StepIR {
	const files: ExpandedWord[] = [];

	for (const arg of cmd.args) {
		const argStr = expandedWordToString(arg);
		if (!argStr.startsWith('-')) {
			files.push(arg);
		}
	}

	if (files.length === 0) {
		throw new Error('touch requires at least one file');
	}

	return {
		cmd: 'touch',
		args: { files },
	} as const;
}
