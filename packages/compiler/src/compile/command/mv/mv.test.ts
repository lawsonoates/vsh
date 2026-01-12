import { expect, test } from 'bun:test';

import { compileMv } from './mv';

test('mv with single file', () => {
	const result = compileMv({ args: ['source.txt', 'dest.txt'], name: 'mv' });
	expect(result).toEqual({
		args: { srcs: ['source.txt'], dest: 'dest.txt' },
		cmd: 'mv',
	});
});

test('mv with multiple sources', () => {
	const result = compileMv({
		args: ['file1.txt', 'file2.txt', 'dir/'],
		name: 'mv',
	});
	expect(result).toEqual({
		args: { srcs: ['file1.txt', 'file2.txt'], dest: 'dir/' },
		cmd: 'mv',
	});
});

test('mv with absolute paths', () => {
	const result = compileMv({
		args: ['/tmp/file.txt', '/home/user/file.txt'],
		name: 'mv',
	});
	expect(result).toEqual({
		args: { srcs: ['/tmp/file.txt'], dest: '/home/user/file.txt' },
		cmd: 'mv',
	});
});

test('mv with -f flag (ignored in compile)', () => {
	const result = compileMv({
		args: ['-f', 'source.txt', 'dest.txt'],
		name: 'mv',
	});
	expect(result).toEqual({
		args: { srcs: ['source.txt'], dest: 'dest.txt' },
		cmd: 'mv',
	});
});

test('mv with -i flag (ignored in compile)', () => {
	const result = compileMv({
		args: ['source.txt', '-i', 'dest.txt'],
		name: 'mv',
	});
	expect(result).toEqual({
		args: { srcs: ['source.txt'], dest: 'dest.txt' },
		cmd: 'mv',
	});
});

test('mv with no arguments throws error', () => {
	expect(() => {
		compileMv({ args: [], name: 'mv' });
	}).toThrow('mv requires source and destination');
});

test('mv with single argument throws error', () => {
	expect(() => {
		compileMv({ args: ['file.txt'], name: 'mv' });
	}).toThrow('mv requires source and destination');
});
