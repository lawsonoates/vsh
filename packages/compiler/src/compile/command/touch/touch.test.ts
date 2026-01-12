import { expect, test } from 'bun:test';

import { compileTouch } from './touch';

test('touch with single file', () => {
	const result = compileTouch({ args: ['file.txt'], name: 'touch' });
	expect(result).toEqual({
		args: { files: ['file.txt'] },
		cmd: 'touch',
	});
});

test('touch with multiple files', () => {
	const result = compileTouch({
		args: ['file1.txt', 'file2.txt', 'file3.txt'],
		name: 'touch',
	});
	expect(result).toEqual({
		args: { files: ['file1.txt', 'file2.txt', 'file3.txt'] },
		cmd: 'touch',
	});
});

test('touch with absolute path', () => {
	const result = compileTouch({
		args: ['/tmp/file.txt'],
		name: 'touch',
	});
	expect(result).toEqual({
		args: { files: ['/tmp/file.txt'] },
		cmd: 'touch',
	});
});

test('touch with flags (ignored)', () => {
	const result = compileTouch({
		args: ['-a', '-m', 'file.txt'],
		name: 'touch',
	});
	expect(result).toEqual({
		args: { files: ['file.txt'] },
		cmd: 'touch',
	});
});

test('touch with no arguments throws error', () => {
	expect(() => {
		compileTouch({ args: [], name: 'touch' });
	}).toThrow('touch requires at least one file');
});

test('touch with only flags throws error', () => {
	expect(() => {
		compileTouch({ args: ['-a', '-m'], name: 'touch' });
	}).toThrow('touch requires at least one file');
});
