import { MemoryFS } from '../fs/memory';
import { ShellClient } from './client';

export function $(strings: TemplateStringsArray, ...exprs: unknown[]) {
	const shell = new ShellClient(new MemoryFS());
	return shell.query(strings, ...exprs);
}
