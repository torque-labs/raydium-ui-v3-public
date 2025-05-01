import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useRef, useState } from 'react'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import { color, Flex, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'

dayjs.extend(utc)
dayjs.extend(duration)

export interface TorqueCountdownProps {
  date?: Dayjs
}

type Countdown = {
  days?: number
  hours?: number
  minutes?: number
  seconds?: number
}

export function TorqueCountdown({ date }: TorqueCountdownProps) {
  const [countdown, setCountdown] = useState<Countdown | undefined | string>()
  const intervalRef = useRef<number>()

  useEffect(() => {
    if (!date) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      setCountdown(undefined)
      return
    }

    const duration = dayjs.duration(date.diff(dayjs.utc()))

    // If the launch day is more than a day away then just show the golive date
    if (duration.years() > 0 || duration.months() > 0) {
      setCountdown(date.format('MMM D, YYYY'))
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      const interval = window.setInterval(() => {
        const duration = dayjs.duration(date.diff(dayjs.utc()))

        if (duration.asSeconds() <= 0) {
          clearInterval(interval)
          return setCountdown({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
          })
        }

        const days = duration.days()

        // We only want to show seconds if
        setCountdown({
          days: days === 0 ? undefined : days,
          hours: duration.hours(),
          minutes: duration.minutes(),
          seconds: days === 0 ? duration.seconds() : undefined
        })
      }, 1000)

      intervalRef.current = interval
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [date])

  if (!countdown) {
    return null
  }

  if (typeof countdown === 'string') {
    return (
      <Stack w="fit-content" spacing={4} p={3} minH={24} borderRadius="md" bg={colors.backgroundDark} justify="center" align="center">
        <Text>{countdown}</Text>
      </Stack>
    )
  }

  return (
    <HStack>
      {countdown.days !== undefined && <DateCell>{countdown.days}d</DateCell>}
      {countdown.hours !== undefined && <DateCell>{countdown.hours}h</DateCell>}
      {countdown.minutes !== undefined && <DateCell>{countdown.minutes}m</DateCell>}
      {countdown.seconds !== undefined && <DateCell>{countdown.seconds}s</DateCell>}
    </HStack>
  )
}

function DateCell({ children }: { children: React.ReactNode }) {
  return (
    <Flex height={9} width={14} p={2} bg={colors.backgroundMedium} alignItems={'center'} justifyContent={'center'} borderRadius={'md'}>
      <Text fontSize={'sm'}>{children}</Text>
    </Flex>
  )
}
