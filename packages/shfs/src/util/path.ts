const TRAILING_SLASH_REGEX = /\/+$/;
const MULTIPLE_SLASH_REGEX = /\/+/g;

export function normalizePath(path: string): string {
	if (path === '' || path === '/') {
		return '/';
	}
	const normalized = path
		.replace(TRAILING_SLASH_REGEX, '')
		.replace(MULTIPLE_SLASH_REGEX, '/');
	return normalized.startsWith('/') ? normalized : `/${normalized}`;
}
