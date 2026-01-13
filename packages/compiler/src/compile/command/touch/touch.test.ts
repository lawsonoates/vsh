import { expect, test } from 'bun:test';

import { cmd, literal } from '@/ir';
import { compileTouch } from './touch';

test('touch with single file', () => {
	const result = compileTouch(cmd('touch', [literal('file.txt')]));
	expect(result).toEqual({
		args: { files: [literal('file.txt')] },
		cmd: 'touch',
	});
});

test('touch with multiple files', () => {
	const result = compileTouch(
		cmd('touch', [
			literal('file1.txt'),
			literal('file2.txt'),
			literal('file3.txt'),
		])
	);
	expect(result).toEqual({
		args: {
			files: [
				literal('file1.txt'),
				literal('file2.txt'),
				literal('file3.txt'),
			],
		},
		cmd: 'touch',
	});
});

test('touch with absolute path', () => {
	const result = compileTouch(cmd('touch', [literal('/tmp/file.txt')]));
	expect(result).toEqual({
		args: { files: [literal('/tmp/file.txt')] },
		cmd: 'touch',
	});
});

test('touch with flags (ignored)', () => {
	const result = compileTouch(
		cmd('touch', [literal('-a'), literal('-m'), literal('file.txt')])
	);
	expect(result).toEqual({
		args: { files: [literal('file.txt')] },
		cmd: 'touch',
	});
});

test('touch with no arguments throws error', () => {
	expect(() => {
		compileTouch(cmd('touch', []));
	}).toThrow('touch requires at least one file');
});

test('touch with only flags throws error', () => {
	expect(() => {
		compileTouch(cmd('touch', [literal('-a'), literal('-m')]));
	}).toThrow('touch requires at least one file');
});
