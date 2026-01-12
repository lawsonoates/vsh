import type { FS } from '../../fs/fs';
import type { Effect } from '../types';

export function touch(fs: FS): Effect<{ files: string[] }> {
	return async ({ files }) => {
		for (const file of files) {
			try {
				// If file exists, update its metadata (mtime)
				await fs.stat(file);
			} catch {
				// If file doesn't exist, create it as empty
				await fs.writeFile(file, new Uint8Array());
			}
		}
	};
}
