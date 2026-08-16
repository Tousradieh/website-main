import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { projects } from '@/lib/data';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes = [
    '',
    '/about',
    '/projects',
    '/materials',
    '/certificates',
    '/careers',
    '/contact',
  ].map((path) => ({
    url: `${SITE_URL}${path || '/'}`,
    lastModified,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.8,
  })) satisfies MetadataRoute.Sitemap;

  const projectRoutes = projects.map((project) => ({
    url: `${SITE_URL}/projects/${project.id}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...routes, ...projectRoutes];
}
