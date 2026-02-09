import type { LineRecord } from '../../record';
import type { Stream } from '../../stream';

const ROOT_DIRECTORY = '/';

export async function* pwd(cwd = ROOT_DIRECTORY): Stream<LineRecord> {
	yield { kind: 'line', text: cwd };
}
