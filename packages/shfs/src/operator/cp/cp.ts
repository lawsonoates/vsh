import type { FS } from '../../fs/fs';
import type { Effect } from '../types';

const TRAILING_SLASH_REGEX = /\/+$/;
const MULTIPLE_SLASH_REGEX = /\/+/g;

export interface CpArgs {
	srcs: string[];
	dest: string;
	recursive: boolean;
	force?: boolean;
	interactive?: boolean;
}

function trimTrailingSlash(path: string): string {
	return path.replace(TRAILING_SLASH_REGEX, '');
}

function joinPath(base: string, suffix: string): string {
	return `${trimTrailingSlash(base)}/${suffix}`.replace(
		MULTIPLE_SLASH_REGEX,
		'/'
	);
}

function basename(path: string): string {
	const normalized = trimTrailingSlash(path);
	const slashIndex = normalized.lastIndexOf('/');
	if (slashIndex === -1) {
		return normalized;
	}
	return normalized.slice(slashIndex + 1);
}

async function isDirectory(fs: FS, path: string): Promise<boolean> {
	try {
		const stat = await fs.stat(path);
		return stat.isDirectory;
	} catch {
		return false;
	}
}

async function assertCanWriteDestination(
	fs: FS,
	path: string,
	force: boolean,
	interactive: boolean
): Promise<void> {
	const exists = await fs.exists(path);
	if (!exists) {
		return;
	}
	if (interactive) {
		throw new Error(`cp: destination exists (interactive): ${path}`);
	}
	if (!force) {
		throw new Error(
			`cp: destination exists (use -f to overwrite): ${path}`
		);
	}
}

async function copyFileWithPolicy(
	fs: FS,
	src: string,
	dest: string,
	force: boolean,
	interactive: boolean
): Promise<void> {
	await assertCanWriteDestination(fs, dest, force, interactive);
	const content = await fs.readFile(src);
	await fs.writeFile(dest, content);
}

async function copyDirectoryRecursive(
	fs: FS,
	srcDir: string,
	destDir: string,
	force: boolean,
	interactive: boolean
): Promise<void> {
	const normalizedSrc = trimTrailingSlash(srcDir);
	const glob = `${normalizedSrc}/**/*`;
	for await (const srcPath of fs.readdir(glob)) {
		const relativePath = srcPath.slice(normalizedSrc.length + 1);
		const targetPath = joinPath(destDir, relativePath);
		const sourceStat = await fs.stat(srcPath);
		if (sourceStat.isDirectory) {
			continue;
		}
		await copyFileWithPolicy(fs, srcPath, targetPath, force, interactive);
	}
}

export function cp(fs: FS): Effect<CpArgs> {
	return async ({
		srcs,
		dest,
		force = false,
		interactive = false,
		recursive,
	}) => {
		if (srcs.length === 0) {
			throw new Error('cp requires at least one source');
		}

		const destinationIsDirectory = await isDirectory(fs, dest);
		if (srcs.length > 1 && !destinationIsDirectory) {
			throw new Error(
				'cp destination must be a directory for multiple sources'
			);
		}

		for (const src of srcs) {
			const srcStat = await fs.stat(src);
			const targetPath =
				destinationIsDirectory || srcs.length > 1
					? joinPath(dest, basename(src))
					: dest;

			if (srcStat.isDirectory) {
				if (!recursive) {
					throw new Error(`cp: omitting directory "${src}" (use -r)`);
				}
				await copyDirectoryRecursive(
					fs,
					src,
					targetPath,
					force,
					interactive
				);
				continue;
			}

			await copyFileWithPolicy(fs, src, targetPath, force, interactive);
		}
	};
}
