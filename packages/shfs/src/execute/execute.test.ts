import { expect, test } from 'bun:test';
import { literal, type PipelineIR } from '@shfs/compiler';

import { collect } from '../consumer/consumer';
import { MemoryFS } from '../fs/memory';
import type { LineRecord, Record as ShellRecord } from '../record';
import { execute } from './execute';

const textDecoder = new TextDecoder();

test('writes stream output to redirected file', async () => {
	const fs = new MemoryFS();
	fs.setFile('input.txt', 'alpha\nbeta\ngamma');

	const ir: PipelineIR = {
		firstCommand: {
			name: literal('cat'),
			args: [literal('input.txt')],
			redirections: [],
		},
		source: { kind: 'fs', glob: 'input.txt' },
		steps: [
			{
				cmd: 'cat',
				redirections: [
					{ kind: 'output', target: literal('output.txt') },
				],
				args: {
					files: [literal('input.txt')],
				},
			},
		],
	};

	const result = execute(ir, fs);
	expect(result.kind).toBe('sink');
	if (result.kind === 'sink') {
		await result.value;
	}

	expect(textDecoder.decode(await fs.readFile('output.txt'))).toBe(
		'alpha\nbeta\ngamma'
	);
});

test('uses input redirection when no file args are provided', async () => {
	const fs = new MemoryFS();
	fs.setFile('input.txt', 'alpha\nbeta\ngamma');

	const ir: PipelineIR = {
		firstCommand: {
			name: literal('head'),
			args: [],
			redirections: [],
		},
		source: { kind: 'fs', glob: '**/*' },
		steps: [
			{
				cmd: 'head',
				redirections: [{ kind: 'input', target: literal('input.txt') }],
				args: {
					n: 2,
					files: [],
				},
			},
		],
	};

	const result = execute(ir, fs);
	expect(result.kind).toBe('stream');
	if (result.kind !== 'stream') {
		throw new Error('Expected stream result');
	}
	const records = await collect<ShellRecord>()(result.value);
	const lineRecords = records.filter(
		(record): record is LineRecord => record.kind === 'line'
	);
	expect(lineRecords.map((record) => record.text)).toEqual(['alpha', 'beta']);
});

test('supports combined input and output redirection', async () => {
	const fs = new MemoryFS();
	fs.setFile('input.txt', 'alpha\nbeta\ngamma');

	const ir: PipelineIR = {
		firstCommand: {
			name: literal('cat'),
			args: [],
			redirections: [],
		},
		source: { kind: 'fs', glob: '**/*' },
		steps: [
			{
				cmd: 'cat',
				redirections: [
					{ kind: 'input', target: literal('input.txt') },
					{ kind: 'output', target: literal('copy.txt') },
				],
				args: {
					files: [],
				},
			},
		],
	};

	const result = execute(ir, fs);
	expect(result.kind).toBe('sink');
	if (result.kind === 'sink') {
		await result.value;
	}

	expect(textDecoder.decode(await fs.readFile('copy.txt'))).toBe(
		'alpha\nbeta\ngamma'
	);
});

test('creates an empty output file when redirecting sink commands', async () => {
	const fs = new MemoryFS();

	const ir: PipelineIR = {
		firstCommand: {
			name: literal('touch'),
			args: [literal('created.txt')],
			redirections: [],
		},
		source: { kind: 'fs', glob: 'created.txt' },
		steps: [
			{
				cmd: 'touch',
				redirections: [{ kind: 'output', target: literal('logs.txt') }],
				args: {
					files: [literal('created.txt')],
				},
			},
		],
	};

	const result = execute(ir, fs);
	expect(result.kind).toBe('sink');
	if (result.kind === 'sink') {
		await result.value;
	}

	expect(await fs.exists('created.txt')).toBe(true);
	expect(textDecoder.decode(await fs.readFile('logs.txt'))).toBe('');
});
