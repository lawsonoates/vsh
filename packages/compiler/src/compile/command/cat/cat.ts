import type { ShellCommand } from '../../../ast';
import type { StepIR } from '../../../ir';
import type { Flag } from '../arg/flag';
import { parseArgs } from '../arg/parse';

const flags: Record<string, Flag> = {
	number: { short: 'n', takesValue: false },
	numberNonBlank: { short: 'b', takesValue: false },
	showAll: { short: 'A', takesValue: false },
	showEnds: { short: 'E', takesValue: false },
	showNonprinting: { short: 'v', takesValue: false },
	showTabs: { short: 'T', takesValue: false },
	squeezeBlank: { short: 's', takesValue: false },
};

// TODO: No override behaviour implemented yet

export function compileCat(cmd: ShellCommand): StepIR {
	const parsed = parseArgs(cmd.args, flags);

	const files = parsed.positional;
	if (files.length === 0) {
		throw new Error('cat requires at least one file');
	}

	return {
		args: {
			files,
			numberLines: parsed.flags.number === true,
			numberNonBlank: parsed.flags.numberNonBlank === true,
			showAll: parsed.flags.showAll === true,
			showEnds: parsed.flags.showEnds === true,
			showNonprinting: parsed.flags.showNonprinting === true,
			showTabs: parsed.flags.showTabs === true,
			squeezeBlank: parsed.flags.squeezeBlank === true,
		},
		cmd: 'cat',
	} as const;
}
