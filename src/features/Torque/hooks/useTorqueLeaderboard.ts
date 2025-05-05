import { useWallet } from '@solana/wallet-adapter-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TorqueLeaderboard } from '../types'
import { fetchTorqueLeaderboard } from '../utils'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

const LEADERBOARD_ID = process.env.NEXT_PUBLIC_TORQUE_LEADERBOARD_ID || 'cma9vwxte00046dd0me3f7clp'
const RECURRING_OFFER_ID = process.env.NEXT_PUBLIC_TORQUE_RECURRING_OFFER_ID || 'cm9w3m8xr01trju1f3lbsy3jn'

export function useTorqueLeaderboard() {
  const interval = useRef<NodeJS.Timeout | null>(null)
  const [loading, setLoading] = useState(false)
  const [refetching, setRefetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [leaderboard, setLeaderboard] = useState<TorqueLeaderboard>()

  const wallet = useWallet()

  const fetchLeaderboard = useCallback(async () => {
    if (leaderboard?.id) {
      setRefetching(true)
    } else {
      setLoading(true)
    }

    try {
      const leaderboard = await fetchTorqueLeaderboard(LEADERBOARD_ID)

      const usersPositionIndex = leaderboard.entries.findIndex((entry) => entry.user === wallet?.publicKey?.toBase58())

      setLeaderboard({
        id: leaderboard.config.id,
        name: leaderboard.config.name,
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
    }
  }, [wallet?.publicKey, leaderboard])

  useEffect(() => {
    fetchLeaderboard()

    interval.current = setInterval(() => {
      fetchLeaderboard()
      // Refetch every 20 seconds
    }, 20000)

    return () => {
      if (interval.current) {
        clearInterval(interval.current)
      }
    }
  }, [wallet?.publicKey])

  return {
    leaderboard,
    loading,
    error,
    refetching
  }
}
