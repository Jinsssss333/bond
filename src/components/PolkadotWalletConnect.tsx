import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Wallet } from 'lucide-react';

interface PolkadotAccount {
  address: string;
  meta: {
    name?: string;
    source: string;
  };
}

export function PolkadotWalletConnect() {
  const [accounts, setAccounts] = useState<PolkadotAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<PolkadotAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const { web3Accounts, web3Enable } = await import('@polkadot/extension-dapp');
      
      const extensions = await web3Enable('Bond Escrow');
      
      if (extensions.length === 0) {
        toast.error('No Polkadot wallet extension found. Please install Polkadot.js or Talisman.');
        setIsConnecting(false);
        return;
      }

      const allAccounts = await web3Accounts();
      
      if (allAccounts.length === 0) {
        toast.error('No accounts found. Please create an account in your Polkadot wallet.');
        setIsConnecting(false);
        return;
      }

      setAccounts(allAccounts);
      setSelectedAccount(allAccounts[0]);
      toast.success(`Connected to ${allAccounts[0].meta.name || 'Polkadot wallet'}`);
    } catch (error) {
      console.error('Polkadot wallet connection error:', error);
      toast.error('Failed to connect Polkadot wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setSelectedAccount(null);
    setAccounts([]);
    toast.success('Polkadot wallet disconnected');
  };

  if (selectedAccount) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-3 py-2 bg-muted rounded-lg text-sm">
          <span className="font-mono">
            {selectedAccount.address.slice(0, 6)}...{selectedAccount.address.slice(-4)}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={disconnectWallet}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="outline" 
      onClick={connectWallet}
      disabled={isConnecting}
    >
      <Wallet className="mr-2 h-4 w-4" />
      {isConnecting ? 'Connecting...' : 'Connect Polkadot'}
    </Button>
  );
}
