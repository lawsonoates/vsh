import type { ShellAST } from './ast';

const WHITESPACE_REGEX = /\s+/;

export function parse(input: string): ShellAST {
	const commands = input
		.split('|')
		.map((s) => s.trim())
		.filter(Boolean)
		.map((cmd) => {
			const parts = tokenize(cmd);
			if (parts.length === 0) {
				throw new Error('Empty command');
			}
			return {
				args: parts.slice(1),
				name: parts[0] as string,
			};
		});

	if (commands.length === 0) {
		throw new Error('No commands found');
	}

	return { commands };
}

function tokenize(s: string): string[] {
	// minimal: split on whitespace, no quotes yet
	return s.split(WHITESPACE_REGEX).filter(Boolean);
}
