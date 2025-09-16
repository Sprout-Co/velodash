/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['./src/styles'],
  },
  images: {
    domains: ['firebasestorage.googleapis.com', 'res.cloudinary.com'],
  },
}

module.exports = nextConfig
