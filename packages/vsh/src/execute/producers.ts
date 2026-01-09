import type { FS } from '../fs/fs';
import type { Producer } from '../operators/producer';
import type { Transducer } from '../operators/transducer';

export function lines(fs: FS): Transducer<{ path: string }, { text: string }> {
	return async function* (input) {
		for await (const f of input) {
			for await (const line of fs.readLines(f.path)) {
				yield { text: line };
			}
		}
	};
}

export function files(fs: FS, glob: string): Producer<{ path: string }> {
	return async function* () {
		for await (const path of fs.list(glob)) {
			yield { path };
		}
	};
}
