/**
 * touch command handler for the AST-based compiler.
 */

import {
	type ExpandedWord,
	expandedWordToString,
	type SimpleCommandIR,
	type StepIR,
} from '../../../ir';
import type { Flag } from '../arg/flag';
import { createWordParser } from '../arg/parse';

const flags: Record<string, Flag> = {
	accessTimeOnly: { short: 'a', takesValue: false },
	modificationTimeOnly: { short: 'm', takesValue: false },
};

const parseTouchArgs = createWordParser<ExpandedWord>(
	flags,
	expandedWordToString
);

/**
 * Compile a touch command from SimpleCommandIR to StepIR.
 */
export function compileTouch(cmd: SimpleCommandIR): StepIR {
	const parsed = parseTouchArgs(cmd.args, {
		unknownFlagPolicy: 'positional',
	});
	const accessTimeOnly = parsed.flags.accessTimeOnly === true;
	const modificationTimeOnly = parsed.flags.modificationTimeOnly === true;
	const files = parsed.positionalWords.filter((arg) => {
		const argStr = expandedWordToString(arg);
		return !argStr.startsWith('-');
	});

	if (files.length === 0) {
		throw new Error('touch requires at least one file');
	}

	return {
		cmd: 'touch',
		args: { accessTimeOnly, files, modificationTimeOnly },
	} as const;
}
