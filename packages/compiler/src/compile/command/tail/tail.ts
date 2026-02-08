/**
 * tail command handler for the AST-based compiler.
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
const parseTailArgs = createWordParser<ExpandedWord>(
	flags,
	expandedWordToString
);
const MISSING_N_VALUE_PREFIX = 'Flag -n requires a value';
const UNKNOWN_FLAG_PREFIX = 'Unknown flag:';

/**
 * Compile a tail command from SimpleCommandIR to StepIR.
 */
export function compileTail(cmd: SimpleCommandIR): StepIR {
	const parsed = parseTailArgsOrThrow(cmd.args);

	const n = parseTailCount(parsed.flags.lines);
	const files = parsed.positionalWords;

	return {
		cmd: 'tail',
		args: { files, n },
	} as const;
}

function parseTailCount(value: ParsedFlagValue | undefined): number {
	const lastValue = getLastValueToken(value);
	if (lastValue === undefined) {
		return DEFAULT_LINE_COUNT;
	}

	const parsedValue = Number(lastValue);
	if (!Number.isFinite(parsedValue)) {
		throw new Error('Invalid tail count');
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
	throw new Error('Invalid tail count');
}

function parseTailArgsOrThrow(
	args: readonly ExpandedWord[]
): ReturnType<typeof parseTailArgs> {
	try {
		return parseTailArgs(args, {
			negativeNumberFlag: 'lines',
			negativeNumberPolicy: 'value',
		});
	} catch (error) {
		throw normalizeTailParseError(error);
	}
}

function normalizeTailParseError(error: unknown): Error {
	if (!(error instanceof Error)) {
		return new Error('Unknown tail option');
	}
	if (error.message.startsWith(MISSING_N_VALUE_PREFIX)) {
		return new Error('tail -n requires a number');
	}
	if (error.message.startsWith(UNKNOWN_FLAG_PREFIX)) {
		return new Error('Unknown tail option');
	}
	return error;
}
