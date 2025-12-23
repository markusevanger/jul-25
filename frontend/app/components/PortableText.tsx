/**
 * This component uses Portable Text to render content.
 *
 * You can learn more about Portable Text on:
 * https://www.sanity.io/docs/block-content
 * https://github.com/portabletext/react-portabletext
 * https://portabletext.org/
 *
 */

import {PortableText, type PortableTextComponents, type PortableTextBlock} from 'next-sanity'
import Link from 'next/link'

export default function CustomPortableText({
  className,
  value,
}: {
  className?: string
  value: PortableTextBlock[]
}) {
  const components: PortableTextComponents = {
    marks: {
      link: ({children, value: link}) => {
        if (!link?.href) return <>{children}</>
        return (
          <Link
            href={link.href}
            target={link.openInNewTab ? '_blank' : undefined}
            rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
          >
            {children}
          </Link>
        )
      },
    },
  }

  return (
    <div className={['prose prose-a:text-brand', className].filter(Boolean).join(' ')}>
      <PortableText components={components} value={value} />
    </div>
  )
}
