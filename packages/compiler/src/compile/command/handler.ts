import type { ShellCommand } from '../../ast';
import type { StepIR } from '../../ir';
import { compileCat } from './cat';
import { compileCp } from './cp';
import { compileLs } from './ls';
import { compilePwd } from './pwd';
import { compileTail } from './tail';

export type Handler = (cmd: ShellCommand) => StepIR;

export namespace CommandHandler {
	const handlers: Record<string, Handler> = {
		cat: compileCat,
		cp: compileCp,
		ls: compileLs,
		pwd: compilePwd,
		tail: compileTail,
	};

	export function get(name: string): Handler {
		const handler = handlers[name];
		if (!handler) {
			throw new Error(`Unknown command: ${name}`);
		}

		return handler;
	}
}
