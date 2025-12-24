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

// Browser client without CDN - use for fetches that need fresh asset URLs
// Bypasses CDN cache to ensure assets (video, audio files) have resolved URLs
export const browserClientNoCdn = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'published',
})
