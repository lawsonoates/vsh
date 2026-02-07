/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { createRoot } from 'react-dom/client';
import { App } from './app';

function start() {
	const rootElement = document.getElementById('root');
	if (rootElement === null) {
		throw new Error('Expected to find "#root" mount element');
	}
	const root = createRoot(rootElement);
	root.render(<App />);
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', start);
} else {
	start();
}
