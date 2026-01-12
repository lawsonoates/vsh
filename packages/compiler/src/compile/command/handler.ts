import type { ShellCommand } from '../../ast';
import type { StepIR } from '../../ir';
import { compileCat } from './cat/cat';
import { compileCp } from './cp/cp';
import { compileHead } from './head/head';
import { compileLs } from './ls/ls';
import { compileMkdir } from './mkdir/mkdir';
import { compileMv } from './mv/mv';
import { compileRm } from './rm/rm';
import { compileTail } from './tail/tail';
import { compileTouch } from './touch/touch';

export type Handler = (cmd: ShellCommand) => StepIR;

export namespace CommandHandler {
	const handlers: Record<string, Handler> = {
		cat: compileCat,
		cp: compileCp,
		head: compileHead,
		ls: compileLs,
		mkdir: compileMkdir,
		mv: compileMv,
		rm: compileRm,
		tail: compileTail,
		touch: compileTouch,
	};

	export function get(name: string): Handler {
		const handler = handlers[name];
		if (!handler) {
			throw new Error(`Unknown command: ${name}`);
		}

		return handler;
	}
}
