import type { Flag } from './flag';
import {
	isNegativeNumberToken,
	splitNameBeforeEquals,
	startsWithLongPrefix,
	startsWithNoLongPrefix,
	startsWithShortPrefix,
} from './utils';

type FlagDef = Flag & {
	/**
	 * If true, repeated occurrences collect into an array:
	 *   -I a -I b  =>  { I: ["a","b"] }
	 */
	multiple?: boolean;
};

export type ParsedFlagValue = boolean | string | string[];

export interface ParseResult {
	flags: Record<string, ParsedFlagValue>;
	positional: string[];
}

interface FlagEntry {
	canonical: string;
	def: FlagDef;
}

interface FlagIndex {
	short: Map<string, FlagEntry>; // key: "-n"
	long: Map<string, FlagEntry>; // key: "--name"
	isFlagToken: (token: string) => boolean;
}

const SHORT_NAME_REGEX = /^[A-Za-z]$/;
const LONG_NAME_REGEX = /^[A-Za-z0-9][A-Za-z0-9-]*$/;

export function parseArgs(
	args: readonly string[],
	flagDefs: Record<string, FlagDef>
): ParseResult {
	const index = buildFlagIndex(flagDefs);

	const flags: Record<string, ParsedFlagValue> = Object.create(null);
	const positional: string[] = [];

	let endOfFlags = false;

	for (let i = 0; i < args.length; i++) {
		const token = args[i];
		if (token === undefined) {
			continue;
		}

		if (endOfFlags) {
			positional.push(token);
			continue;
		}

		// End-of-flags marker
		if (token === '--') {
			endOfFlags = true;
			continue;
		}

		// Common sentinel: treat "-" as positional (e.g. stdin or a filename)
		if (token === '-') {
			positional.push(token);
			continue;
		}

		// Negative numbers are positional unless explicitly consumed as a value
		if (isNegativeNumberToken(token)) {
			positional.push(token);
			continue;
		}

		if (startsWithLongPrefix(token)) {
			i = parseLongToken(args, i, token, index, flags);
			continue;
		}

		if (startsWithShortPrefix(token)) {
			i = parseShortToken(args, i, token, index, flags);
			continue;
		}

		positional.push(token);
	}

	return { flags, positional };
}

function buildFlagIndex(flagDefs: Record<string, FlagDef>): FlagIndex {
	const short = new Map<string, FlagEntry>();
	const long = new Map<string, FlagEntry>();

	const add = (
		map: Map<string, FlagEntry>,
		token: string,
		entry: FlagEntry
	) => {
		const prev = map.get(token);
		if (!prev) {
			map.set(token, entry);
			return;
		}
		throw new Error(
			`Duplicate flag token "${token}" for "${entry.canonical}" and "${prev.canonical}"`
		);
	};

	for (const [canonical, def] of Object.entries(flagDefs)) {
		// Validate short
		if (!SHORT_NAME_REGEX.test(def.short)) {
			throw new Error(
				`Invalid short flag for "${canonical}": "${def.short}". Expected a single letter [A-Za-z].`
			);
		}
		add(short, `-${def.short}`, { canonical, def });

		// Validate long (optional)
		if (def.long) {
			if (!LONG_NAME_REGEX.test(def.long)) {
				throw new Error(
					`Invalid long flag for "${canonical}": "${def.long}". Expected [A-Za-z0-9][A-Za-z0-9-]*.`
				);
			}
			add(long, `--${def.long}`, { canonical, def });
		}
	}

	const isFlagToken = (token: string): boolean => {
		if (token === '--') {
			return true;
		}
		if (token === '-') {
			return false;
		}

		if (startsWithLongPrefix(token)) {
			const name = splitNameBeforeEquals(token);
			if (long.has(name)) {
				return true;
			}

			// --no-<long>
			if (startsWithNoLongPrefix(name)) {
				const base = `--${name.slice('--no-'.length)}`;
				const entry = long.get(base);
				return !!entry && !entry.def.takesValue;
			}
			return false;
		}

		if (startsWithShortPrefix(token)) {
			// "-n", "-abc", "-n10", "-n=10" → look at first short letter
			const ch = token[1] ?? '';
			if (!SHORT_NAME_REGEX.test(ch)) {
				return false;
			}
			return short.has(`-${ch}`);
		}

		return false;
	};

	return { short, long, isFlagToken };
}

function parseLongToken(
	args: readonly string[],
	index: number,
	token: string,
	flagsIndex: FlagIndex,
	out: Record<string, ParsedFlagValue>
): number {
	// --no-<flag>
	if (startsWithNoLongPrefix(token) && !token.includes('=')) {
		const base = `--${token.slice('--no-'.length)}`;
		const entry = flagsIndex.long.get(base);
		if (!entry) {
			throw new Error(`Unknown flag: ${token}`);
		}
		if (entry.def.takesValue) {
			throw new Error(
				`Flag ${base} takes a value; "${token}" is invalid.`
			);
		}
		setBoolean(out, entry.canonical, false);
		return index;
	}

	// --flag=value (value may contain '='; split at first only)
	if (token.includes('=')) {
		const eq = token.indexOf('=');
		const name = token.slice(0, eq);
		const value = token.slice(eq + 1); // may be empty string
		const entry = flagsIndex.long.get(name);
		if (!entry) {
			throw new Error(`Unknown flag: ${name}`);
		}

		if (!entry.def.takesValue) {
			throw new Error(`Flag ${name} does not take a value.`);
		}
		setValue(out, entry, value);
		return index;
	}

	// --flag [value?]
	const entry = flagsIndex.long.get(token);
	if (!entry) {
		throw new Error(`Unknown flag: ${token}`);
	}

	if (!entry.def.takesValue) {
		setBoolean(out, entry.canonical, true);
		return index;
	}

	const { value, newIndex } = consumeValue(args, index, token, flagsIndex);
	setValue(out, entry, value);
	return newIndex;
}

