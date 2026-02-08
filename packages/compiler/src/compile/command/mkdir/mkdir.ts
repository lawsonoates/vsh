/**
 * mkdir command handler for the AST-based compiler.
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
	parents: { short: 'p', takesValue: false },
};

const parseMkdirArgs = createWordParser<ExpandedWord>(
	flags,
	expandedWordToString
);

/**
 * Compile a mkdir command from SimpleCommandIR to StepIR.
 */
export function compileMkdir(cmd: SimpleCommandIR): StepIR {
	const parsed = parseMkdirArgs(cmd.args, {
		unknownFlagPolicy: 'positional',
	});

	const parents = parsed.flags.parents === true;
	const recursive = parents;
	const paths = parsed.positionalWords;

	if (paths.length === 0) {
		throw new Error('mkdir requires at least one path');
	}

	return {
		cmd: 'mkdir',
		args: { parents, paths, recursive },
	} as const;
}
