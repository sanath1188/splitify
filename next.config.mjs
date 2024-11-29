/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	async redirects() {
		return [
			{
				source: "/",
				destination: "/dashboard",
				permanent: true,
			},
		];
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	experimental: {
		// set Argon as an external dependency to prevent it from getting bundled
		serverComponentsExternalPackages: ["@node-rs/argon2"],
	},
	images: {
		domains: ["mosaic.scdn.co", ""],
	},
};

export default nextConfig;
