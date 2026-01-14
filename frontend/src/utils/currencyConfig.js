// ✅ NEW FILE: Multi-Currency & Multi-Jurisdiction Support for EMEA Markets

export const EMEA_CURRENCIES = {
  EUR: { 
    symbol: '€', 
    name: 'Euro', 
    countries: ['Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium'],
    flag: '🇪🇺'
  },
  GBP: { 
    symbol: '£', 
    name: 'British Pound', 
    countries: ['United Kingdom'],
    flag: '🇬🇧'
  },
  AED: { 
    symbol: 'د.إ', 
    name: 'UAE Dirham', 
    countries: ['UAE', 'Dubai', 'Abu Dhabi'],
    flag: '🇦🇪'
  },
  SAR: { 
    symbol: '﷼', 
    name: 'Saudi Riyal', 
    countries: ['Saudi Arabia'],
    flag: '🇸🇦'
  },
  ZAR: { 
    symbol: 'R', 
    name: 'South African Rand', 
    countries: ['South Africa'],
    flag: '🇿🇦'
  },
  CHF: { 
    symbol: 'CHF', 
    name: 'Swiss Franc', 
    countries: ['Switzerland'],
    flag: '🇨🇭'
  },
  EGP: {
    symbol: 'E£',
    name: 'Egyptian Pound',
    countries: ['Egypt'],
    flag: '🇪🇬'
  },
  MAD: {
    symbol: 'د.م.',
    name: 'Moroccan Dirham',
    countries: ['Morocco'],
    flag: '🇲🇦'
  }
};

export const formatCurrency = (amount, currency = 'EUR') => {
  const config = EMEA_CURRENCIES[currency];
  if (!config) return `${amount}`;
  
  return `${config.symbol}${parseFloat(amount).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const JURISDICTIONS = {
  EU: { 
    name: 'European Union', 
    regulations: ['MiFID II', 'GDPR', 'Basel III', 'IFRS 9'],
    color: '#004494'
  },
  UK: { 
    name: 'United Kingdom', 
    regulations: ['FCA Guidelines', 'GDPR', 'Basel III'],
    color: '#012169'
  },
  MENA: { 
    name: 'Middle East & North Africa', 
    regulations: ['Sharia Compliance', 'Central Bank Regulations', 'Local Banking Laws'],
    color: '#007A3D'
  },
  AFRICA: { 
    name: 'Sub-Saharan Africa', 
    regulations: ['African Union Financial Standards', 'National Banking Acts'],
    color: '#CE1126'
  }
};

export const LMA_COMPLIANCE_STANDARDS = {
  GREEN_LOAN_PRINCIPLES: {
    name: 'LMA Green Loan Principles',
    description: 'Framework for sustainability-linked lending',
    url: 'https://www.lma.eu.com/glp'
  },
  SUSTAINABILITY_LINKED: {
    name: 'Sustainability Linked Loan Principles',
    description: 'Guidelines for ESG performance targets',
    url: 'https://www.lma.eu.com/sllp'
  },
  LOAN_DOCUMENTATION: {
    name: 'LMA Standard Documentation',
    description: 'Industry-standard loan agreement templates',
    url: 'https://www.lma.eu.com/documentation'
  }
};

export const convertCurrency = (amount, fromCurrency, toCurrency, rates) => {
  // Simplified conversion - in production, use real-time exchange rate API
  const exchangeRates = rates || {
    EUR: 1.00,
    GBP: 0.86,
    AED: 3.96,
    SAR: 4.04,
    ZAR: 19.80,
    CHF: 0.95,
    EGP: 33.50,
    MAD: 10.70
  };
  
  const amountInEUR = amount / exchangeRates[fromCurrency];
  return amountInEUR * exchangeRates[toCurrency];
};
