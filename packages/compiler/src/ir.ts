export type PipelineIR = {
	source: SourceIR;
	steps: StepIR[];
};

export type SourceIR = { kind: 'fs'; glob: string } | { kind: 'stdin' };

export type StepIR =
	| { cmd: 'cat'; args: { files: string[] } }
	| { cmd: 'cp'; args: { src: string; dest: string } }
	| { cmd: 'ls'; args: { path: string } }
	| { cmd: 'pwd'; args: Record<string, never> }
	| { cmd: 'tail'; args: { n: number } };
