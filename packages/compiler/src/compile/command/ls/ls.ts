/**
 * ls command handler for the AST-based compiler.
 */

import {
	type ExpandedWord,
	literal,
	type SimpleCommandIR,
	type StepIR,
} from '@/ir';

/**
 * Compile an ls command from SimpleCommandIR to StepIR.
 */
export function compileLs(cmd: SimpleCommandIR): StepIR {
	const paths: ExpandedWord[] =
		cmd.args.length === 0 ? [literal('.')] : cmd.args;

	return {
		cmd: 'ls',
		args: { paths },
	} as const;
}
