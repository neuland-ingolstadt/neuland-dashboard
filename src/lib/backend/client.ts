import { parseSportEvents } from '@/lib/backend/sportEvents'
import { gql, GraphQLClient } from 'graphql-request'

const endpoint =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://api.neuland.app/graphql'

console.log('endpoint', endpoint)
export const graphqlClient = new GraphQLClient(endpoint)

export async function getSportEvents() {
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

  const data: {
    universitySports: unknown
    error: unknown
  } = await graphqlClient.request(query)

  if (!data.universitySports) {
    throw new Error('No data returned from API')
  }

  return parseSportEvents(data.universitySports)
}
