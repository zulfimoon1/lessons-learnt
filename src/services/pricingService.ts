
export interface PricingTier {
  id: string;
  name: string;
  description: string;
  studentRange: string;
  maxStudents: number;
  maxTeachers: number;
  monthlyPrice: number;
  annualPrice?: number;
  features: string[];
  isPopular?: boolean;
}

export interface HolidayPauseOption {
  monthlyFee: number;
  maxPauseMonths: number;
  annualSavings: number;
  description: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for small schools',
    studentRange: '1-30',
    maxStudents: 30,
    maxTeachers: 5,
    monthlyPrice: 10000, // €100 in cents
    annualPrice: 96000, // €960/year (20% discount)
    features: [
      'Core platform access',
      'Up to 5 teachers',
      'Basic analytics',
      'Email support',
      'Mental health monitoring'
    ]
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Great for growing schools',
    studentRange: '31-100',
    maxStudents: 100,
    maxTeachers: 15,
    monthlyPrice: 25000, // €250 in cents
    annualPrice: 24000, // €2400/year (20% discount)
    features: [
      'Everything in Basic',
      'Advanced analytics',
      'Up to 15 teachers',
      'Priority support',
      'Custom reporting',
      'Voice feedback features'
    ],
    isPopular: true
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'For large educational institutions',
    studentRange: '101-250',
    maxStudents: 250,
    maxTeachers: 30,
    monthlyPrice: 50000, // €500 in cents
    annualPrice: 48000, // €4800/year (20% discount)
    features: [
      'Everything in Standard',
      'Custom integrations',
      'Up to 30 teachers',
      'Dedicated support manager',
      'Advanced AI insights',
      'Priority feature requests'
    ]
  }
];

export const HOLIDAY_PAUSE: HolidayPauseOption = {
  monthlyFee: 1000, // €10 in cents
  maxPauseMonths: 3,
  annualSavings: 18000, // €180 in cents
  description: 'Pause billing for up to 3 months annually'
};

export const calculateStudentBasedPricing = (
  tierId: string,
  studentCount: number,
  isAnnual: boolean = false,
  includeHolidayPause: boolean = false
) => {
  const tier = PRICING_TIERS.find(t => t.id === tierId);
  if (!tier) throw new Error('Invalid tier ID');

  // Calculate base price per student per year
  const basePrice = isAnnual ? tier.annualPrice! : (tier.monthlyPrice * 12);
  const pricePerStudentPerYear = basePrice / tier.maxStudents;
  
  // Calculate total for actual student count
  const totalAnnualPrice = Math.ceil(pricePerStudentPerYear * studentCount);
  const monthlyPrice = Math.ceil(totalAnnualPrice / 12);

  // Holiday pause calculations
  let holidayPauseCost = 0;
  let totalWithPause = totalAnnualPrice;
  
  if (includeHolidayPause) {
    holidayPauseCost = HOLIDAY_PAUSE.monthlyFee * HOLIDAY_PAUSE.maxPauseMonths;
    // 9 months active + 3 months pause fee
    const activeMonths = 12 - HOLIDAY_PAUSE.maxPauseMonths;
    totalWithPause = (monthlyPrice * activeMonths) + holidayPauseCost;
  }

  const savings = includeHolidayPause ? totalAnnualPrice - totalWithPause : 0;
  const annualDiscount = isAnnual ? tier.monthlyPrice * 12 - tier.annualPrice! : 0;

  return {
    tier,
    studentCount,
    pricePerStudentPerYear: Math.ceil(pricePerStudentPerYear / 100), // Convert to euros
    monthlyPrice: Math.ceil(monthlyPrice / 100),
    annualPrice: Math.ceil(totalAnnualPrice / 100),
    holidayPauseCost: Math.ceil(holidayPauseCost / 100),
    totalWithPause: Math.ceil(totalWithPause / 100),
    savings: Math.ceil(savings / 100),
    annualDiscount: Math.ceil(annualDiscount / 100),
    isAnnual,
    includeHolidayPause
  };
};

export const getMinPricePerStudent = () => {
  const basicTier = PRICING_TIERS[0];
  const annualPrice = basicTier.annualPrice!;
  const pricePerStudent = annualPrice / basicTier.maxStudents;
  return Math.ceil(pricePerStudent / 100); // Convert to euros: €3.20
};

// Legacy exports for backward compatibility
export const calculatePricing = (tierType: string, teacherCount: number, isAnnual: boolean) => {
  // For backward compatibility with existing code
  const basePrice = tierType === 'admin' ? 5000 : 3000; // cents
  const finalPrice = basePrice * teacherCount;
  const savings = isAnnual ? finalPrice * 0.2 : 0;
  
  return {
    basePrice,
    finalPrice: finalPrice - savings,
    savings,
    monthly: finalPrice / 100,
    annual: (finalPrice - savings) / 100
  };
};

export const getTrialInfo = () => ({
  duration: 30,
  description: "Start with a 30-day free trial"
});

export const getSummerPauseInfo = () => ({
  description: "Pause billing during summer break",
  availability: "Available with Holiday Pause add-on"
});