function parseShortToken(
	args: readonly string[],
	index: number,
	token: string,
	flagsIndex: FlagIndex,
	out: Record<string, ParsedFlagValue>
): number {
	// -n=10
	if (token.length >= 3 && token[2] === '=') {
		const name = token.slice(0, 2);
		const value = token.slice(3); // may be empty string
		const entry = flagsIndex.short.get(name);
		if (!entry) {
			throw new Error(`Unknown flag: ${name}`);
		}
		if (!entry.def.takesValue) {
			throw new Error(`Flag ${name} does not take a value.`);
		}
		setValue(out, entry, value);
		return index;
	}

	// -n (single)
	if (token.length === 2) {
		const entry = flagsIndex.short.get(token);
		if (!entry) {
			throw new Error(`Unknown flag: ${token}`);
		}

		if (!entry.def.takesValue) {
			setBoolean(out, entry.canonical, true);
			return index;
		}

		const { value, newIndex } = consumeValue(
			args,
			index,
			token,
			flagsIndex
		);
		setValue(out, entry, value);
		return newIndex;
	}

	// Combined: -la  /  -rn10  /  -rn=10
	// Rule: if a short flag takes a value, it may be followed by:
	//   - "=..." inline (recommended), or
	//   - an inline suffix that does NOT begin with another known short-flag letter, or
	//   - a separate argv token.
	for (let j = 1; j < token.length; j++) {
		const ch = token[j] ?? '';
		if (!SHORT_NAME_REGEX.test(ch)) {
			throw new Error(
				`Invalid short flag character "${ch}" in "${token}". Short flags must be letters.`
			);
		}

		const name = `-${ch}`;
		const entry = flagsIndex.short.get(name);
		if (!entry) {
			throw new Error(`Unknown flag: ${name}`);
		}

		if (!entry.def.takesValue) {
			setBoolean(out, entry.canonical, true);
			continue;
		}

		// This flag takes a value: consume rest of token or next arg.
		const rest = token.slice(j + 1);

		// Inline value using "=..."
		if (rest.startsWith('=')) {
			setValue(out, entry, rest.slice(1)); // may be empty
			return index;
		}

		// No inline value: take next arg
		if (rest.length === 0) {
			const { value, newIndex } = consumeValue(
				args,
				index,
				name,
				flagsIndex
			);
			setValue(out, entry, value);
			return newIndex;
		}

		// Ambiguity guard: if remainder begins with a known short flag, force explicit separation.
		const first = rest[0] ?? '';
		if (SHORT_NAME_REGEX.test(first) && flagsIndex.short.has(`-${first}`)) {
			throw new Error(
				`Ambiguous short flag cluster "${token}": ${name} takes a value, but "${rest}" begins with "-${first}" which is also a flag. ` +
					`Use "${name}=${rest}" or pass the value as a separate argument.`
			);
		}

		// Safe inline suffix value (e.g. -n10, -n./path, -n-5)
		setValue(out, entry, rest);
		return index;
	}

	return index;
}

function consumeValue(
	args: readonly string[],
	index: number,
	flagToken: string,
	flagsIndex: FlagIndex
): { value: string; newIndex: number } {
	const nextIndex = index + 1;
	if (nextIndex >= args.length) {
		throw new Error(`Flag ${flagToken} requires a value.`);
	}

	const next = args[nextIndex];
	if (next === undefined) {
		throw new Error(`Flag ${flagToken} requires a value.`);
	}

	if (next === '--') {
		throw new Error(`Flag ${flagToken} requires a value (got "--").`);
	}

	// Prevent accidentally consuming another flag as a value.
	// If the user truly needs a value that looks like a flag, they can use: --flag=<value> or -f=<value>.
	if (flagsIndex.isFlagToken(next)) {
		throw new Error(`Flag ${flagToken} requires a value (got "${next}").`);
	}

	return { value: next, newIndex: nextIndex };
}

function setBoolean(
	out: Record<string, ParsedFlagValue>,
	canonical: string,
	value: boolean
): void {
	// booleans can be repeated; last one wins (e.g. --no-x --x)
	out[canonical] = value;
}

function setValue(
	out: Record<string, ParsedFlagValue>,
	entry: FlagEntry,
	value: string
): void {
	const { canonical, def } = entry;

	const existing = out[canonical];
	if (existing === undefined) {
		out[canonical] = value;
		return;
	}

	// Repeated value flags must be explicit.
	if (!def.multiple) {
		throw new Error(
			`Duplicate flag "${canonical}". If it is intended to repeat, set { multiple: true } in its definition.`
		);
	}

	if (Array.isArray(existing)) {
		existing.push(value);
		return;
	}

	// existing is string|boolean; value-flags should only ever store string here
	if (typeof existing === 'string') {
		out[canonical] = [existing, value];
		return;
	}

	// Should be unreachable unless user mixes boolean/value definitions for the same canonical key
	throw new Error(`Invalid state for flag "${canonical}".`);
}
