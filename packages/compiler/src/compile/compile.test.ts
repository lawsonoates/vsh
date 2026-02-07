import { expect, test } from 'bun:test';

import { literal } from '@/ir';
import { parse } from '@/parser/parser';
import { compile } from './compile';

test('compile preserves output redirection on steps', () => {
	const ir = compile(parse('cat input.txt > output.txt'));
	expect(ir.steps[0]).toMatchObject({
		cmd: 'cat',
		redirections: [{ kind: 'output', target: literal('output.txt') }],
	});
});

test('compile preserves input redirection on steps', () => {
	const ir = compile(parse('head -n 1 < input.txt'));
	expect(ir.steps[0]).toMatchObject({
		cmd: 'head',
		redirections: [{ kind: 'input', target: literal('input.txt') }],
	});
});
