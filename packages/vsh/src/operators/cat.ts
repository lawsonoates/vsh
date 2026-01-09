import type { FS } from '../fs/fs';
import type { Record } from '../record';
import type { Transducer } from './transducer';

export function cat(fs: FS): Transducer<{ path: string }, Record> {
	return async function* (input) {
		for await (const file of input) {
			let lineNum = 1;
			for await (const text of fs.readLines(file.path)) {
				yield { file: file.path, kind: 'line', lineNum: lineNum++, text };
			}
		}
	};
}
