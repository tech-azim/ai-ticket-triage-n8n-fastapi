/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["antd", "@ant-design/icons", "@ant-design/cssinjs"],
  experimental: {
    optimizePackageImports: ["antd", "@ant-design/icons"],
  },
};

module.exports = nextConfig;
