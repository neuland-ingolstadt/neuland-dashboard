import Link from 'next/link'

import { cn } from '@/lib/utils'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'

const links = [
  {
    label: 'Hochschulsport',
    href: '/sports',
  },
  {
    label: 'Ankündigungen',
    href: '/announcements',
  },
]

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const router = useRouter()

  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      {links.map((link, index) => (
        <Link
          key={index}
          href={link.href}
          passHref
        >
          <Button
            key={index}
            variant="link"
            className={cn(
              'px-0 text-sm font-medium text-muted-foreground transition-colors hover:text-primary',
              {
                'text-foreground': router.pathname === link.href,
              }
            )}
          >
            {link.label}
          </Button>
        </Link>
      ))}
    </nav>
  )
}
