import { Box, useDisclosure } from '@chakra-ui/react'

import Button from '@/components/Button'
import { useWallet } from '@solana/wallet-adapter-react'
import TorqueDrawer from './TorqueDrawer'

export default function TorqueButton() {
  const { wallet, connected } = useWallet()

  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button variant="ghost" onClick={onOpen}>
        <Box as="span" bgGradient="linear-gradient(245.22deg, #FF2FC8 7.97%, #FFB12B 49.17%, #D3D839 92.1%)" bgClip="text">
          Rewards
        </Box>
      </Button>

      <TorqueDrawer wallet={wallet} isOpen={isOpen} onClose={onClose} />
    </>
  )
}
