import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, polygon, polygonMumbai } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from '@wagmi/connectors'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, polygonMumbai],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    coinbaseWallet({ appName: 'Bond Escrow' }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [polygonMumbai.id]: http(),
  },
})
