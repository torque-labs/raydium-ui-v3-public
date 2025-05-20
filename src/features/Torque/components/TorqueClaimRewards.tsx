import { Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import TorqueOfferCard, { TorqueOfferCardSkeleton } from './TorqueOfferCard'
import { colors } from '@/theme/cssVariables'
import { TorqueCampaign, TorqueOffer } from '../types'
import HistoryIcon from '@/icons/misc/History'
import GiftIcon from '@/icons/misc/Gift'
import { useWallet } from '@solana/wallet-adapter-react'
interface TorqueClaimRewardsProps {
  claimOffer: (offerId: string) => void
  campaigns: TorqueCampaign[]
  loading: boolean
  error: string | null
}

export default function TorqueClaimRewards({ claimOffer, campaigns, loading, error }: TorqueClaimRewardsProps) {
  const { wallet } = useWallet()

  const activeCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => campaign.offers.some((offer) => offer.status === 'ACTIVE'))
  }, [campaigns])

  const historicalCampaigns = useMemo(() => {
    return campaigns
      .filter((campaign) => !campaign.offers.some((offer) => offer.status === 'ACTIVE'))
      .sort((a, b) => {
        const aHasPending = a.offers.some((offer) => offer.status === 'PENDING')
        const bHasPending = b.offers.some((offer) => offer.status === 'PENDING')
        const aHasClaimed = a.offers.some((offer) => offer.status === 'CLAIMED')
        const bHasClaimed = b.offers.some((offer) => offer.status === 'CLAIMED')

        if (aHasPending && !bHasPending) return -1
        if (!aHasPending && bHasPending) return 1
        if (aHasClaimed && !bHasClaimed) return -1
        if (!aHasClaimed && bHasClaimed) return 1
        return b.endTime.diff(a.endTime)
      })
  }, [campaigns])

  if (loading) {
    return (
      <VStack gap={6} p={0} w="full">
        <TorqueClaimRewardsSkeleton />
      </VStack>
    )
  }

  if (error) {
    return (
      <VStack
        w="full"
        spacing={4}
        p={3}
        minH={24}
        borderRadius="md"
        bg={colors.backgroundDark}
        opacity={0.7}
        justify="center"
        align="center"
      >
        <Heading as="h3" fontSize="md">
          Unable to load rewards
        </Heading>
        <Text fontSize="sm" align="center">
          Looks like there was an error loading the rewards. Please try again later.
        </Text>
      </VStack>
    )
  }

  return (
    <VStack gap={6} p={0} w="full">
      <Section title="Ready to Claim" icon={<GiftIcon color={colors.textSecondary} />}>
        {activeCampaigns.length > 0 ? (
          activeCampaigns.flatMap((campaign) =>
            campaign.offers
              .filter((offer) => offer.status === 'ACTIVE')
              .map((offer) => <TorqueOfferCard key={`${campaign.id}-${offer.id}`} {...campaign} offer={offer} claimOffer={claimOffer} />)
          )
        ) : (
          <Stack
            w="full"
            spacing={4}
            p={3}
            minH={24}
            borderRadius="md"
            bg={colors.backgroundDark}
            opacity={0.7}
            justify="center"
            align="center"
          >
            <Text>{wallet?.adapter.publicKey ? "You don't have any available rewards." : 'Connect your wallet to view your rewards.'}</Text>
          </Stack>
        )}
      </Section>

      <Section title="History" icon={<HistoryIcon color={colors.textSecondary} />}>
        {historicalCampaigns.length > 0 ? (
          historicalCampaigns.flatMap((campaign) =>
            campaign.offers
              .filter((offer) => offer.status !== 'ACTIVE')
              .map((offer) => <TorqueOfferCard key={`${campaign.id}-${offer.id}`} {...campaign} offer={offer} claimOffer={claimOffer} />)
          )
        ) : (
          <Stack
            w="full"
            spacing={4}
            p={3}
            minH={24}
            borderRadius="md"
            bg={colors.backgroundDark}
            opacity={0.7}
            justify="center"
            align="center"
          >
            <Text>
              {wallet?.adapter.publicKey ? 'Looks like there are no historical rewards.' : 'Connect your wallet to see historical rewards.'}
            </Text>
          </Stack>
        )}
      </Section>
    </VStack>
  )
}

function Section({ children, title, icon }: { children: React.ReactNode; title: string; icon: React.ReactNode }) {
  return (
    <VStack gap={2} p={0} w="full" align="flex-start">
      <HStack gap={2} justifyContent={'flex-start'} alignItems={'center'}>
        {icon}
        <Heading as="h3" fontSize="md" alignSelf="flex-start">
          {title}
        </Heading>
      </HStack>
      {children}
    </VStack>
  )
}

function TorqueClaimRewardsSkeleton() {
  return (
    <VStack gap={6} p={0} w="full">
      <Section title="Ready to Claim" icon={<GiftIcon color={colors.textSecondary} />}>
        <TorqueOfferCardSkeleton />
        <TorqueOfferCardSkeleton />
      </Section>

      <Section title="History" icon={<HistoryIcon color={colors.textSecondary} />}>
        <TorqueOfferCardSkeleton />
        <TorqueOfferCardSkeleton />
        <TorqueOfferCardSkeleton />
      </Section>
    </VStack>
  )
}
