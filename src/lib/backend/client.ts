import type { Announcement, NewAnnouncement } from '@/lib/backend/announcements'
import type { AuditLogEntry } from '@/lib/backend/auditLog'
import type { NeulandEvent, NewNeulandEvent } from '@/lib/backend/neulandEvents'
import type { RoomReport } from '@/lib/backend/rootReports'
import type { NewSportsEvent, SportsEvent } from '@/lib/backend/sportEvents'
import { GraphQLClient, gql } from 'graphql-request'

const endpoint = process.env.GRAPHQL_URL || 'https://api.neuland.app/graphql'
const devEndpoint = process.env.DEV_GRAPHQL_URL || endpoint

export const prodGraphqlClient = new GraphQLClient(endpoint)
export const devGraphqlClient = new GraphQLClient(devEndpoint)

const graphqlClient = {
  sports: prodGraphqlClient,
  neulandEvents: devGraphqlClient,
  roomReports: prodGraphqlClient,
  appAnnouncements: prodGraphqlClient,
  auditLog: prodGraphqlClient,
}

interface SportsEventData {
  universitySports: SportsEvent[]
  error?: unknown
}

interface AnnouncementsData {
  appAnnouncements: Announcement[]
  error?: unknown
}

interface RoomReportsData {
  roomReports: RoomReport[]
  error?: unknown
}

interface NeulandEventsData {
  neulandEvents: NeulandEvent[]
  error?: unknown
}

interface AuditLogData {
  auditLog: AuditLogEntry[]
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

  const data = await graphqlClient.sports.request<SportsEventData>(query)

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

  await graphqlClient.sports.request(
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

  await graphqlClient.sports.request(
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

  await graphqlClient.sports.request(
    mutation,
    { id },
    { Authorization: `Bearer ${accessToken}` }
  )
}

export async function getRoomReports(accessToken: string) {
  const query = gql`
    query {
      roomReports {
        id
        createdAt
        description
        reason
        resolvedAt
        room
      }
    }
  `.replace(/\s+/g, ' ')

  const data = await graphqlClient.roomReports.request<RoomReportsData>(
    query,
    undefined,
    {
      Authorization: `Bearer ${accessToken}`,
    }
  )

  if (!data.roomReports) {
    throw new Error('No data returned from API')
  }

  return data.roomReports
}

export async function resolveRoomReport(id: string, accessToken: string) {
  const mutation = gql`
    mutation deleteAppAnnouncement($id: ID!) {
      resolveRoomReport(id: $id, resolved: true) {
        id
      }
    }
  `.replace(/\s+/g, ' ')

  await graphqlClient.roomReports.request(
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
        imageUrl
      }
    }
  `.replace(/\s+/g, ' ')

  const data =
    await graphqlClient.appAnnouncements.request<AnnouncementsData>(query)

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

  await graphqlClient.appAnnouncements.request(
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

  await graphqlClient.appAnnouncements.request(
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

  await graphqlClient.appAnnouncements.request(
    mutation,
    { id },
    { Authorization: `Bearer ${accessToken}` }
  )
}

export async function getNeulandEvents(): Promise<NeulandEvent[]> {
  const query = gql`
    query NeulandEvents {
			neulandEvents {
				id
				title {
					de
					en
				}
				description {
					de
					en
				}
				location
				createdAt
				updatedAt
				startTime
				endTime
				rrule
			}
		}
  `.replace(/\s+/g, ' ')

  const data =
    await graphqlClient.neulandEvents.request<NeulandEventsData>(query)

  if (!data.neulandEvents) {
    throw new Error('No data returned from API')
  }

  return data.neulandEvents
}

export async function createNeulandEvent(
  event: NewNeulandEvent,
  accessToken: string
) {
  const mutation = gql`
		mutation UpsertNeulandEvent($event: NeulandEventInput!) {
			upsertNeulandEvent(input: $event) {
				id
			}
		}
	`.replace(/\s+/g, ' ')

  await graphqlClient.neulandEvents.request(
    mutation,
    { event },
    { Authorization: `Bearer ${accessToken}` }
  )
}

export async function updateNeulandEvent(
  event: NewNeulandEvent,
  id: string,
  accessToken: string
) {
  const mutation = gql`
		mutation UpsertNeulandEvent($event: NeulandEventInput!, $id: ID!) {
			upsertNeulandEvent(input: $event, id: $id) {
				id
			}
		}
	`.replace(/\s+/g, ' ')
  await graphqlClient.neulandEvents.request(
    mutation,
    { event, id },
    { Authorization: `Bearer ${accessToken}` }
  )
}
export async function deleteNeulandEvent(id: string, accessToken: string) {
  const mutation = gql`
                mutation DeleteNeulandEvent($id: ID!) {
                        deleteNeulandEvent(id: $id)
                }
        `.replace(/\s+/g, ' ')

  await graphqlClient.neulandEvents.request(
    mutation,
    { id },
    { Authorization: `Bearer ${accessToken}` }
  )
}

export async function getAuditLog(
  accessToken: string,
  limit?: number,
  offset?: number
) {
  const query = gql`
    query AuditLog($limit: Int, $offset: Int) {
      auditLog(limit: $limit, offset: $offset) {
        id
        entity
        entityId
        operation
        name
        userId
        createdAt
      }
    }
  `.replace(/\s+/g, ' ')

  const data = await graphqlClient.auditLog.request<AuditLogData>(
    query,
    { limit, offset },
    { Authorization: `Bearer ${accessToken}` }
  )

  if (!data.auditLog) {
    throw new Error('No data returned from API')
  }

  return data.auditLog
}
