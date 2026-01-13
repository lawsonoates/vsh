// ─────────────────────────────────────────────────────────
// Word Expansion Types (for new AST-based parser)
// ─────────────────────────────────────────────────────────

/**
 * Represents the result of word expansion.
 * Used by the new AST-based compiler to preserve expansion information.
 */
export type ExpandedWord =
	| { kind: 'literal'; value: string }
	| { kind: 'glob'; pattern: string; expanded: string[] }
	| { kind: 'commandSub'; command: string; output: string[] };

/**
 * Represents a simple command in IR form (for new AST-based compiler).
 */
export interface SimpleCommandIR {
	name: ExpandedWord;
	args: ExpandedWord[];
	redirections: RedirectionIR[];
}

/**
 * Represents a redirection in IR form.
 */
export interface RedirectionIR {
	kind: 'input' | 'output';
	target: ExpandedWord;
}

// ─────────────────────────────────────────────────────────
// Pipeline IR
// ─────────────────────────────────────────────────────────

export type SourceIR =
	| {
			kind: 'fs';
			glob: string;
	  }
	| {
			kind: 'stdin';
	  };

/**
 * Cat step with ExpandedWord support.
 */
export interface CatStep {
	cmd: 'cat';
	args: {
		files: ExpandedWord[];
		numberLines?: boolean;
		numberNonBlank?: boolean;
		squeezeBlank?: boolean;
		showEnds?: boolean;
		showTabs?: boolean;
		showAll?: boolean;
		showNonprinting?: boolean;
	};
}

/**
 * Cp step with ExpandedWord support.
 */
export interface CpStep {
	cmd: 'cp';
	args: { srcs: ExpandedWord[]; dest: ExpandedWord; recursive: boolean };
}

/**
 * Head step with ExpandedWord support.
 */
export interface HeadStep {
	cmd: 'head';
	args: { n: number; files: ExpandedWord[] };
}

/**
 * Ls step with ExpandedWord support.
 */
export interface LsStep {
	cmd: 'ls';
	args: { paths: ExpandedWord[] };
}

/**
 * Mkdir step with ExpandedWord support.
 */
export interface MkdirStep {
	cmd: 'mkdir';
	args: { paths: ExpandedWord[]; recursive: boolean };
}

/**
 * Mv step with ExpandedWord support.
 */
export interface MvStep {
	cmd: 'mv';
	args: { srcs: ExpandedWord[]; dest: ExpandedWord };
}

/**
 * Rm step with ExpandedWord support.
 */
export interface RmStep {
	cmd: 'rm';
	args: { paths: ExpandedWord[]; recursive: boolean };
}

/**
 * Tail step with ExpandedWord support.
 */
export interface TailStep {
	cmd: 'tail';
	args: { n: number; files: ExpandedWord[] };
}

/**
 * Touch step with ExpandedWord support.
 */
export interface TouchStep {
	cmd: 'touch';
	args: { files: ExpandedWord[] };
}

/**
 * Union of all step types.
 */
export type StepIR =
	| CatStep
	| CpStep
	| HeadStep
	| LsStep
	| MkdirStep
	| MvStep
	| RmStep
	| TailStep
	| TouchStep;

/**
 * PipelineIR with ExpandedWord support.
 */
export interface PipelineIR {
	source: SourceIR;
	steps: StepIR[];
	firstCommand?: SimpleCommandIR;
}

// ─────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────

/**
 * Create a literal ExpandedWord.
 */
export function literal(value: string): ExpandedWord {
	return { kind: 'literal', value };
}

/**
 * Create a SimpleCommandIR for testing purposes.
 * Convenience helper that creates a command with a name and arguments.
 */
export function cmd(name: string, args: ExpandedWord[]): SimpleCommandIR {
	return { name: literal(name), args, redirections: [] };
}

/**
 * Create a glob ExpandedWord.
 */
export function glob(pattern: string, expanded: string[] = []): ExpandedWord {
	return { kind: 'glob', pattern, expanded };
}

/**
 * Create a command substitution ExpandedWord.
 */
export function commandSub(
	command: string,
	output: string[] = []
): ExpandedWord {
	return { kind: 'commandSub', command, output };
}

/**
 * Extract the string value from an ExpandedWord.
 * For globs, returns the pattern. For command subs, returns the command.
 */
export function expandedWordToString(word: ExpandedWord): string {
	switch (word.kind) {
		case 'literal':
			return word.value;
		case 'glob':
			return word.pattern;
		case 'commandSub':
			return word.command;
		default: {
			const _exhaustive: never = word;
			throw new Error(
				`Unknown word kind: ${JSON.stringify(_exhaustive)}`
			);
		}
	}
}

/**
 * Extract paths from an array of ExpandedWords.
 * For globs and command subs, expands to their resolved values.
 */
export function extractPathsFromExpandedWords(words: ExpandedWord[]): string[] {
	return words.flatMap((word): string[] => {
		switch (word.kind) {
			case 'literal':
				return [word.value];
			case 'glob':
				// Return expanded values if available, otherwise the pattern
				return word.expanded.length > 0
					? word.expanded
					: [word.pattern];
			case 'commandSub':
				return word.output;
			default: {
				const _exhaustive: never = word;
				throw new Error(
					`Unknown word kind: ${JSON.stringify(_exhaustive)}`
				);
			}
		}
	});
}
