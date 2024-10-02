import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import NavBar from '@/components/ui/navBar'
import PathBreadcrumbs from '@/components/ui/pathBreadcrumbs'
import { Group } from '@/lib/backend/groups'
import { useUserGroups } from '@/lib/hooks/gorupsHook'
import {
  ActivitySquare,
  Calendar,
  ExternalLink,
  LineChart,
  LucideIcon,
  Megaphone,
} from 'lucide-react'
import Link from 'next/link'
import React, { useMemo } from 'react'

interface IndexCard {
  title: string
  description: string
  href: string
  icon: LucideIcon
  external?: boolean
  groups: [Group, ...Group[]]
}

const indexCards: IndexCard[] = [
  {
    title: 'Hochschulsport',
    description:
      'Hochschulsportangebote und -kurse, des Veranstaltungsmanagement.',
    href: '/sports',
    icon: Calendar,
    groups: ['sports'],
  },
  {
    title: 'Ankündigungen',
    description: 'In-App Ankündigungen und Neuigkeiten.',
    href: '/announcements',
    icon: Megaphone,
    groups: ['announcements'],
  },
  {
    title: 'Analytics',
    description: 'Analytics und Statistiken der Neuland Next App.',
    href: 'https://analytics.neuland.app',
    icon: LineChart,
    external: true,
    groups: ['admin'],
  },
  {
    title: 'Status Seite',
    description: 'Statusseite aller Neuland Next Services.',
    href: 'https://status.neuland.app/dashboard',
    icon: ActivitySquare,
    external: true,
    groups: ['admin'],
  },
]

export default function Home() {
  const { userGroups } = useUserGroups()
  const userCards = useMemo(
    () =>
      indexCards.filter(
        (card) =>
          !card.groups ||
          card.groups.some((group) => userGroups.includes(group))
      ),
    [userGroups]
  )

  return (
    <div>
      <NavBar />
      <div className="container my-4 flex flex-col gap-3">
        <PathBreadcrumbs />
      </div>

      <div className="container my-4 grid grid-cols-3 gap-3 auto-rows-fr">
        {userCards.map((card, idx) => (
          <Link
            key={idx}
            href={card.href}
            passHref
            target={card.external ? '_blank' : undefined}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(card.icon, {
                    className: 'h-6 w-6',
                  })}
                  <span className="flex-1">{card.title}</span>
                  {card.external && (
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  )}
                </CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
