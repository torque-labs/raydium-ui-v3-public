import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { TorqueLeaderboard } from '../types'
import { fetchTorqueLeaderboard } from '../utils'

export function useTorqueLeaderboard() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [leaderboard, setLeaderboard] = useState<TorqueLeaderboard>()

  const wallet = useWallet()

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const leaderboard = await fetchTorqueLeaderboard(wallet?.publicKey?.toBase58() || '')
      setLeaderboard(leaderboard)
    } catch (error) {
      setError(error as string)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [wallet])

  return {
    leaderboard,
    loading,
    error
  }
}
