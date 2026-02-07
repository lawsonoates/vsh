import { Terminal } from './components/terminal';
import './index.css';
import githubLogo from '../public/GitHub_Invertocat_Black.svg';

export function App() {
	return (
		<main className="relative flex min-h-screen w-full items-center justify-center bg-black">
			<a
				aria-label="View shfs on GitHub"
				className="absolute top-4 right-4 rounded-full bg-black p-2"
				href="https://github.com/lawsonoates/shfs"
				rel="noopener noreferrer"
				target="_blank"
			>
				<img
					alt="GitHub logo"
					className="h-6 w-6 invert"
					height={24}
					src={githubLogo}
					width={24}
				/>
			</a>
			<Terminal />
		</main>
	);
}

export default App;
