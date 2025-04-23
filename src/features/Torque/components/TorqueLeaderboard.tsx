import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'

export default function TorqueLeaderboard() {
  return (
    <Stack
      bgImage={'/images/torque-coming-soon.png'}
      bgSize={'cover'}
      bgPosition={'center'}
      bgRepeat={'no-repeat'}
      p={3}
      h={'800px'}
      w={'full'}
      justify={'center'}
      align={'center'}
      borderRadius={'md'}
    >
      <Stack w="full" spacing={4} p={3} minH={24} borderRadius="md" bg={colors.backgroundDark} justify="center" align="center">
        <Heading as="h3" fontSize="md">
          Coming Soon!
        </Heading>
        <Text fontSize="sm" align="center">
          Torque are working on getting leaderboards up and running. Check back soon!
        </Text>
      </Stack>
    </Stack>
  )
}
