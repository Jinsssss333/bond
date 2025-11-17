import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Wallet, ExternalLink } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { getPolkadotIdentity } from '@/lib/polkadot';

interface PolkadotAccount {
  address: string;
  meta: {
    name?: string;
    source: string;
  };
}

interface WalletExtension {
  name: string;
  displayName: string;
  installed: boolean;
  downloadUrl: string;
  icon: string;
}

export function PolkadotWalletConnect() {
  const [accounts, setAccounts] = useState<PolkadotAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<PolkadotAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<WalletExtension[]>([]);
  const linkPolkadot = useMutation(api.polkadot.linkPolkadotAddress);

  const SUPPORTED_WALLETS: WalletExtension[] = [
    {
      name: 'polkadot-js',
      displayName: 'Polkadot.js',
      installed: false,
      downloadUrl: 'https://polkadot.js.org/extension/',
      icon: '🟣',
    },
    {
      name: 'talisman',
      displayName: 'Talisman',
      installed: false,
      downloadUrl: 'https://talisman.xyz/',
      icon: '🔮',
    },
    {
      name: 'subwallet-js',
      displayName: 'SubWallet',
      installed: false,
      downloadUrl: 'https://subwallet.app/',
      icon: '🌐',
    },
  ];

  useEffect(() => {
    checkInstalledWallets();
  }, []);

  const checkInstalledWallets = async () => {
    try {
      const { web3Enable } = await import('@polkadot/extension-dapp');
      const extensions = await web3Enable('Bond Escrow');
      
      const walletStatus = SUPPORTED_WALLETS.map(wallet => ({
        ...wallet,
        installed: extensions.some(ext => ext.name === wallet.name),
      }));
      
      setAvailableWallets(walletStatus);
    } catch (error) {
      console.error('Error checking wallets:', error);
      setAvailableWallets(SUPPORTED_WALLETS);
    }
  };

  const connectWallet = async (walletName?: string) => {
    setIsConnecting(true);
    try {
      const { web3Accounts, web3Enable } = await import('@polkadot/extension-dapp');
      
      const extensions = await web3Enable('Bond Escrow');
      
      if (extensions.length === 0) {
        setShowWalletDialog(true);
        setIsConnecting(false);
        return;
      }

      const allAccounts = await web3Accounts();
      
      // Filter by wallet source if specified
      const filteredAccounts = walletName 
        ? allAccounts.filter(acc => acc.meta.source === walletName)
        : allAccounts;
      
      if (filteredAccounts.length === 0) {
        toast.error('No accounts found in the selected wallet. Please create an account first.');
        setIsConnecting(false);
        return;
      }

      setAccounts(filteredAccounts);
      const account = filteredAccounts[0];
      setSelectedAccount(account);
      
      // Link the Polkadot address to the user's account
      try {
        const identity = await getPolkadotIdentity(account.address);
        await linkPolkadot({
          polkadotAddress: account.address,
          identity: identity || undefined,
        });
        toast.success(`Connected to ${account.meta.name || account.meta.source}!`);
      } catch (error) {
        console.error('Error linking Polkadot address:', error);
        toast.warning('Wallet connected but failed to link to your account');
      }
      
      setShowWalletDialog(false);
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
    <>
      <Button 
        variant="outline" 
        onClick={() => {
          checkInstalledWallets();
          setShowWalletDialog(true);
        }}
        disabled={isConnecting}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isConnecting ? 'Connecting...' : 'Connect Polkadot'}
      </Button>

      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Polkadot Wallet</DialogTitle>
            <DialogDescription>
              Choose your preferred Polkadot wallet extension
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {availableWallets.map((wallet) => (
              <div
                key={wallet.name}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div>
                    <p className="font-medium">{wallet.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {wallet.installed ? 'Installed' : 'Not installed'}
                    </p>
                  </div>
                </div>
                
                {wallet.installed ? (
                  <Button
                    size="sm"
                    onClick={() => connectWallet(wallet.name)}
                    disabled={isConnecting}
                  >
                    Connect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(wallet.downloadUrl, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-3 w-3" />
                    Install
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> After installing a wallet extension, refresh this page and try connecting again.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}