import { expect, test } from 'bun:test';

import { compileCat } from './cat';

test('cat with single file', () => {
	const result = compileCat({ args: ['file.txt'], name: 'cat' });
	expect(result).toEqual({
		args: {
			files: ['file.txt'],
			numberLines: false,
			numberNonBlank: false,
			showAll: false,
			showEnds: false,
			showNonprinting: false,
			showTabs: false,
			squeezeBlank: false,
		},
		cmd: 'cat',
	});
});

test('cat with multiple files', () => {
	const result = compileCat({
		args: ['file1.txt', 'file2.txt', 'file3.txt'],
		name: 'cat',
	});
	expect(result).toEqual({
		args: {
			files: ['file1.txt', 'file2.txt', 'file3.txt'],
			numberLines: false,
			numberNonBlank: false,
			showAll: false,
			showEnds: false,
			showNonprinting: false,
			showTabs: false,
			squeezeBlank: false,
		},
		cmd: 'cat',
	});
});

test('cat with no arguments throws error', () => {
	expect(() => {
		compileCat({ args: [], name: 'cat' });
	}).toThrow('cat requires at least one file');
});

test('cat with -n flag', () => {
	const result = compileCat({ args: ['-n', 'file.txt'], name: 'cat' });
	expect(result).toEqual({
		args: {
			files: ['file.txt'],
			numberLines: true,
			numberNonBlank: false,
			showAll: false,
			showEnds: false,
			showNonprinting: false,
			showTabs: false,
			squeezeBlank: false,
		},
		cmd: 'cat',
	});
});

test('cat with combined flags -nE', () => {
	const result = compileCat({ args: ['-nE', 'file.txt'], name: 'cat' });
	expect(result).toEqual({
		args: {
			files: ['file.txt'],
			numberLines: true,
			numberNonBlank: false,
			showAll: false,
			showEnds: true,
			showNonprinting: false,
			showTabs: false,
			squeezeBlank: false,
		},
		cmd: 'cat',
	});
});

test('cat with -b flag', () => {
	const result = compileCat({ args: ['-b', 'file.txt'], name: 'cat' });
	expect(result).toEqual({
		args: {
			files: ['file.txt'],
			numberLines: false,
			numberNonBlank: true,
			showAll: false,
			showEnds: false,
			showNonprinting: false,
			showTabs: false,
			squeezeBlank: false,
		},
		cmd: 'cat',
	});
});

test('cat with -A flag', () => {
	const result = compileCat({ args: ['-A', 'file.txt'], name: 'cat' });
	expect(result).toEqual({
		args: {
			files: ['file.txt'],
			numberLines: false,
			numberNonBlank: false,
			showAll: true,
			showEnds: false,
			showNonprinting: false,
			showTabs: false,
			squeezeBlank: false,
		},
		cmd: 'cat',
	});
});

test('cat with -v flag', () => {
	const result = compileCat({ args: ['-v', 'file.txt'], name: 'cat' });
	expect(result).toEqual({
		args: {
			files: ['file.txt'],
			numberLines: false,
			numberNonBlank: false,
			showAll: false,
			showEnds: false,
			showNonprinting: true,
			showTabs: false,
			squeezeBlank: false,
		},
		cmd: 'cat',
	});
});

test('cat with -T flag', () => {
	const result = compileCat({ args: ['-T', 'file.txt'], name: 'cat' });
	expect(result).toEqual({
		args: {
			files: ['file.txt'],
			numberLines: false,
			numberNonBlank: false,
			showAll: false,
			showEnds: false,
			showNonprinting: false,
			showTabs: true,
			squeezeBlank: false,
		},
		cmd: 'cat',
	});
});

test('cat with -s flag', () => {
	const result = compileCat({ args: ['-s', 'file.txt'], name: 'cat' });
	expect(result).toEqual({
		args: {
			files: ['file.txt'],
			numberLines: false,
			numberNonBlank: false,
			showAll: false,
			showEnds: false,
			showNonprinting: false,
			showTabs: false,
			squeezeBlank: true,
		},
		cmd: 'cat',
	});
});

test('cat with combined flags -bE', () => {
	const result = compileCat({ args: ['-bE', 'file.txt'], name: 'cat' });
	expect(result).toEqual({
		args: {
			files: ['file.txt'],
			numberLines: false,
			numberNonBlank: true,
			showAll: false,
			showEnds: true,
			showNonprinting: false,
			showTabs: false,
			squeezeBlank: false,
		},
		cmd: 'cat',
	});
});

test('cat with combined flags -ATv', () => {
	const result = compileCat({ args: ['-ATv', 'file.txt'], name: 'cat' });
	expect(result).toEqual({
		args: {
			files: ['file.txt'],
			numberLines: false,
			numberNonBlank: false,
			showAll: true,
			showEnds: false,
			showNonprinting: true,
			showTabs: true,
			squeezeBlank: false,
		},
		cmd: 'cat',
	});
});

test('cat with combined flags -nsT', () => {
	const result = compileCat({ args: ['-nsT', 'file.txt'], name: 'cat' });
	expect(result).toEqual({
		args: {
			files: ['file.txt'],
			numberLines: true,
			numberNonBlank: false,
			showAll: false,
			showEnds: false,
			showNonprinting: false,
			showTabs: true,
			squeezeBlank: true,
		},
		cmd: 'cat',
	});
});
