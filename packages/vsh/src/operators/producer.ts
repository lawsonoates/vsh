import type { Stream } from '../stream';

export type Producer<O> = () => Stream<O>;
