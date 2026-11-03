/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rutas antiguas que se conservan para no romper enlaces guardados
  async redirects() {
    return [{ source: '/dashboard/admin/nuevo-item', destination: '/dashboard/admin/inventario/nuevo', permanent: true }];
  },
};

export default nextConfig;
