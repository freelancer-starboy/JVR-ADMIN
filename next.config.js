/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lets a second build/dev server run alongside another one (e.g. NEXT_DIST_DIR=.next-verify)
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  eslint: {
    // Lint with `npm run lint`; don't block production builds on lint warnings.
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  optimizeFonts: false,
  async redirects() {
    // "/" is the login page. Old template URLs keep working.
    return [
      { source: "/login", destination: "/", permanent: false },
      { source: "/ecommerce/products", destination: "/products", permanent: false },
      { source: "/ecommerce/Add-Products", destination: "/products/new", permanent: false },
      { source: "/ecommerce/productDetails/:id", destination: "/products/:id", permanent: false },
      { source: "/ecommerce/updateProduct/:id", destination: "/products/:id/edit", permanent: false },
      { source: "/ecommerce/orders-list", destination: "/orders", permanent: false },
      { source: "/ecommerce/orderDetails/:id", destination: "/orders/:id", permanent: false },
      { source: "/ecommerce/email/inbox", destination: "/enquiries", permanent: false },
      { source: "/ecommerce/email/read-email/:id", destination: "/enquiries/:id", permanent: false },
    ];
  },
};

module.exports = nextConfig;
