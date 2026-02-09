import type { FS } from '../../fs/fs';
import type { Effect } from '../types';

export interface TouchArgs {
	files: string[];
	accessTimeOnly?: boolean;
	modificationTimeOnly?: boolean;
}

export function touch(fs: FS): Effect<TouchArgs> {
	return async ({
		files,
		accessTimeOnly = false,
		modificationTimeOnly = false,
	}) => {
		const shouldUpdateMtime = !accessTimeOnly || modificationTimeOnly;

		for (const file of files) {
			if (!(await fs.exists(file))) {
				await fs.writeFile(file, new Uint8Array());
				continue;
			}

			if (shouldUpdateMtime) {
				const content = await fs.readFile(file);
				await fs.writeFile(file, content);
			}
		}
	};
}
