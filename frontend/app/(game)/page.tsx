'use client'

import Snowfall from 'react-snowfall'
import Button from '@/app/components/Button'
import AnimatedHeroText from '@/app/components/AnimatedHeroText'
import { PlusIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <Snowfall
        color="#ffffff"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />
      <div className="relative z-10 text-center">
        <AnimatedHeroText />


        <div className="flex flex-col gap-4">
          <Button href="/join" variant="primary">
            Bli med i spill <ArrowRightIcon className="h-4 w-4" />
          </Button>
          <Button href="/create" variant="ghost">
            Lag nytt spill <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

    </div>
  )
}
