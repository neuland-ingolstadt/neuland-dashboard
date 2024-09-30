import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/router'

const links = [
  {
    label: 'Hochschulsport',
    href: '/sports',
  },
  {
    label: 'Ankündigungen',
    href: '/announcements',
  },
  {
    label: 'Analytics',
    href: 'https://analytics.neuland.app',
    target: '_blank',
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
          target={link.target}
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
