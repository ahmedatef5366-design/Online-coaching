/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // CMS rows let admins paste arbitrary image URLs (transformation photos,
    // hero backgrounds). Allow any HTTPS host through next/image; storage
    // domains will be restricted as we add Phase 5 upload UI.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
