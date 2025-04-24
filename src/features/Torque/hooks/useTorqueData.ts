import { useCallback, useEffect, useState } from 'react'
import { Wallet } from '@solana/wallet-adapter-react'
import { fetchOffersByWallet, fetchConversionsByWallet, claimOffer } from '../utils'
import { TorqueOffer } from '../types'
import { PublicKey } from '@solana/web3.js'
import dayjs from 'dayjs'
import { useToast } from '@chakra-ui/react'
import { useTokenStore } from '@/store/useTokenStore'

// TODO: Change to the correct project id for the production environment
const RAYDIUM_PROJECT_ID = 'cm9txt2wd000dl71ex927z7jc'

/**
 * Fetch offers and conversions for wallet
 *
 * @param wallet
 *
 * @returns offers and conversions for wallet
 */
export function useTorqueData({ wallet }: { wallet: Wallet | null | undefined }) {
  const tokenMap = useTokenStore((s) => s.tokenMap)

  const [offers, setOffers] = useState<TorqueOffer[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const handleClaimOffer = useCallback(
    async (offerId: string) => {
      try {
        if (!wallet?.adapter.publicKey) {
          toast({
            title: 'No wallet connected',
            description: 'Please connect your wallet to claim this offer',
            status: 'error',
            isClosable: true,
            position: 'bottom-right'
          })
          return
        }

        await claimOffer(offerId, wallet.adapter.publicKey.toString())

        // Optimistically update the offer status
        setOffers((prevOffers) => prevOffers.map((offer) => (offer.id === offerId ? { ...offer, status: 'PENDING' } : offer)))

        toast({
          title: 'Offer claimed',
          description: 'You have successfully claimed this offer. Check your wallet and you will shortly receive your reward.',
          status: 'success',
          isClosable: true,
          position: 'bottom-right'
        })
      } catch (error) {
        console.error(error)
      }
    },
    [wallet]
  )

  const fetchTorqueData = useCallback(async () => {
    const walletAddress = wallet?.adapter.publicKey?.toString()

    if (!walletAddress) {
      setOffers([])
      return
    }

    setLoading(true)

    try {
      const [rawOffers, conversions] = await Promise.all([
        fetchOffersByWallet(walletAddress, RAYDIUM_PROJECT_ID),
        fetchConversionsByWallet(walletAddress, RAYDIUM_PROJECT_ID)
      ])

      const offersWithConversions: TorqueOffer[] = rawOffers.map((offer) => {
        const conversion = conversions.find((conversion) => conversion.offer.id === offer.id)
        const crank = conversion && conversion.cranks.length > 0 ? conversion.cranks[0] : undefined
        const distributor = offer.distributors.length > 0 ? offer.distributors[0] : undefined

        if (!distributor) {
          throw new Error('Distributor not found')
        }

        // Calculate the rewards
        const totalRewardsValue = distributor.totalFundAmount ?? 0
        const rewardPerUser = distributor.distributionFunction.yIntercept

        // Get the token details
        const rewardToken = typeof distributor.tokenAddress === 'string' ? tokenMap.get(distributor.tokenAddress) : undefined
        const rewardDenomination = distributor.emissionType === 'SOL' ? 'SOL' : rewardToken?.symbol ?? 'Unknown'

        // Calculate the offer status
        const startTime = dayjs(offer.startTime)
        const endTime = dayjs(offer.endTime)
        const isOfferActive = offer.status === 'ACTIVE' || (startTime.isBefore(dayjs()) && endTime.isAfter(dayjs()))
        const crankStatus = crank?.status === 'DONE' ? 'CLAIMED' : crank?.status === 'PENDING' ? 'PENDING' : undefined
        const status = crankStatus ? crankStatus : offer.eligible ? (isOfferActive ? 'ACTIVE' : 'EXPIRED') : 'INELIGIBLE'

        return {
          id: offer.id,
          name: offer.metadata.title,
          description: offer.metadata.description,
          image: '/images/reward-icon.png',
          status,
          startTime,
          endTime,
          eligible: offer.eligible,
          txSignature: crank?.transaction,
          distributor: distributor ? new PublicKey(distributor.pubkey) : undefined,
          rewardPerUser: `${rewardPerUser} ${rewardDenomination}`,
          rewardTotal: `${totalRewardsValue} ${rewardDenomination}`,
          numberOfParticipants: offer.numberOfConversions,
          maxParticipants: distributor.crankGuard.availability.maxTotalConversions
        }
      })

      setOffers(offersWithConversions)
    } catch (error) {
      setError('Unable to fetch your offers at this time, please come back again later.')
      setOffers([])
    } finally {
      setLoading(false)
    }
  }, [wallet])

  useEffect(() => {
    fetchTorqueData()
  }, [wallet])

  return { offers, handleClaimOffer, loading, error }
}
