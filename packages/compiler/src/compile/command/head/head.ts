/**
 * head command handler for the AST-based compiler.
 */

import {
	type ExpandedWord,
	expandedWordToString,
	type SimpleCommandIR,
	type StepIR,
} from '../../../ir';
import {
	createWordParser,
	type FlagDef,
	type ParsedFlagValue,
} from '../arg/parse';

const DEFAULT_LINE_COUNT = 10;
const flags: Record<string, FlagDef> = {
	lines: { multiple: true, short: 'n', takesValue: true },
};
const parseHeadArgs = createWordParser<ExpandedWord>(
	flags,
	expandedWordToString
);
const MISSING_N_VALUE_PREFIX = 'Flag -n requires a value';
const UNKNOWN_FLAG_PREFIX = 'Unknown flag:';

/**
 * Compile a head command from SimpleCommandIR to StepIR.
 */
export function compileHead(cmd: SimpleCommandIR): StepIR {
	const parsed = parseHeadArgsOrThrow(cmd.args);

	const n = parseHeadCount(parsed.flags.lines);
	const files = parsed.positionalWords;

	return {
		cmd: 'head',
		args: { files, n },
	} as const;
}

function parseHeadCount(value: ParsedFlagValue | undefined): number {
	const lastValue = getLastValueToken(value);
	if (lastValue === undefined) {
		return DEFAULT_LINE_COUNT;
	}

	const parsedValue = Number(lastValue);
	if (!Number.isFinite(parsedValue)) {
		throw new Error('Invalid head count');
	}

	return parsedValue;
}

function getLastValueToken(
	value: ParsedFlagValue | undefined
): string | undefined {
	if (value === undefined) {
		return undefined;
	}
	if (typeof value === 'string') {
		return value;
	}
	if (Array.isArray(value)) {
		const lastValue = value.at(-1);
		return lastValue;
	}
	throw new Error('Invalid head count');
}

function parseHeadArgsOrThrow(
	args: readonly ExpandedWord[]
): ReturnType<typeof parseHeadArgs> {
	try {
		return parseHeadArgs(args, {
			negativeNumberFlag: 'lines',
			negativeNumberPolicy: 'value',
		});
	} catch (error) {
		if (!(error instanceof Error)) {
			throw new Error('Unknown head option');
		}
		if (error.message.startsWith(MISSING_N_VALUE_PREFIX)) {
			throw new Error('head -n requires a number');
		}
		if (error.message.startsWith(UNKNOWN_FLAG_PREFIX)) {
			throw new Error('Unknown head option');
		}
		throw error;
	}
}
