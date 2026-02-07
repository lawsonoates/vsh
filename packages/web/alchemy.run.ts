import alchemy from 'alchemy';
import { Website } from 'alchemy/cloudflare';

const app = await alchemy('shfs');

const website = await Website('shfs', {
	name: 'shfs',
	build: 'bun run build',
	dev: 'bun dev',
	assets: './dist',
	domains: ['shfs.lawsonoates.com'],
});

console.log(`Website deployed at: ${website.url}`);
await app.finalize();
