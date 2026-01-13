import { expect, test } from 'bun:test';

import { cmd, literal } from '@/ir';
import { compileMv } from './mv';

test('mv with single file', () => {
	const result = compileMv(
		cmd('mv', [literal('source.txt'), literal('dest.txt')])
	);
	expect(result).toEqual({
		args: { srcs: [literal('source.txt')], dest: literal('dest.txt') },
		cmd: 'mv',
	});
});

test('mv with multiple sources', () => {
	const result = compileMv(
		cmd('mv', [literal('file1.txt'), literal('file2.txt'), literal('dir/')])
	);
	expect(result).toEqual({
		args: {
			srcs: [literal('file1.txt'), literal('file2.txt')],
			dest: literal('dir/'),
		},
		cmd: 'mv',
	});
});

test('mv with absolute paths', () => {
	const result = compileMv(
		cmd('mv', [literal('/tmp/file.txt'), literal('/home/user/file.txt')])
	);
	expect(result).toEqual({
		args: {
			srcs: [literal('/tmp/file.txt')],
			dest: literal('/home/user/file.txt'),
		},
		cmd: 'mv',
	});
});

test('mv with -f flag (ignored in compile)', () => {
	const result = compileMv(
		cmd('mv', [literal('-f'), literal('source.txt'), literal('dest.txt')])
	);
	expect(result).toEqual({
		args: { srcs: [literal('source.txt')], dest: literal('dest.txt') },
		cmd: 'mv',
	});
});

test('mv with -i flag (ignored in compile)', () => {
	const result = compileMv(
		cmd('mv', [literal('source.txt'), literal('-i'), literal('dest.txt')])
	);
	expect(result).toEqual({
		args: { srcs: [literal('source.txt')], dest: literal('dest.txt') },
		cmd: 'mv',
	});
});

test('mv with no arguments throws error', () => {
	expect(() => {
		compileMv(cmd('mv', []));
	}).toThrow('mv requires source and destination');
});

test('mv with single argument throws error', () => {
	expect(() => {
		compileMv(cmd('mv', [literal('file.txt')]));
	}).toThrow('mv requires source and destination');
});
