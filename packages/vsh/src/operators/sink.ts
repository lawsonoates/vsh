import type { Stream } from '../stream';

export type Sink<I, R> = (input: Stream<I>) => Promise<R>;
