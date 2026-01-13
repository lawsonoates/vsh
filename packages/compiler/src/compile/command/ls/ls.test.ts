import { expect, test } from 'bun:test';

import { cmd, literal } from '@/ir';
import { compileLs } from './ls';

test('ls with no arguments defaults to current directory', () => {
	const result = compileLs(cmd('ls', []));
	expect(result).toEqual({
		args: { paths: [literal('.')] },
		cmd: 'ls',
	});
});

test('ls with single path', () => {
	const result = compileLs(cmd('ls', [literal('/tmp')]));
	expect(result).toEqual({
		args: { paths: [literal('/tmp')] },
		cmd: 'ls',
	});
});

test('ls with multiple paths', () => {
	const result = compileLs(
		cmd('ls', [literal('/home'), literal('/tmp'), literal('/var')])
	);
	expect(result).toEqual({
		args: { paths: [literal('/home'), literal('/tmp'), literal('/var')] },
		cmd: 'ls',
	});
});

test('ls with relative path', () => {
	const result = compileLs(cmd('ls', [literal('./src')]));
	expect(result).toEqual({
		args: { paths: [literal('./src')] },
		cmd: 'ls',
	});
});
