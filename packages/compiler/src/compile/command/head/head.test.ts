import { expect, test } from 'bun:test';

import { compileHead } from './head';

test('head with single file', () => {
	const result = compileHead({ args: ['file.txt'], name: 'head' });
	expect(result).toEqual({
		args: { files: ['file.txt'], n: 10 },
		cmd: 'head',
	});
});

test('head with multiple files', () => {
	const result = compileHead({
		args: ['file1.txt', 'file2.txt'],
		name: 'head',
	});
	expect(result).toEqual({
		args: { files: ['file1.txt', 'file2.txt'], n: 10 },
		cmd: 'head',
	});
});

test('head with -n flag', () => {
	const result = compileHead({
		args: ['-n', '5', 'file.txt'],
		name: 'head',
	});
	expect(result).toEqual({
		args: { files: ['file.txt'], n: 5 },
		cmd: 'head',
	});
});

test('head with -N format (e.g., -5)', () => {
	const result = compileHead({
		args: ['-5', 'file.txt'],
		name: 'head',
	});
	expect(result).toEqual({
		args: { files: ['file.txt'], n: 5 },
		cmd: 'head',
	});
});

test('head with -n and multiple files', () => {
	const result = compileHead({
		args: ['-n', '20', 'file1.txt', 'file2.txt'],
		name: 'head',
	});
	expect(result).toEqual({
		args: { files: ['file1.txt', 'file2.txt'], n: 20 },
		cmd: 'head',
	});
});

test('head with absolute path', () => {
	const result = compileHead({
		args: ['/tmp/file.txt'],
		name: 'head',
	});
	expect(result).toEqual({
		args: { files: ['/tmp/file.txt'], n: 10 },
		cmd: 'head',
	});
});

test('head -n without number throws error', () => {
	expect(() => {
		compileHead({ args: ['-n'], name: 'head' });
	}).toThrow('head -n requires a number');
});

test('head with invalid -n value throws error', () => {
	expect(() => {
		compileHead({ args: ['-n', 'invalid', 'file.txt'], name: 'head' });
	}).toThrow('Invalid head count');
});

test('head with unknown option throws error', () => {
	expect(() => {
		compileHead({ args: ['-x', 'file.txt'], name: 'head' });
	}).toThrow('Unknown head option');
});
