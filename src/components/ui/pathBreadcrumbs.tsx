import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/router'
import { Fragment, useMemo } from 'react'

const pathnames: Record<string, string> = {
  '/': 'Dashboard',
  '/sports': 'Hochschulsport',
  '/sports/new': 'Neue Veranstaltung',
  '/sports/edit': 'Veranstaltung bearbeiten',
  '/announcements': 'Ankündigungen',
  '/announcements/new': 'Neue Ankündigung',
  '/announcements/edit': 'Ankündigung bearbeiten',
}

export default function PathBreadcrumbs() {
  const router = useRouter()

  const links = useMemo(() => {
    const pathname = router.pathname
    const parts = pathname.split('/').filter(Boolean)

    return [
      {
        href: '/',
        label: 'Dashboard',
      },
      ...parts.map((_, index) => {
        const href = `/${parts.slice(0, index + 1).join('/')}`
        return {
          href,
          label: pathnames[href] || 'Unknown',
        }
      }),
    ]
  }, [router.pathname])

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {links.map((link, index) => (
          <Fragment key={index}>
            <BreadcrumbItem>
              <BreadcrumbLink
                href={link.href}
                className={cn('text-xs', {
                  'font-bold': index === links.length - 1,
                })}
              >
                {link.label}
              </BreadcrumbLink>
            </BreadcrumbItem>

            {index < links.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
