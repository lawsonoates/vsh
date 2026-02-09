/**
 * Command handler registry for the AST-based compiler.
 *
 * This module provides handlers that accept SimpleCommandIR and produce StepIR.
 * Each handler extracts values from ExpandedWord types.
 */

import type { SimpleCommandIR, StepIR } from '../../ir';
import { compileCat } from './cat/cat';
import { compileCd } from './cd/cd';
import { compileCp } from './cp/cp';
import { compileHead } from './head/head';
import { compileLs } from './ls/ls';
import { compileMkdir } from './mkdir/mkdir';
import { compileMv } from './mv/mv';
import { compilePwd } from './pwd/pwd';
import { compileRm } from './rm/rm';
import { compileTail } from './tail/tail';
import { compileTouch } from './touch/touch';

/**
 * Handler function type for compiler.
 * Accepts a SimpleCommandIR and returns a StepIR.
 */
export type Handler = (cmd: SimpleCommandIR) => StepIR;

/**
 * Registry of command handlers for the compiler.
 */
export namespace CommandHandler {
	const handlers: Record<string, Handler> = {
		cat: compileCat,
		cd: compileCd,
		cp: compileCp,
		head: compileHead,
		ls: compileLs,
		mkdir: compileMkdir,
		mv: compileMv,
		pwd: compilePwd,
		rm: compileRm,
		tail: compileTail,
		touch: compileTouch,
	};

	/**
	 * Get a handler for a command name.
	 * @throws Error if the command is unknown
	 */
	export function get(name: string): Handler {
		const handler = handlers[name];
		if (!handler) {
			throw new Error(`Unknown command: ${name}`);
		}
		return handler;
	}

	/**
	 * Check if a handler exists for a command name.
	 */
	export function has(name: string): boolean {
		return name in handlers;
	}

	/**
	 * Register a custom handler.
	 */
	export function register(name: string, handler: Handler): void {
		handlers[name] = handler;
	}
}
