export interface ShellCommand {
	name: string;
	args: string[];
}

export interface ShellAST {
	commands: ShellCommand[];
}
