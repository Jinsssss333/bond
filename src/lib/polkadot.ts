import { ApiPromise, WsProvider } from '@polkadot/api';

// Polkadot RPC endpoints
export const POLKADOT_ENDPOINTS = {
  polkadot: 'wss://rpc.polkadot.io',
  kusama: 'wss://kusama-rpc.polkadot.io',
  westend: 'wss://westend-rpc.polkadot.io',
} as const;

let apiInstance: ApiPromise | null = null;

export async function getPolkadotApi(endpoint: string = POLKADOT_ENDPOINTS.polkadot): Promise<ApiPromise> {
  if (apiInstance && apiInstance.isConnected) {
    return apiInstance;
  }

  const provider = new WsProvider(endpoint);
  apiInstance = await ApiPromise.create({ provider });
  
  return apiInstance;
}

export async function disconnectPolkadotApi() {
  if (apiInstance) {
    await apiInstance.disconnect();
    apiInstance = null;
  }
}

export function formatPolkadotAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function getPolkadotBalance(address: string): Promise<string> {
  try {
    const api = await getPolkadotApi();
    const accountInfo = await api.query.system.account(address);
    const accountData = accountInfo.toJSON() as any;
    
    // Convert from Planck to DOT (10^10 Planck = 1 DOT)
    const dotBalance = Number(accountData.data.free) / 1e10;
    return dotBalance.toFixed(4);
  } catch (error) {
    console.error('Error fetching Polkadot balance:', error);
    return '0.0000';
  }
}

export async function getPolkadotIdentity(address: string): Promise<{
  display?: string;
  legal?: string;
  email?: string;
  verified: boolean;
} | null> {
  try {
    const api = await getPolkadotApi();
    const identityOption = await api.query.identity.identityOf(address);
    const identityJson = identityOption.toJSON() as any;
    
    if (!identityJson) {
      return null;
    }

    const info = identityJson.info;
    const judgements = identityJson.judgements || [];
    
    return {
      display: info?.display?.Raw || undefined,
      legal: info?.legal?.Raw || undefined,
      email: info?.email?.Raw || undefined,
      verified: judgements.length > 0,
    };
  } catch (error) {
    console.error('Error fetching Polkadot identity:', error);
    return null;
  }
}
