export interface ScamDetail {
  id: string;
  title: string;
  icon: string;
  color: string;
  gradient: string[];
  description: string;
  howItWorks: string[];
  redFlags: string[];
  expertTips: string[];
  realExample?: string;
}

export const scamDetails: Record<string, ScamDetail> = {
  rugpull: {
    id: 'rugpull',
    title: 'Rug Pulls',
    icon: 'flash',
    color: '#ff3366',
    gradient: ['#ff3366', '#cc0033'],
    description:
      'A rug pull occurs when developers suddenly withdraw all liquidity from a token, leaving investors with worthless assets. This is one of the most devastating scams in crypto.',
    howItWorks: [
      'Developers create a new token and add liquidity to a DEX',
      'They promote the token through social media and influencers',
      'Once enough people invest, devs remove all liquidity',
      'Token price crashes to zero, investors cannot sell',
      'Developers disappear with stolen funds',
    ],
    redFlags: [
      'Unlocked liquidity or short lock period',
      'Anonymous team with no track record',
      'Unrealistic promises of returns',
      'Aggressive marketing with urgency tactics',
      'No audit or verification',
      'Team holds majority of token supply',
    ],
    expertTips: [
      'Only invest in projects with locked liquidity (minimum 6 months)',
      'Verify liquidity lock on trusted platforms like Unicrypt or Team Finance',
      'Research the team - look for doxxed members with LinkedIn profiles',
      'Check contract ownership - renounced ownership is safer',
      'Start with small amounts to test buying AND selling',
      'Be extremely cautious of new tokens with explosive growth',
    ],
    realExample:
      'Squid Game Token (2021): Based on the popular TV show, SQUID token gained 23,000,000% in one week. Developers removed $3.38M in liquidity, leaving investors unable to sell.',
  },
  honeypot: {
    id: 'honeypot',
    title: 'Honeypot Traps',
    icon: 'warning',
    color: '#ffaa00',
    gradient: ['#ffaa00', '#ff8800'],
    description:
      'Honeypot scams are smart contracts that allow you to buy tokens but prevent you from selling them. The code contains hidden restrictions that trap your investment.',
    howItWorks: [
      'Scammers deploy a contract with hidden selling restrictions',
      'Buying tokens works perfectly - no issues detected',
      'Contract code appears normal at first glance',
      'When you try to sell, the transaction fails or reverts',
      'Your tokens are locked forever in your wallet',
    ],
    redFlags: [
      'Cannot simulate sell transactions successfully',
      'Very high slippage required to sell',
      'Sell transactions consistently fail',
      'Contract has transfer restrictions in code',
      'Only the owner can sell tokens',
      'Community reports inability to sell',
    ],
    expertTips: [
      'Use honeypot detection tools before buying (honeypot.is, rugscreen.com)',
      'Always test with a small amount first',
      'Try to simulate a sell transaction before buying large amounts',
      'Read the contract code or get it audited',
      'Check for transfer restrictions or blacklist functions',
      'Look for community complaints about selling issues',
    ],
    realExample:
      'Multiple ERC-20 tokens on Uniswap have been found to contain honeypot code. The Squid Game token also had honeypot characteristics alongside the rug pull.',
  },
  phishing: {
    id: 'phishing',
    title: 'Phishing Attacks',
    icon: 'fish',
    color: '#3b82f6',
    gradient: ['#3b82f6', '#2563eb'],
    description:
      'Phishing attacks use social engineering to trick you into revealing private keys, seed phrases, or connecting your wallet to malicious sites that drain your funds.',
    howItWorks: [
      'Scammers create fake websites that look like legitimate platforms',
      'They send phishing emails or DMs impersonating support teams',
      'Victims enter their seed phrase or connect wallets',
      'Malicious smart contracts get approval to drain wallets',
      'Funds are immediately transferred to scammer addresses',
    ],
    redFlags: [
      'Unsolicited messages asking for seed phrases or private keys',
      'URLs that are slightly different from official sites',
      'Urgent messages claiming account problems',
      'Requests for remote access or screen sharing',
      'Grammar and spelling errors in communications',
      'Too-good-to-be-true giveaways or airdrops',
    ],
    expertTips: [
      'NEVER share your seed phrase or private keys with anyone',
      'Always verify URLs carefully before connecting wallet',
      'Use a hardware wallet for significant holdings',
      'Bookmark legitimate sites and use them exclusively',
      'Enable 2FA wherever possible',
      'Be skeptical of DMs - official support never reaches out first',
      'Revoke smart contract approvals regularly using tools like revoke.cash',
    ],
    realExample:
      'Fake OpenSea emails (2022): Scammers sent phishing emails mimicking OpenSea support, asking users to verify accounts. Many users lost valuable NFTs by connecting to fake sites.',
  },
  dusting: {
    id: 'dusting',
    title: 'Dusting Attacks',
    icon: 'sparkles',
    color: '#8b5cf6',
    gradient: ['#8b5cf6', '#7c3aed'],
    description:
      'Dusting attacks send tiny amounts of cryptocurrency ("dust") to thousands of wallets to track activity, de-anonymize users, and potentially conduct phishing attacks.',
    howItWorks: [
      'Attackers send tiny amounts of tokens to many addresses',
      'They monitor these addresses for transaction activity',
      'By analyzing patterns, they can link addresses to identities',
      'This information is used for targeted phishing or blackmail',
      'Some dust tokens contain phishing links in their name/symbol',
    ],
    redFlags: [
      'Small amounts of unknown tokens appearing in wallet',
      'Tokens with suspicious names or website URLs',
      'Tokens that seem to track your transactions',
      'Random airdrops from unverified projects',
      'Tokens with instructions to visit suspicious websites',
    ],
    expertTips: [
      'Never interact with unknown tokens in your wallet',
      'Do not try to sell or transfer dust tokens',
      'Use a fresh wallet for each major transaction category',
      'Avoid consolidating funds from multiple sources',
      'Use privacy tools like Tornado Cash (where legal) for sensitive transactions',
      'Hide spam tokens in your wallet interface',
      'Never click links embedded in token names or transfers',
    ],
    realExample:
      'Binance Dusting Attack (2019): Attackers sent 0.00000546 BTC to thousands of addresses. They then tracked transactions to link addresses with identities for targeted phishing campaigns.',
  },
  'pump-dump': {
    id: 'pump-dump',
    title: 'Pump & Dump Schemes',
    icon: 'trending-up',
    color: '#f59e0b',
    gradient: ['#f59e0b', '#d97706'],
    description:
      'Pump and dump schemes involve coordinated buying to artificially inflate a token\'s price, then selling at the peak. Early insiders profit while late buyers lose everything.',
    howItWorks: [
      'Organizers accumulate large amounts of low-cap token',
      'They coordinate a "pump" through Telegram/Discord groups',
      'Members buy simultaneously, driving price up rapidly',
      'FOMO attracts outside investors who buy at high prices',
      'Organizers dump their holdings at peak, crashing the price',
    ],
    redFlags: [
      'Telegram/Discord groups promising coordinated pumps',
      'Sudden price spikes with no fundamental news',
      'Heavy promotion of "next 100x token"',
      'Pressure to buy immediately before "pump"',
      'Anonymous organizers with "guaranteed profits"',
      'Very low market cap tokens with thin liquidity',
    ],
    expertTips: [
      'Never join pump and dump groups - you will lose money',
      'Avoid low-cap tokens with sudden unexplained pumps',
      'Research projects thoroughly before investing',
      'Be cautious of coordinated social media campaigns',
      'Look for gradual, organic growth not sudden spikes',
      'Remember: if you hear about a pump, you\'re too late',
      'Focus on projects with strong fundamentals and real use cases',
    ],
    realExample:
      'BitConnect (2018): Used a multi-level marketing structure to pump BCC token from $0.17 to $463. When the scheme collapsed, investors lost over $2 billion.',
  },
  'fake-tokens': {
    id: 'fake-tokens',
    title: 'Fake Tokens',
    icon: 'copy',
    color: '#ef4444',
    gradient: ['#ef4444', '#dc2626'],
    description:
      'Scammers create counterfeit tokens with names and symbols identical to legitimate projects. Unsuspecting investors buy worthless imitations thinking they\'re the real deal.',
    howItWorks: [
      'Scammers deploy a token with the same name/symbol as a popular project',
      'They list it on DEXes where anyone can create trading pairs',
      'The fake token appears in search results alongside the real one',
      'Victims buy the wrong contract address',
      'The fake token has no value and cannot be sold',
    ],
    redFlags: [
      'Multiple tokens with identical names on DEX',
      'Very low holder count compared to real project',
      'No official website or social media presence',
      'Listed on obscure or single exchanges only',
      'Suspiciously low price compared to market rates',
      'Contract address doesn\'t match official sources',
    ],
    expertTips: [
      'ALWAYS verify contract addresses on official project websites',
      'Use CoinGecko or CoinMarketCap to confirm correct contract',
      'Never trust search results on DEXes - double-check everything',
      'Bookmark verified contract addresses for frequent tokens',
      'Check holder count and trading volume before buying',
      'Be extra careful with popular token names (USDT, WBTC, etc.)',
      'Look for verified badges and audit reports',
    ],
    realExample:
      'Fake Uniswap tokens (ongoing): Scammers frequently create fake UNI tokens. In 2020, many investors lost funds buying counterfeit UNI with slightly different contract addresses.',
  },
};
