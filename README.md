# vsh

vsh (virtual shell) is a library of POSIX shell commands (a subset) and is inspired by Bun's `$` shell api.

vsh commands are a filesystem-related subset (cat, head etc.) and operate on a pluggable filesystem allowing custom storage.

vsh is designed to be used by agents needing a filesystem without having to spin up a sandbox.

## Installation

```bash
bun add vsh
```

## Usage

```typescript
import { Shell } from 'vsh';
import { MemoryFS } from 'vsh/fs';

const fs = new MemoryFS();
fs.setFile('hello.txt', 'hello world');

const { $ } = new Shell(fs);

const content = await $`cat hello.txt`.text();
console.log(content);
```

## Supported Commands
- cat
- cp
- head
- ls
- mkdir
- mv
- rm
- tail
- touch

## License

MIT