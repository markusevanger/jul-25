import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '@/sanity/lib/api'

// Browser-safe client without token (for client components)
// Use this in 'use client' components instead of the main client
export const browserClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
})
