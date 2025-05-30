import { colors } from '@/theme/cssVariables'
import { Box, Flex, Text, Tooltip } from '@chakra-ui/react'
import { TorqueUserRaffleDay } from '../types'

export function TorqueDayActivity({ day }: { day: TorqueUserRaffleDay }) {
  return (
    <Flex direction={'column'} key={day.day.toISOString()} alignItems={'center'} justifyContent={'space-between'}>
      <Text fontSize="xs" color={colors.textTertiary}>
        {day.dayInitial}
      </Text>

      {day.tense === 'PAST' && (
        <Tooltip label={day.ticketAchieved ? 'You achieved the ticket for this day' : 'You did not achieve the ticket for this day'}>
          <Flex
            h={8}
            w={8}
            bg={day.ticketAchieved ? colors.backgroundMedium : colors.semanticError}
            borderRadius={'md'}
            alignItems={'center'}
            justifyContent={'center'}
            opacity={day.ticketAchieved ? 1 : 0.7}
          >
            <Box h={3} w={3} bg={colors.textPrimary} opacity={0.5} borderRadius={'full'} />
          </Flex>
        </Tooltip>
      )}

      {day.tense === 'PRESENT' && (
        <Flex
          h={8}
          w={8}
          bg={colors.backgroundMedium}
          borderRadius={'md'}
          alignItems={'center'}
          justifyContent={'center'}
          border={`1px solid ${colors.textTertiary}`}
        >
          {day.ticketAchieved ? (
            <Box h={3} w={3} bg={colors.textPrimary} opacity={0.5} borderRadius={'full'} />
          ) : (
            <Text fontSize="xs" color={colors.textTertiary}>
              {day.day.format('D')}
            </Text>
          )}
        </Flex>
      )}

      {day.tense === 'FUTURE' && (
        <Flex h={8} w={8} bg={colors.backgroundMedium} borderRadius={'md'} alignItems={'center'} justifyContent={'center'}>
          <Text fontSize="xs" color={colors.textTertiary}>
            {day.day.format('D')}
          </Text>
        </Flex>
      )}
    </Flex>
  )
}
