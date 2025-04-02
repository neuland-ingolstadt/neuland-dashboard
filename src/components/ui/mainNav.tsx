import { Button } from '@/components/ui/button'
import type { Group } from '@/lib/backend/groups'
import { useUserGroups } from '@/lib/hooks/groups'
import { cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

interface NavLink {
  label: string
  href: string
  target?: string
  external?: boolean
  groups?: Group[]
}

const links: NavLink[] = [
  {
    label: 'Hochschulsport',
    href: '/sports',
    groups: ['sports'],
  },
  {
    label: 'Ankündigungen',
    href: '/announcements',
    groups: ['announcements'],
  },
  {
    label: 'Raummeldungen',
    href: '/roomreports',
    groups: ['admin'],
  },
  {
    label: 'Neuland Events',
    href: '/events',
    groups: ['events'],
  },
]

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const router = useRouter()
  const { userGroups } = useUserGroups()

  const userLinks = useMemo(() => {
    return links.filter((link) => {
      if (!link.groups) return true
      return (
        link.groups.some((group) => userGroups.includes(group)) ||
        userGroups.includes('admin')
      )
    })
  }, [userGroups])

  const basePath = useMemo(
    () => `/${router.pathname.split('/')[1]}`,
    [router.pathname]
  )

  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      {userLinks.map((link) => (
        <Link key={link.label} href={link.href} target={link.target} passHref>
          <Button
            variant="link"
            className={cn(
              'px-0 text-sm font-medium text-muted-foreground transition-colors hover:text-primary',
              {
                'text-foreground': basePath === link.href,
              }
            )}
          >
            <span>{link.label}</span>
            {link.external && <ExternalLink size={12} className="ml-1" />}
          </Button>
        </Link>
      ))}
    </nav>
  )
}
