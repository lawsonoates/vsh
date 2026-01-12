export const NEGATIVE_NUMBER_REGEX = /^(?:-\d+(?:\.\d+)?|-\.\d+)$/; // -1, -1.5, -.5

const SHORT_FLAG_LETTER_REGEX = /^[A-Za-z]$/;

export function isNegativeNumberToken(token: string): boolean {
	return NEGATIVE_NUMBER_REGEX.test(token);
}

export function startsWithLongPrefix(token: string): boolean {
	return token.length >= 2 && token[0] === '-' && token[1] === '-';
}

export function startsWithShortPrefix(token: string): boolean {
	return (
		token.length >= 1 && token[0] === '-' && !startsWithLongPrefix(token)
	);
}

export function startsWithNoLongPrefix(token: string): boolean {
	return token.startsWith('--no-') && token.length > '--no-'.length;
}

export function splitNameBeforeEquals(token: string): string {
	const eq = token.indexOf('=');
	return eq === -1 ? token : token.slice(0, eq);
}

export function isShortFlagLetter(ch: string): boolean {
	return SHORT_FLAG_LETTER_REGEX.test(ch);
}
