import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FJ Store',
    short_name: 'FJ Store',
    description: 'Exclusive cosmetics, delicacies, and luxury jewelry',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0b0c',
    theme_color: '#d4af37',
    icons: [
      {
        src: '/logo-of-OS.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
