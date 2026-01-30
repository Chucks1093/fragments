import FileUploader from '@/components/vessel/FileUploader';
import { motion, type Variants } from 'framer-motion';
import { useState } from 'react';

function VesselHomePage() {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	const images = [
		{
			id: 1,
			url: '/images/vessel-1.jpeg',
			alt: 'Upload preview 1',
		},
		{
			id: 2,
			url: '/images/vessel-2.jpeg',
			alt: 'Upload preview 2',
		},
		{
			id: 3,
			url: '/images/vessel-3.jpeg',
			alt: 'Upload preview 3',
		},
	];

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.15,
				delayChildren: 0.2,
			},
		},
	};

	const imageVariants: Variants = {
		hidden: {
			opacity: 0,
			y: 60,
			rotate: -5,
		},
		visible: {
			opacity: 1,
			y: 0,
			rotate: 0,
			transition: {
				duration: 0.6,
				ease: [0.22, 1, 0.36, 1],
			},
		},
	};

	return (
		<section className="min-h-screen relative bg-white flex items-center justify-center px-6 py-20">
			<div className="noise absolute inset-0 w-full h-full" />
			<div className="max-w-2xl w-full z-20">
				{/* Image Stack */}
				<motion.div
					className="relative h-80 mb-12 flex items-center justify-center"
					variants={containerVariants}
					initial="hidden"
					animate="visible"
				>
					{images.map((img, index) => {
						const rotations = [-12, 2, 10];
						const offsets = [
							{ x: -40, y: 10 },
							{ x: 0, y: -5 },
							{ x: 40, y: 8 },
						];

						return (
							<motion.div
								key={img.id}
								variants={imageVariants}
								className="absolute"
								style={{
									zIndex:
										hoveredIndex === index
											? 10
											: 3 - Math.abs(index - 1),
									x: offsets[index].x,
									y: offsets[index].y,
								}}
								onHoverStart={() => setHoveredIndex(index)}
								onHoverEnd={() => setHoveredIndex(null)}
								whileHover={{
									y: offsets[index].y - 25,
									x: offsets[index].x,
									rotate: 0,
									scale: 1.08,
									transition: {
										duration: 0.3,
										ease: [0.22, 1, 0.36, 1],
									},
								}}
							>
								<motion.div
									initial={{ rotate: rotations[index] }}
									animate={{
										rotate:
											hoveredIndex === index ? 0 : rotations[index],
									}}
									className="bg-white rounded-2xl shadow-xl overflow-hidden border-[10px] border-white"
									style={{
										width: '260px',
										height: '260px',
									}}
								>
									<img
										src={img.url}
										alt={img.alt}
										className="w-full h-full object-cover"
									/>
								</motion.div>
							</motion.div>
						);
					})}
				</motion.div>

				{/* Text Content */}
				<motion.div
					className="text-center"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.8, duration: 0.6 }}
				>
					<motion.div
						className="inline-block px-4 py-1.5 bg-gray-100 rounded-full mb-4"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.9 }}
					>
						<span className="text-xs font-medium text-gray-600 tracking-wide">
							VSL-IMG-001
						</span>
					</motion.div>

					<h1 className="text-3xl font-semibold text-gray-900 mb-3">
						Built for clean, reliable uploads
					</h1>

					<p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
						Upload up to 3 images with clear feedback at every step. No
						confusion, no bloat.
					</p>

					<FileUploader />
				</motion.div>
			</div>
		</section>
	);
}

export default VesselHomePage;
