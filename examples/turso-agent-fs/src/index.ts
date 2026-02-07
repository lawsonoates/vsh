import { Shell } from 'shfs';
import { TursoAgentFS } from './fs';

const fs = await TursoAgentFS.create('my-agent');
await fs.writeFile(
	'hello.txt',
	new TextEncoder().encode('Hello, world!\nRedirection works.')
);

const { $ } = new Shell(fs);

await $`cat < hello.txt > copied.txt`.text();

const copied = await $`cat copied.txt`.text();
const firstLine = await $`head -n 1 < copied.txt`.text();

console.log('copied.txt contents:');
console.log(copied);
console.log('first line via input redirection:', firstLine);
