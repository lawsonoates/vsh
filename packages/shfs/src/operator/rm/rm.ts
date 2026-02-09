import type { FS } from '../../fs/fs';
import type { Effect } from '../types';

export interface RmArgs {
	path: string;
	recursive: boolean;
	force?: boolean;
	interactive?: boolean;
}

export function rm(fs: FS): Effect<RmArgs> {
	return async ({ path, recursive, force = false, interactive = false }) => {
		if (interactive) {
			throw new Error(`rm: interactive mode is not supported: ${path}`);
		}

		let stat: Awaited<ReturnType<FS['stat']>> | null = null;
		try {
			stat = await fs.stat(path);
		} catch {
			if (force) {
				return;
			}
			throw new Error(`File not found: ${path}`);
		}

		if (!stat.isDirectory) {
			await fs.deleteFile(path);
			return;
		}

		if (!recursive) {
			throw new Error(`rm: cannot remove '${path}': Is a directory`);
		}
		await fs.deleteDirectory(path, true);
	};
}
