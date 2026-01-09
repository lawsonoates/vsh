import type { Stream } from '../stream';

export type Transducer<I, O> = (input: Stream<I>) => Stream<O>;
