import { useWallet } from '@solana/wallet-adapter-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TorqueLeaderboard, TorqueLeaderboardOffer, TorqueRaffle, TorqueRaffleOffer } from '../types'
import { fetchTorqueLeaderboard, fetchLeaderboardOfferDetails, displayNumber, fetchRaffleOfferDetails } from '../utils'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'

dayjs.extend(weekday)

const LEADERBOARD_ID = process.env.NEXT_PUBLIC_TORQUE_LEADERBOARD_ID || 'cmaaz4o7b00006ddrm6tdii0h'

export function useTorqueRaffle() {
  const interval = useRef<NodeJS.Timeout | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [refetching, setRefetching] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [raffle, setRaffle] = useState<TorqueRaffle>()
  const offerDetailsRef = useRef<TorqueRaffleOffer>()

  const wallet = useWallet()

  const fetchLeaderboard = useCallback(
    async (refetching = false) => {
      if (refetching) {
        setRefetching(true)
      } else {
        setLoading(true)
      }

      try {
        if (!offerDetailsRef.current) {
          const offerDetails = await fetchRaffleOfferDetails()
          offerDetailsRef.current = offerDetails
        }

        setRaffle({
          id: 'ABC',
          ...offerDetailsRef.current,
          startTime: dayjs().weekday(-7),
          endTime: dayjs().weekday(7),
          lastUpdated: dayjs(),
          days: Array.from({ length: 14 }, (_, i) => dayjs().weekday(i - 7)),
          userDetails: {
            days: [
              { day: dayjs().weekday(-6), ticketAchieved: true, dayInitial: 'M', tense: 'PAST' },
              { day: dayjs().weekday(-5), ticketAchieved: true, dayInitial: 'T', tense: 'PAST' },
              { day: dayjs().weekday(-4), ticketAchieved: true, dayInitial: 'W', tense: 'PAST' },
              { day: dayjs().weekday(-3), ticketAchieved: false, dayInitial: 'T', tense: 'PAST' },
              { day: dayjs().weekday(-2), ticketAchieved: false, dayInitial: 'F', tense: 'PRESENT' },
              { day: dayjs().weekday(-1), ticketAchieved: false, dayInitial: 'S', tense: 'FUTURE' },
              { day: dayjs().weekday(-0), ticketAchieved: false, dayInitial: 'S', tense: 'FUTURE' }
            ],
            currentDayTotal: 2.34,
            totalTickets: 3
          }
        })
      } catch (error) {
        setError(error as string)
      } finally {
        setLoading(false)
        setRefetching(false)
      }
    },
    [wallet?.publicKey]
  )

  useEffect(() => {
    fetchLeaderboard()

    interval.current = setInterval(() => {
      fetchLeaderboard(true)
      // Refetch every 1 minute
    }, 1 * 60 * 1000)

    return () => {
      if (interval.current) {
        clearInterval(interval.current)
      }
    }
  }, [wallet?.publicKey])

  return {
    raffle,
    loading,
    error,
    refetching
  }
}
