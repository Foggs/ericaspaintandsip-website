import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Payload CMS requires these
  experimental: {
    reactCompiler: false,
  },
};

export default withPayload(nextConfig);
