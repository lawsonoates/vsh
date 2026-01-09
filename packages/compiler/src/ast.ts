export type ShellCommand = {
	name: string;
	args: string[];
};

export type ShellAST = {
	commands: ShellCommand[];
};
