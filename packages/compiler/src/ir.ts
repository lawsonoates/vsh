export interface PipelineIR {
	source: SourceIR;
	steps: StepIR[];
}

export type SourceIR =
	| {
			kind: 'fs';
			glob: string;
	  }
	| {
			kind: 'stdin';
	  };

export interface CatStep {
	cmd: 'cat';
	args: {
		files: string[];
		numberLines?: boolean;
		numberNonBlank?: boolean;
		squeezeBlank?: boolean;
		showEnds?: boolean;
		showTabs?: boolean;
		showAll?: boolean;
		showNonprinting?: boolean;
	};
}

export interface CpStep {
	cmd: 'cp';
	args: { srcs: string[]; dest: string; recursive: boolean };
}

export interface HeadStep {
	cmd: 'head';
	args: { n: number; files: string[] };
}

export interface LsStep {
	cmd: 'ls';
	args: { paths: string[] };
}

export interface MkdirStep {
	cmd: 'mkdir';
	args: { paths: string[]; recursive: boolean };
}

export interface MvStep {
	cmd: 'mv';
	args: { srcs: string[]; dest: string };
}

export interface RmStep {
	cmd: 'rm';
	args: { paths: string[]; recursive: boolean };
}

export interface TailStep {
	cmd: 'tail';
	args: { n: number; files: string[] };
}

export interface TouchStep {
	cmd: 'touch';
	args: { files: string[] };
}

export type StepIR =
	| CatStep
	| CpStep
	| HeadStep
	| LsStep
	| MkdirStep
	| MvStep
	| RmStep
	| TailStep
	| TouchStep;
