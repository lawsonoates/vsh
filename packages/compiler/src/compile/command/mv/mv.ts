/**
 * mv command handler for the AST-based compiler.
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
	force: { short: 'f', takesValue: false },
	interactive: { short: 'i', takesValue: false },
};

const parseMvArgs = createWordParser<ExpandedWord>(flags, expandedWordToString);

/**
 * Compile a mv command from SimpleCommandIR to StepIR.
 */
export function compileMv(cmd: SimpleCommandIR): StepIR {
	const parsed = parseMvArgs(cmd.args, { unknownFlagPolicy: 'positional' });
	const force = parsed.flags.force === true;
	const interactive = parsed.flags.interactive === true;
	const filteredArgs = parsed.positionalWords;

	if (filteredArgs.length < 2) {
		throw new Error('mv requires source and destination');
	}

	const dest = filteredArgs.pop();
	if (!dest) {
		throw new Error('mv requires source and destination');
	}
	const srcs = filteredArgs;

	return {
		cmd: 'mv',
		args: { dest, force, interactive, srcs },
	} as const;
}
