import { erc20Abi } from 'viem'

// USDC Contract Addresses
export const USDC_ADDRESSES = {
  mainnet: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  sepolia: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  polygon: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  polygonMumbai: '0x0FA8781a83E46826621b3BC094Ea2A0212e71B23',
} as const

export const usdcAbi = erc20Abi

export function getUSDCAddress(chainId: number): `0x${string}` {
  switch (chainId) {
    case 1:
      return USDC_ADDRESSES.mainnet
    case 11155111:
      return USDC_ADDRESSES.sepolia
    case 137:
      return USDC_ADDRESSES.polygon
    case 80001:
      return USDC_ADDRESSES.polygonMumbai
    default:
      return USDC_ADDRESSES.sepolia // Default to testnet
  }
}
