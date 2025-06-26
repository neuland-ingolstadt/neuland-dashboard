import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu'
import { useUserGroups } from '@/lib/hooks/groups'
import { cn } from '@/lib/utils'
import { ExternalLink, Menu } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { type NavLink, links } from './mainNav'

export function MobileNav({ className }: React.HTMLAttributes<HTMLElement>) {
  const router = useRouter()
  const { userGroups } = useUserGroups()

  const userLinks = useMemo(() => {
    return links.filter((link: NavLink) => {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('sm:hidden', className)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menü öffnen</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40" forceMount>
        {userLinks.map((link) => (
          <DropdownMenuItem asChild key={link.label}>
            <Link
              href={link.href}
              target={link.target}
              className="flex w-full items-center"
            >
              <span
                className={cn('flex-1', {
                  'font-medium text-foreground': basePath === link.href,
                })}
              >
                {link.label}
              </span>
              {link.external && <ExternalLink size={12} className="ml-1" />}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MobileNav
