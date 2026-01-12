import { expect, test } from 'bun:test';

import { compileMkdir } from './mkdir';

test('mkdir with single directory', () => {
	const result = compileMkdir({ args: ['mydir'], name: 'mkdir' });
	expect(result).toEqual({
		args: { paths: ['mydir'], recursive: false },
		cmd: 'mkdir',
	});
});

test('mkdir with multiple directories', () => {
	const result = compileMkdir({
		args: ['dir1', 'dir2', 'dir3'],
		name: 'mkdir',
	});
	expect(result).toEqual({
		args: { paths: ['dir1', 'dir2', 'dir3'], recursive: false },
		cmd: 'mkdir',
	});
});

test('mkdir with absolute path', () => {
	const result = compileMkdir({
		args: ['/tmp/mydir'],
		name: 'mkdir',
	});
	expect(result).toEqual({
		args: { paths: ['/tmp/mydir'], recursive: false },
		cmd: 'mkdir',
	});
});

test('mkdir with -p flag (recursive)', () => {
	const result = compileMkdir({
		args: ['-p', '/tmp/a/b/c'],
		name: 'mkdir',
	});
	expect(result).toEqual({
		args: { paths: ['/tmp/a/b/c'], recursive: true },
		cmd: 'mkdir',
	});
});

test('mkdir with -p flag and multiple paths', () => {
	const result = compileMkdir({
		args: ['-p', 'dir1/subdir', 'dir2/subdir'],
		name: 'mkdir',
	});
	expect(result).toEqual({
		args: { paths: ['dir1/subdir', 'dir2/subdir'], recursive: true },
		cmd: 'mkdir',
	});
});

test('mkdir with no arguments throws error', () => {
	expect(() => {
		compileMkdir({ args: [], name: 'mkdir' });
	}).toThrow('mkdir requires at least one path');
});
