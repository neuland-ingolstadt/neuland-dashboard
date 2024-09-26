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

export default function PathBreadcrumbs() {
  const router = useRouter()

  const links = useMemo(() => {
    const pathParts = router.pathname.split('/').filter(Boolean)
    const links = pathParts.map((part, index) => {
      const href = '/' + pathParts.slice(0, index + 1).join('/')
      return {
        label: part,
        href,
      }
    })
    return links
  }, [router.pathname])

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {links.map((link, index) => (
          <Fragment key={index}>
            <BreadcrumbItem>
              <BreadcrumbLink
                href={link.href}
                className={cn('text-xs capitalize', {
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
