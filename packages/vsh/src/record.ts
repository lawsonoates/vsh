/**
 * Record is the unit of data flowing through pipelines.
 * Commands operate on records, not bytes.
 */
export type Record =
	| { kind: 'file'; path: string }
	| { kind: 'line'; text: string; file?: string; lineNum?: number }
	| { kind: 'json'; value: unknown };
