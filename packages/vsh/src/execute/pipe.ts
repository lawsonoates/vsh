import type { Producer } from '../operators/producer';
import type { Sink } from '../operators/sink';
import type { Transducer } from '../operators/transducer';
import type { Stream } from '../stream';

/**
 * Pipe composes a producer through transducers, optionally ending with a sink.
 *
 * Examples:
 *   pipe(ls(fs, '*'))                           -> Stream<Record>
 *   pipe(ls(fs, '*'), tail(10))                 -> Stream<Record>
 *   pipe(ls(fs, '*'), cp(fs, 'dest'))           -> Promise<void>
 *   pipe(files(fs, '*.txt'), cat(fs), tail(5)) -> Stream<Record>
 */
export function pipe<O>(producer: Producer<O>): Stream<O>;
export function pipe<O, R>(producer: Producer<O>, sink: Sink<O, R>): Promise<R>;
export function pipe<A, B>(
	producer: Producer<A>,
	t1: Transducer<A, B>,
): Stream<B>;
export function pipe<A, B, R>(
	producer: Producer<A>,
	t1: Transducer<A, B>,
	sink: Sink<B, R>,
): Promise<R>;
export function pipe<A, B, C>(
	producer: Producer<A>,
	t1: Transducer<A, B>,
	t2: Transducer<B, C>,
): Stream<C>;
export function pipe<A, B, C, R>(
	producer: Producer<A>,
	t1: Transducer<A, B>,
	t2: Transducer<B, C>,
	sink: Sink<C, R>,
): Promise<R>;
export function pipe(
	producer: Producer<unknown>,
	...ops: (Transducer<unknown, unknown> | Sink<unknown, unknown>)[]
): Stream<unknown> | Promise<unknown> {
	let stream: Stream<unknown> = producer();

	for (let i = 0; i < ops.length; i++) {
		const op = ops[i]!;
		const result = op(stream);

		// If result is a Promise, it's a sink - return it
		if (result instanceof Promise) {
			return result;
		}

		// Otherwise it's a transducer - continue piping
		stream = result;
	}

	return stream;
}
