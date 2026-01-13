Use this tool to execute filesystem-related fish shell commands.

--

Strict fish-inspired subset for filesystem commands. Not POSIX, not full fish. Deterministic, stream-based, no ambient state.

## Commands

- `cat`, `cp`, `head`, `ls`, `mkdir`, `mv`, `rm`, `tail`, `touch` (built-ins only, no external binaries, no `$PATH`)

## Supported

- **Pipelines**: `|` only, left-to-right, stream-based
- **Quoting**: Single `'` (literal, no escapes), double `"` (allows `(command)` substitution, escapes `"` and `` only)
- **Escapes**: `` escapes next char outside quotes, line continuation at EOL; literal in single quotes
- **Command substitution**: `(command)` syntax (NOT `$()`), recursive, output trimmed/split on newlines
- **Globbing**: `*`, `?`, `[abc]`, `[a-z]`, `[!abc]` (no expansion in quotes, no-match = literal)
- **Comments**: `#` to EOL (only at token start)

## Not Supported

- Variables (`set`, `$x`), recursive globs (`**`), brace expansion
- Redirection (`<`, `>`)
- Control flow (`if`, `for`, `while`, `switch`, functions)
- `;`, `&`, `&&`/`||`, `and`/`or`/`not`, `~`, `$()`, heredocs, process substitution