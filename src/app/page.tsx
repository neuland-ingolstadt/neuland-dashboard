'use client'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import NavBar from '@/components/ui/navBar'
import PathBreadcrumbs from '@/components/ui/pathBreadcrumbs'
import type { Group } from '@/lib/backend/groups'
import { useUserGroups } from '@/lib/hooks/groups'
import {
  ActivitySquare,
  Calendar,
  ExternalLink,
  History,
  Home as HomeIcon,
  LineChart,
  type LucideIcon,
  Megaphone,
} from 'lucide-react'
import Head from 'next/head'
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

interface Section {
  title: string
  cards: IndexCard[]
}

const indexCards: Section[] = [
  {
    title: 'Neuland Next',
    cards: [
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
        title: 'Raummeldungen',
        description: 'Meldungen für falsch eingetragene Rauminfos.',
        href: '/roomreports',
        icon: HomeIcon,
        groups: ['admin'],
      },
      {
        title: 'Audit Log',
        description: 'Protokoll aller Änderungen.',
        href: '/auditlog',
        icon: History,
        groups: ['admin'],
      },
    ],
  },
  {
    title: 'Links',
    cards: [
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
    ],
  },
]

export default function Home() {
  const { userGroups } = useUserGroups()
  const userSections = useMemo(
    () =>
      indexCards
        .map((section) => ({
          ...section,
          cards: section.cards.filter((card) =>
            card.groups.some((group) => userGroups.includes(group))
          ),
        }))
        .filter((section) => section.cards.length > 0),
    [userGroups]
  )

  return (
    <div>
      <Head>
        <title>Neuland Dashboard</title>
      </Head>

      <NavBar />
      <div className="container my-4 flex flex-col gap-3">
        <PathBreadcrumbs />
      </div>

      <div className="container my-4 flex flex-col gap-6">
        {userSections.map((section) => (
          <div key={section.title} className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">{section.title}</h2>
            <div className="grid grid-cols-2 gap-3 auto-rows-fr">
              {section.cards.map((card) => (
                <Link
                  key={card.title}
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
        ))}
      </div>
    </div>
  )
}
