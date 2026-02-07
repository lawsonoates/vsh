import {
	expandedWordToString,
	extractPathsFromExpandedWords,
	type PipelineIR,
	type RedirectionIR,
	type StepIR,
} from '@shfs/compiler';
import { map, pipe } from 'remeda';
import type { FS } from '../fs/fs';
import { cat } from '../operator/cat/cat';
import { cp } from '../operator/cp/cp';
import { headWithN } from '../operator/head/head';
import { ls } from '../operator/ls/ls';
import { mkdir } from '../operator/mkdir/mkdir';
import { mv } from '../operator/mv/mv';
import { rm } from '../operator/rm/rm';
import { tail } from '../operator/tail/tail';
import { touch } from '../operator/touch/touch';
import type { Record } from '../record';
import type { Stream } from '../stream';
import { files } from './producers';

export type ExecuteResult =
	| { kind: 'stream'; value: Stream<Record> }
	| { kind: 'sink'; value: Promise<void> };

const textEncoder = new TextEncoder();

/**
 * Execute compiles a PipelineIR into an executable result.
 * Returns either a stream (for producers/transducers) or a promise (for sinks).
 */
export function execute(ir: PipelineIR, fs: FS): ExecuteResult {
	const step = ir.steps[0];
	if (!step) {
		return {
			kind: 'stream',
			value: (async function* () {
				// Empty stream - no steps to execute
			})(),
		};
	}

	let result: ExecuteResult;

	switch (step.cmd) {
		case 'cat': {
			const inputPath = getRedirectPath(step.redirections, 'input');
			const filePaths = withInputRedirect(
				extractPathsFromExpandedWords(step.args.files),
				inputPath
			);
			result = {
				kind: 'stream',
				value: pipe(files(...filePaths), cat(fs)),
			};
			break;
		}
		case 'cp': {
			const srcPaths = extractPathsFromExpandedWords(step.args.srcs);
			const destPath = expandedWordToString(step.args.dest);
			result = {
				kind: 'sink',
				value: Promise.all(
					map(srcPaths, (src) =>
						cp(fs)({
							src,
							dest: destPath,
							recursive: step.args.recursive,
						})
					)
				).then(),
			};
			break;
		}
		case 'head': {
			const inputPath = getRedirectPath(step.redirections, 'input');
			const filePaths = withInputRedirect(
				extractPathsFromExpandedWords(step.args.files),
				inputPath
			);
			result = {
				kind: 'stream',
				value: pipe(files(...filePaths), headWithN(fs, step.args.n)),
			};
			break;
		}
		case 'ls': {
			const paths = extractPathsFromExpandedWords(step.args.paths);
			result = {
				kind: 'stream',
				value: (async function* () {
					const results = await Promise.all(
						map(paths, (path) => ls(fs, path))
					).then();

					for (const file of results) {
						yield* file;
					}
				})(),
			};
			break;
		}
		case 'mkdir': {
			const paths = extractPathsFromExpandedWords(step.args.paths);
			result = {
				kind: 'sink',
				value: Promise.all(
					map(paths, (path) =>
						mkdir(fs)({ path, recursive: step.args.recursive })
					)
				).then(),
			};
			break;
		}
		case 'mv': {
			const srcPaths = extractPathsFromExpandedWords(step.args.srcs);
			const destPath = expandedWordToString(step.args.dest);
			result = {
				kind: 'sink',
				value: mv(fs)({ srcs: srcPaths, dest: destPath }),
			};
			break;
		}
		case 'rm': {
			const paths = extractPathsFromExpandedWords(step.args.paths);
			result = {
				kind: 'sink',
				value: Promise.all(
					map(paths, (path) =>
						rm(fs)({ path, recursive: step.args.recursive })
					)
				).then(),
			};
			break;
		}
		case 'tail': {
			const inputPath = getRedirectPath(step.redirections, 'input');
			const filePaths = withInputRedirect(
				extractPathsFromExpandedWords(step.args.files),
				inputPath
			);
			result = {
				kind: 'stream',
				value: (async function* () {
					const results = await Promise.all(
						map(filePaths, (file) =>
							pipe(files(file), cat(fs), tail(step.args.n))
						)
					);
					for (const lines of results) {
						yield* lines;
					}
				})(),
			};
			break;
		}
		case 'touch': {
			const filePaths = extractPathsFromExpandedWords(step.args.files);
			result = {
				kind: 'sink',
				value: touch(fs)({ files: filePaths }),
			};
			break;
		}
		default:
			throw new Error(
				`Unknown command: ${String((step as { cmd: string }).cmd)}`
			);
	}

	return applyOutputRedirect(result, step, fs);
}

function getRedirectPath(
	redirections: RedirectionIR[] | undefined,
	kind: RedirectionIR['kind']
): string | null {
	if (!redirections) {
		return null;
	}

	let redirectedPath: string | null = null;
	for (const redirection of redirections) {
		if (redirection.kind === kind) {
			redirectedPath = expandedWordToString(redirection.target);
		}
	}
	return redirectedPath;
}

function withInputRedirect(
	paths: string[],
	inputPath: string | null
): string[] {
	if (paths.length > 0 || !inputPath) {
		return paths;
	}
	return [inputPath];
}

function applyOutputRedirect(
	result: ExecuteResult,
	step: StepIR,
	fs: FS
): ExecuteResult {
	const outputPath = getRedirectPath(step.redirections, 'output');
	if (!outputPath) {
		return result;
	}

	if (result.kind === 'stream') {
		return {
			kind: 'sink',
			value: writeStreamToFile(result.value, outputPath, fs),
		};
	}

	return {
		kind: 'sink',
		value: result.value.then(async () => {
			await fs.writeFile(outputPath, textEncoder.encode(''));
		}),
	};
}

async function writeStreamToFile(
	stream: Stream<Record>,
	path: string,
	fs: FS
): Promise<void> {
	const outputChunks: string[] = [];
	for await (const record of stream) {
		outputChunks.push(formatRecord(record));
	}
	await fs.writeFile(path, textEncoder.encode(outputChunks.join('\n')));
}

function formatRecord(record: Record): string {
	switch (record.kind) {
		case 'line':
			return record.text;
		case 'file':
			return record.path;
		case 'json':
			return JSON.stringify(record.value);
		default:
			throw new Error('Unknown record kind');
	}
}
