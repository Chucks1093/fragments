import './App.css';
import { createBrowserRouter, redirect, RouterProvider } from 'react-router';
import Register from './pages/coursehub/Register';
import Login from './pages/coursehub/Login';
import VesselHomePage from './pages/vessel/VesselHomePage';
import WaveAnimation from './components/vessel/WaveAnimation';
import { Toaster } from 'react-hot-toast';

const router = createBrowserRouter(
	[
		{
			path: '/',
			loader: () => redirect('/vessels'), // or wherever you want default
		},
		{
			path: '/wave',
			element: <WaveAnimation />,
		},
		{
			path: '/coursehub',
			children: [
				{
					path: 'register',
					element: <Register />,
				},
				{
					path: 'login',
					element: <Login />,
				},
			],
		},
		{
			path: '/vessels',
			children: [
				{
					index: true,
					element: <VesselHomePage />,
				},
			],
		},
	]
	// Remove this: basename: '/fragments'
);

function App() {
	return (
		<>
			<Toaster />
			<RouterProvider router={router} />
		</>
	);
}

export default App;
