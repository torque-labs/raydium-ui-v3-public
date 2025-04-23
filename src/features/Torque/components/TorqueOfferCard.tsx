import { VStack, Text, Heading, HStack, Button, Image, Stack, Badge } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/store'
import { TorqueOffer } from '../types'
import Tooltip from '@/components/Tooltip'
import ClockIcon from '@/icons/misc/Clock'
interface TorqueOfferCardProps extends TorqueOffer {
  claimOffer: (offerId: string) => void
}

export default function TorqueOfferCard({
  claimOffer,
  id,
  name,
  description,
  status,
  startTime,
  endTime,
  txSignature,
  distributor,
  rewardPerUser,
  rewardTotal,
  numberOfParticipants,
  maxParticipants
}: TorqueOfferCardProps) {
  const [claiming, setClaiming] = useState<boolean>(false)

  const explorerUrl = useAppStore((s) => s.explorerUrl)

  const handleClaim = async () => {
    setClaiming(true)
    await claimOffer(id)
    setClaiming(false)
  }

  const borderColor = useMemo(() => {
    switch (status) {
      case 'ACTIVE':
        return colors.primary
      case 'EXPIRED':
      case 'INELIGIBLE':
        return colors.semanticError
      // This will be the case for Claimed & Pending offers
      default:
        return colors.backgroundDark
    }
  }, [status])

  return (
    <HStack w="full" spacing={4} p={3} borderRadius="md" bg={colors.backgroundDark} border={'solid 1px'} borderColor={borderColor}>
      <VStack align="flex-start" spacing={3} flex={1} w="full">
        <HStack gap={3} w="full">
          <Image src="/images/reward-icon.png" alt="Reward Icon" w={12} h={12} />
          <Stack align="flex-start" spacing={1} w="full">
            <HStack alignItems="center" justifyContent={'space-between'} w="full">
              <Heading as="h3" fontSize="sm" overflow="hidden">
                {name}
              </Heading>
              <Tooltip label="The amount of rewards available in the pool.">
                <Badge variant="crooked">{rewardTotal}</Badge>
              </Tooltip>
            </HStack>
            <HStack gap={1} alignItems="center">
              <ClockIcon h={'12px'} w={'12px'} color={colors.textTertiary} />
              <Text fontSize="xs" w="full" color={colors.textTertiary}>
                {startTime.format('MMM D, YYYY')} - {endTime.format('MMM D, YYYY')}
              </Text>
            </HStack>
            <Text fontSize="xs" w="full" noOfLines={2} color={colors.textTertiary}>
              {description}
            </Text>
          </Stack>
        </HStack>

        <VStack bg={colors.backgroundMedium} borderRadius="md" p={2} w="full" gap={2}>
          <HStack w="full" gap={2} justify="space-between">
            <Text fontSize="sm">Participants</Text>
            <Text fontSize="sm">
              {numberOfParticipants} / {maxParticipants}
            </Text>
          </HStack>
          {status === 'ACTIVE' || status === 'CLAIMED' ? (
            <HStack w="full" gap={2} justify="space-between">
              <Text fontSize="sm">Your Reward</Text>
              <Text fontSize="sm">{rewardPerUser}</Text>
            </HStack>
          ) : null}
          <HStack w="full" gap={2} justify="space-between">
            <Text fontSize="sm">Reward Pool</Text>
            <Link href={`${explorerUrl}/address/${distributor}`} target="_blank" rel="noopener noreferrer">
              <Button size="xs" variant="outline">
                View
              </Button>
            </Link>
          </HStack>
        </VStack>

        <HStack w="full" gap={2}>
          {status !== 'EXPIRED' && status !== 'INELIGIBLE' && (
            <Button
              size="sm"
              w="full"
              isDisabled={status !== 'ACTIVE'}
              variant={status === 'ACTIVE' ? 'solid' : 'outline'}
              isLoading={claiming}
              onClick={handleClaim}
            >
              {status === 'ACTIVE' ? 'Claim Reward' : status === 'PENDING' ? 'Sending Reward' : 'Claimed'}
            </Button>
          )}

          {txSignature ? (
            <Link href={`${explorerUrl}/tx/${txSignature}`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">
                View Tx
              </Button>
            </Link>
          ) : null}
        </HStack>
      </VStack>
    </HStack>
  )
}
