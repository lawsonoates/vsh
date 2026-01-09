import type { PipelineIR } from '@vsh/compiler/ir';

import type { FS } from '../fs/fs';
import { cat } from '../operators/cat';
import { cp } from '../operators/cp';
import { ls } from '../operators/ls';
import { pwd } from '../operators/pwd';
import { tail } from '../operators/tail';
import type { Record } from '../record';
import type { Stream } from '../stream';
import { pipe } from './pipe';
import { files } from './producers';

export type ExecuteResult =
	| { kind: 'stream'; stream: Stream<Record> }
	| { kind: 'sink'; promise: Promise<void> };

/**
 * Execute compiles a PipelineIR into an executable result.
 * Returns either a stream (for producers/transducers) or a promise (for sinks).
 */
export function execute(ir: PipelineIR, fs: FS): ExecuteResult {
	const step = ir.steps[0];
	if (!step) {
		return { kind: 'stream', stream: (async function* () {})() };
	}

	// Get source file(s) from IR
	const sourceGlob = ir.source.kind === 'fs' ? ir.source.glob : '';

	switch (step.cmd) {
		case 'cat':
			return {
				kind: 'stream',
				stream: pipe(files(fs, step.args.files.join(' ')), cat(fs)),
			};
		case 'cp':
			return {
				kind: 'sink',
				promise: pipe(ls(fs, step.args.src), cp(fs, step.args.dest)),
			};
		case 'ls':
			return { kind: 'stream', stream: pipe(ls(fs, step.args.path)) };
		case 'pwd':
			return { kind: 'stream', stream: pipe(pwd(fs)) };
		case 'tail':
			return {
				kind: 'stream',
				stream: pipe(files(fs, sourceGlob), cat(fs), tail(step.args.n)),
			};
	}
}
