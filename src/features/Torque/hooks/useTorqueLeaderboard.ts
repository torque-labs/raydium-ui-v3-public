import { useWallet } from '@solana/wallet-adapter-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TorqueLeaderboard, TorqueLeaderboardOffer } from '../types'
import { calculateLeaderboardTimes, fetchTorqueLeaderboard, fetchOffer as fetchOffer } from '../utils'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useTokenStore } from '@/store/useTokenStore'

// const LEADERBOARD_ID = process.env.NEXT_PUBLIC_TORQUE_LEADERBOARD_ID || 'cmaaz4o7b00006ddrm6tdii0h'
const LEADERBOARD_ID = process.env.NEXT_PUBLIC_TORQUE_LEADERBOARD_ID || 'cma9vwxte00046dd0me3f7clp'
const RECURRING_OFFER_ID = process.env.NEXT_PUBLIC_TORQUE_RECURRING_OFFER_ID || 'cmab2s5w9000t6dddd4ctnx50'

export function useTorqueLeaderboard() {
  const interval = useRef<NodeJS.Timeout | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [refetching, setRefetching] = useState<boolean>(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)
  const [leaderboard, setLeaderboard] = useState<TorqueLeaderboard>()
  const [offer, setOffer] = useState<TorqueLeaderboardOffer>()

  const tokenMap = useTokenStore((s) => s.tokenMap)
  const wallet = useWallet()

  const fetchLeaderboard = useCallback(
    async (refetching = false) => {
      if (refetching) {
        setRefetching(true)
      } else {
        setLoading(true)
      }

      try {
        const leaderboard = await fetchTorqueLeaderboard(LEADERBOARD_ID)

        const usersPositionIndex = leaderboard.entries.findIndex((entry) => entry.user === wallet?.publicKey?.toBase58())

        // Calculate the start and end time of the leaderboard
        const { startTime, endTime } = await calculateLeaderboardTimes(leaderboard.config)

        setLeaderboard({
          id: leaderboard.config.id,
          name: leaderboard.config.name,
          startTime,
          endTime,
          usersPositions:
            usersPositionIndex >= 0
              ? {
                  rank: usersPositionIndex + 1,
                  wallet: wallet?.publicKey?.toBase58() || '',
                  amount: Math.round(leaderboard.entries[usersPositionIndex]?.value / LAMPORTS_PER_SOL)
                }
              : undefined,
          leaderboard: leaderboard.entries.map((entry, index) => ({
            rank: index + 1,
            wallet: entry.user,
            amount: Math.round(entry.value / LAMPORTS_PER_SOL)
          }))
        })
      } catch (error) {
        setError(error as string)
      } finally {
        setLoading(false)
        setRefetching(false)
        setLastUpdated(new Date())
      }
    },
    [wallet?.publicKey]
  )

  const fetchRecurringOffer = useCallback(async () => {
    const offer = await fetchOffer(RECURRING_OFFER_ID)

    const distributor = offer.distributors[0]

    const rewardToken = typeof distributor.tokenAddress === 'string' ? tokenMap.get(distributor.tokenAddress) : undefined
    // The fallback is currently set to RAY just in case the token is not found as we have not been to verify the token fetch works
    const rewardDenomination = distributor.emissionType === 'SOL' ? 'SOL' : rewardToken?.symbol ?? 'RAY'

    const rewardsPerPosition =
      offer.audience?.members
        .sort((a, b) => b.predefinedAllocation - a.predefinedAllocation)
        .map((member) => member.predefinedAllocation) ?? []

    setOffer({
      id: offer.id,
      name: offer.metadata.title,
      description: offer.metadata.description,
      rewardTotal: distributor.totalFundAmount,
      rewardDenomination,
      rewardsPerPosition
    })
  }, [])

  useEffect(() => {
    fetchLeaderboard()
    fetchRecurringOffer()

    interval.current = setInterval(() => {
      fetchLeaderboard(true)
      // Refetch every 20 seconds
    }, 20000)

    return () => {
      if (interval.current) {
        clearInterval(interval.current)
      }
    }
  }, [wallet?.publicKey])

  return {
    offer,
    leaderboard,
    loading,
    error,
    lastUpdated,
    refetching
  }
}
