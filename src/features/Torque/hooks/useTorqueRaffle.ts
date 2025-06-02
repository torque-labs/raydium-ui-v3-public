import { useWallet } from '@solana/wallet-adapter-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TorqueRaffle, TorqueRaffleOffer, TorqueUserRaffleDay } from '../types'
import { fetchRaffleOfferDetails, fetchRaffleUserVolume } from '../utils'
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'

dayjs.extend(weekday)

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

        // Using empty wallet is none is there to then be able to populate the details in the UI
        const userVolume = await fetchRaffleUserVolume(wallet.publicKey?.toBase58() ?? '11111111111111111111111111111111')

        const todayUtc = dayjs().utc().startOf('day')

        const { days, startTime, endTime } = userVolume.volumes.reduce(
          (acc, volume) => {
            const day = dayjs(volume.day)
            if (day.isBefore(acc.startTime)) {
              acc.startTime = day
            }
            if (day.isAfter(acc.endTime)) {
              acc.endTime = day
            }
            return acc
          },
          { days: [], startTime: dayjs(), endTime: dayjs() }
        )

        const userDetails = wallet.publicKey
          ? userVolume.volumes.reduce<{
              days: TorqueUserRaffleDay[]
              currentDayTotal: number
              totalTickets: number
            }>(
              (acc, volume) => {
                const day = dayjs(volume.day)
                acc.days.push({
                  day,
                  ticketAchieved: volume.volume >= (offerDetailsRef.current?.dailyVolumeRequired ?? 0),
                  dayInitial: day.format('ddd')[0],
                  tense: day.isSame(todayUtc, 'day') ? 'PRESENT' : day.isAfter(todayUtc) ? 'FUTURE' : 'PAST'
                })
                acc.currentDayTotal += volume.volume
                acc.totalTickets += volume.volume >= (offerDetailsRef.current?.dailyVolumeRequired ?? 0) ? 1 : 0
                return acc
              },
              { days: [], currentDayTotal: 0, totalTickets: 2 }
            )
          : undefined

        setRaffle({
          ...offerDetailsRef.current,
          startTime: startTime.startOf('day'),
          endTime: endTime.endOf('day'),
          lastUpdated: dayjs(userVolume.volumes.find((volume) => dayjs(volume.day).isSame(todayUtc, 'day'))?.updatedAt),
          days,
          userDetails
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
