import { Heading, Stack, Text, Spinner, VStack, HStack, Badge } from '@chakra-ui/react'
import { useTorqueLeaderboard } from '../hooks/useTorqueLeaderboard'
import TorqueLeaderboardCard from './TorqueLeaderboardCard'
import { colors } from '@/theme/cssVariables'
import { useWallet } from '@solana/wallet-adapter-react'
import { TorqueCountdown } from './TorqueCountDown'
import dayjs from 'dayjs'

export default function TorqueLeaderboard() {
  const wallet = useWallet()
  const { leaderboard, loading, error } = useTorqueLeaderboard()

  if (loading) {
    return (
      <Wrapper>
        <Spinner />
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <VStack w="full" spacing={4} p={3} borderRadius="md" bg={colors.backgroundDark}>
        <HStack w="full" justifyContent={'space-between'}>
          <Heading as="h3" fontSize="md">
            {leaderboard?.name}
          </Heading>
          <Badge variant="crooked">4206969 RAY</Badge>
        </HStack>
        <Text fontSize="xs" w="full" color={colors.textTertiary}>
          {leaderboard?.description}
        </Text>
        <HStack w="full" justifyContent={'space-between'}>
          <Text fontSize="xs" w="full" color={colors.textTertiary}>
            Next distribution in:
          </Text>
          <TorqueCountdown date={dayjs().add(3, 'hour')} />
        </HStack>
      </VStack>

      <Section title="Your Position">
        {leaderboard && leaderboard.usersPositions ? (
          <TorqueLeaderboardCard {...leaderboard.usersPositions} amountDenomination="SOL" isCurrentUser={true} />
        ) : (
          <Stack w="full" spacing={4} p={3} minH={24} borderRadius="md" bg={colors.backgroundDark} justify="center" align="center">
            <Text>{wallet.publicKey ? 'You are not in the leaderboard yet.' : 'Please connect your wallet to see your position.'}</Text>
          </Stack>
        )}
      </Section>
      <Section title="Leaderboard">
        {leaderboard &&
          leaderboard.leaderboard.map((position) => (
            <TorqueLeaderboardCard
              key={position.rank}
              {...position}
              amountDenomination="SOL"
              isCurrentUser={position.wallet === leaderboard.usersPositions?.wallet}
            />
          ))}
      </Section>
    </Wrapper>
  )
}

function Section({ children, title, icon }: { children: React.ReactNode; title: string; icon?: React.ReactNode }) {
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

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <VStack w="full" h="full" spacing={4}>
      {children}
    </VStack>
  )
}
