/**
 * pwd command handler for the AST-based compiler.
 */

import type { SimpleCommandIR, StepIR } from '../../../ir';

/**
 * Compile a pwd command from SimpleCommandIR to StepIR.
 */
export function compilePwd(cmd: SimpleCommandIR): StepIR {
	if (cmd.args.length > 0) {
		throw new Error('pwd does not take any arguments');
	}

	return {
		cmd: 'pwd',
		args: {},
	} as const;
}
