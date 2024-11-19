import { Announcement, NewAnnouncement } from '@/lib/backend/announcements'
import { NewSportsEvent, SportsEvent } from '@/lib/backend/sportEvents'
import { gql, GraphQLClient } from 'graphql-request'

const endpoint =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://api.dev.neuland.app/graphql'

export const graphqlClient = new GraphQLClient(endpoint)

interface SportsEventData {
  universitySports: SportsEvent[]
  error?: unknown
}

interface AnnouncementsData {
  appAnnouncements: Announcement[]
  error?: unknown
}

export async function getSportsEvents() {
  const query = gql`
    query {
      universitySports {
        id
        title {
          de
          en
        }
        description {
          de
          en
        }
        campus
        location
        weekday
        startTime
        endTime
        requiresRegistration
        invitationLink
        eMail
        sportsCategory
        createdAt
        updatedAt
      }
    }
  `.replace(/\s+/g, ' ')

  const data = await graphqlClient.request<SportsEventData>(query)

  if (!data.universitySports) {
    throw new Error('No data returned from API')
  }

  return data.universitySports
}

export async function createSportsEvent(
  event: NewSportsEvent,
  accessToken: string
) {
  const mutation = gql`
    mutation UpsertUniversitySport($event: UniversitySportsInput!) {
      upsertUniversitySport(input: $event) {
        id
      }
    }
  `.replace(/\s+/g, ' ')

  await graphqlClient.request(
    mutation,
    { event },
    { Authorization: `Bearer ${accessToken}` }
  )
}

export async function updateSportsEvent(
  event: NewSportsEvent,
  id: string,
  accessToken: string
) {
  const mutation = gql`
    mutation UpsertUniversitySport($event: UniversitySportsInput!, $id: ID!) {
      upsertUniversitySport(input: $event, id: $id) {
        id
      }
    }
  `.replace(/\s+/g, ' ')

  await graphqlClient.request(
    mutation,
    { event, id },
    { Authorization: `Bearer ${accessToken}` }
  )
}

export async function deleteSportsEvent(id: string, accessToken: string) {
  const mutation = gql`
    mutation DeleteUniversitySport($id: ID!) {
      deleteUniversitySport(id: $id)
    }
  `.replace(/\s+/g, ' ')

  await graphqlClient.request(
    mutation,
    { id },
    { Authorization: `Bearer ${accessToken}` }
  )
}

export async function getAnnouncements() {
  const query = gql`
    query {
      appAnnouncements {
        id
        title {
          de
          en
        }
        description {
          de
          en
        }
        startDateTime
        endDateTime
        priority
        url
        createdAt
        updatedAt
        platform
        userKind
      }
    }
  `.replace(/\s+/g, ' ')

  const data = await graphqlClient.request<AnnouncementsData>(query)

  if (!data.appAnnouncements) {
    throw new Error('No data returned from API')
  }

  return data.appAnnouncements
}

export async function createAnnouncement(
  announcement: NewAnnouncement,
  accessToken: string
) {
  const mutation = gql`
    mutation UpsertAppAnnouncement($announcement: AnnouncementInput!) {
      upsertAppAnnouncement(input: $announcement) {
        id
      }
    }
  `.replace(/\s+/g, ' ')

  await graphqlClient.request(
    mutation,
    { announcement },
    { Authorization: `Bearer ${accessToken}` }
  )
}

export async function updateAnnouncement(
  announcement: NewAnnouncement,
  id: string,
  accessToken: string
) {
  const mutation = gql`
    mutation UpsertAppAnnouncement(
      $announcement: AnnouncementInput!
      $id: ID!
    ) {
      upsertAppAnnouncement(input: $announcement, id: $id) {
        id
      }
    }
  `.replace(/\s+/g, ' ')

  await graphqlClient.request(
    mutation,
    { announcement, id },
    { Authorization: `Bearer ${accessToken}` }
  )
}

export async function deleteAnnouncement(id: string, accessToken: string) {
  const mutation = gql`
    mutation deleteAppAnnouncement($id: ID!) {
      deleteAppAnnouncement(id: $id)
    }
  `.replace(/\s+/g, ' ')

  await graphqlClient.request(
    mutation,
    { id },
    { Authorization: `Bearer ${accessToken}` }
  )
}
