const nextConfig = {
    reactStrictMode: true,
    compiler: {
        styledComponents: true
    },
    output: 'export',
    trailingSlash: true,
    distDir: 'dist',
    images: {
        unoptimized: true,
    },
    transpilePackages: [ "antd", "@ant-design", "rc-util", "rc-pagination", "rc-picker", "rc-notification", "rc-tooltip", "rc-tree", "rc-table" ],

}

module.exports = nextConfig
