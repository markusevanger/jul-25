import {PortableText} from '@portabletext/react'

import {settingsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'

export default async function Page() {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  return (
    <div className="container mx-auto max-w-4xl px-4 py-20">
      <div className="prose prose-lg max-w-none">
        {settings?.description && <PortableText value={settings.description} />}
      </div>
    </div>
  )
}
