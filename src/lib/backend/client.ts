import { NewSportsEvent, SportsEvent } from '@/lib/backend/sportEvents'
import { gql, GraphQLClient } from 'graphql-request'

const endpoint =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://api.neuland.app/graphql'

export const graphqlClient = new GraphQLClient(endpoint)

interface SportsEventData {
  universitySports: SportsEvent[]
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

export async function createSportsEvent(event: NewSportsEvent) {
  const mutation = gql`
    mutation UpsertUniversitySport($event: UniversitySportsInput!) {
      upsertUniversitySport(input: $event) {
        id
      }
    }
  `.replace(/\s+/g, ' ')

  await graphqlClient.request(mutation, { event })
}

export async function updateSportsEvent(event: NewSportsEvent, id: string) {
  const mutation = gql`
    mutation UpsertUniversitySport($event: UniversitySportsInput!, $id: ID!) {
      upsertUniversitySport(input: $event, id: $id) {
        id
      }
    }
  `.replace(/\s+/g, ' ')

  await graphqlClient.request(mutation, { event, id })
}

export async function deleteSportsEvent(id: string) {
  const mutation = gql`
    mutation DeleteUniversitySport($id: ID!) {
      deleteUniversitySport(id: $id)
    }
  `.replace(/\s+/g, ' ')

  await graphqlClient.request(mutation, { id })
}
