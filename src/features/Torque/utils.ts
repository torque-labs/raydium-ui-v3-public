import { TorqueConversion, TorqueLeaderboard, TorqueOffer, TorqueRawOffer } from './types'

/**
 * Torque API URL
 */
// const TORQUE_API_URL = process.env.NEXT_PUBLIC_TORQUE_API_URL || 'https://server.torque.so'
const TORQUE_API_URL = 'http://localhost:3001'
/**
 * Torque API routes
 */
const TORQUE_API_ROUTES = {
  offers: (wallet: string) => `/offer/wallet/${wallet}` as const,
  conversions: (wallet: string) => `/conversions/wallet/${wallet}` as const,
  claim: (offerId: string) => `/claim/${offerId}` as const
}

/**
 * Generic fetch utility for Torque API endpoints
 *
 * @param endpoint - The API endpoint path
 * @param params - Path parameters to include in the URL
 * @param queryParams - Query parameters to include in the URL
 *
 * @returns Promise with the response data
 */
async function fetchTorqueData<T>(endpoint: string, queryParams: Record<string, string> = {}): Promise<T> {
  // Construct the URL
  const url = new URL(endpoint, TORQUE_API_URL)

  // Add query parameters
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, value)
    }
  })

  // Make the fetch request
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // Check if the request was successful
  if (!response.ok) {
    const errorData = await response.json()

    throw new Error(`API request failed: ${errorData.message || response.statusText}`)
  }

  // Parse and return the response data
  const result = await response.json()

  if (result.status === 'SUCCESS') {
    return result.data
  }

  throw new Error(`Failed to fetch offers: ${result.message}`)
}

/**
 * Fetches offers by wallet address
 *
 * @param wallet - The wallet address to fetch offers for
 * @param projectId - Optional project ID to filter offers
 *
 * @returns Promise with the array of offers
 */
export async function fetchOffersByWallet(wallet: string, projectId?: string) {
  return fetchTorqueData<TorqueRawOffer[]>(TORQUE_API_ROUTES.offers(wallet), projectId ? { projectId } : {})
}
/**
 * Fetches conversions by wallet address
 *
 * @param wallet - The wallet address to fetch conversions for
 * @param projectId - Optional project ID to filter conversions
 * @returns Promise with the array of conversions
 */
export async function fetchConversionsByWallet(wallet: string, projectId?: string) {
  return fetchTorqueData<TorqueConversion[]>(TORQUE_API_ROUTES.conversions(wallet), projectId ? { projectId } : {})
}

/**
 * Claims an offer
 *
 * @param offerId - The offer ID to claim
 * @param wallet - The wallet address to claim the offer for
 *
 */
export async function claimOffer(offerId: string, wallet: string) {
  return fetchTorqueData<{ status: string }>(TORQUE_API_ROUTES.claim(offerId), { wallet })
}

/**
 * Sets the status based on the hierarchy of offer statuses
 *
 * @param newStatus - The new status to set
 * @param oldStatus - The old status to compare against
 *
 **/
export function setStatusBasedOnHierarchy(newStatus: TorqueOffer['status'], oldStatus: TorqueOffer['status']) {
  // Active offers should take precedence over any other status
  if (newStatus === 'ACTIVE' || oldStatus === 'ACTIVE') {
    return 'ACTIVE'
  }

  // Claimed offers should take precedence over Pending
  if (newStatus === 'CLAIMED' || (newStatus === 'PENDING' && oldStatus !== 'CLAIMED')) {
    return newStatus
  }

  return oldStatus
}

/**
 * Fetches the leaderboard for a given wallet
 *
 * @param wallet - The wallet address to fetch the leaderboard for
 *
 * @returns Promise with the leaderboard data
 */
export async function fetchTorqueLeaderboard(wallet: string): Promise<TorqueLeaderboard> {
  // TODO: Need to implement this
  return {
    id: 'cmLg8FRniiZfP8DkY2WxAw38',
    name: 'Raydium Launchpad Rewards',
    description: 'Top 15 participants in Raydium Launchpad rewards program',
    usersPositions: wallet
      ? {
          rank: 5,
          wallet,
          amount: 1109
        }
      : undefined,
    leaderboard: [
      {
        rank: 1,
        wallet: 'C3ppxLp4tHGjV5xBfzR3FT9rsmaooYrdESLoTLiAj3uK',
        amount: 120394
      },
      {
        rank: 2,
        wallet: 'DiH7xAgDMpDuwv5RrrX3ohLg8FRniiZfP8DkY2WxAw38',
        amount: 5039
      },
      {
        rank: 3,
        wallet: 'Bmo9fCMZqZKBVtSEbjM7tGXPzBa6reCEswEAQwjK2stV',
        amount: 3049
      },
      {
        rank: 4,
        wallet: 'D2tD7gMNPvnVbNwMKXcZgFS9nbA32Va7z1wYEBP9sMZz',
        amount: 1293
      },
      {
        rank: 5,
        wallet: wallet ?? '4lppxLp4tHGjV5xBfzR3FT9kfmaooYrdESLoTLiAj5ld',
        amount: 1109
      },
      {
        rank: 6,
        wallet: 'EfCX4hxwohbPmS5vwYrDf92Z6jTVyRNQ7DYgfNJDgM2S',
        amount: 948
      },
      {
        rank: 7,
        wallet: 'DbLfDdhYYHXbvZ9EH5KzhB5BzzgK6Bnz1E7L68dnfkY1',
        amount: 893
      },
      {
        rank: 8,
        wallet: '9gvC8ZhCP9dTMy1q4ZC7qe2WcJtbdazJ7Zn9G6drYHJX',
        amount: 888
      },
      {
        rank: 9,
        wallet: '2UdwupHuZUetYRhVfd1aTmZ5UTwrqiPF8cPfBomjq5ZN',
        amount: 878
      },
      {
        rank: 10,
        wallet: 'C8dgmamVYBU1prADfoQYNRS19R55towaZXoV5sqWDMUP',
        amount: 877
      },
      {
        rank: 11,
        wallet: '9GTPq8qc8f8npyCcFvqRiD5a1tHCqDnjvM6rpvbU74LX',
        amount: 876
      },
      {
        rank: 12,
        wallet: '2UdwupHuZUetYRhVfd1aTmZ5UTwrqiPF8cPfBomjq5ZN',
        amount: 875
      },
      {
        rank: 13,
        wallet: 'C8dgmamVYBU1prADfoQYNRS19R55towaZXoV5sqWDMUP',
        amount: 874
      },
      {
        rank: 14,
        wallet: '9GTPq8qc8f8npyCcFvqRiD5a1tHCqDnjvM6rpvbU74LX',
        amount: 873
      },
      {
        rank: 15,
        wallet: '2UdwupHuZUetYRhVfd1aTmZ5UTwrqiPF8cPfBomjq5ZN',
        amount: 872
      }
    ]
  }
}
