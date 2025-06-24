
export interface PricingTier {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  annualPrice?: number;
  features: string[];
  isPopular?: boolean;
}

export interface VolumeDiscount {
  minTeachers: number;
  pricePerTeacher: number;
  discount: number;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'teacher',
    name: 'Teacher',
    description: 'Perfect for individual teachers',
    basePrice: 999, // $9.99 in cents
    annualPrice: 7990, // $79.90/year (save 20%)
    features: [
      'Unlimited class scheduling',
      'Student feedback collection',
      'Basic analytics',
      'Mental health monitoring'
    ]
  },
  {
    id: 'admin',
    name: 'School Admin',
    description: 'For principals and administrators',
    basePrice: 1499, // $14.99 in cents
    annualPrice: 11990, // $119.90/year (save 20%)
    features: [
      'Everything in Teacher plan',
      'Principal/Admin dashboard',
      'School-wide analytics',
      'Teacher management',
      'Advanced reporting',
      'Mental health articles management'
    ],
    isPopular: true
  }
];

export const VOLUME_DISCOUNTS: VolumeDiscount[] = [
  { minTeachers: 5, pricePerTeacher: 899, discount: 10 }, // $8.99 each (10% off)
  { minTeachers: 10, pricePerTeacher: 799, discount: 20 } // $7.99 each (20% off)
];

export const calculatePricing = (
  tierType: 'teacher' | 'admin',
  teacherCount: number,
  isAnnual: boolean = false
) => {
  const tier = PRICING_TIERS.find(t => t.id === tierType);
  if (!tier) throw new Error('Invalid tier type');

  let pricePerTeacher = tier.basePrice;
  let discountPercent = 0;

  // Apply volume discounts for teacher tier only
  if (tierType === 'teacher' && teacherCount >= 5) {
    const applicableDiscount = VOLUME_DISCOUNTS
      .filter(d => teacherCount >= d.minTeachers)
      .sort((a, b) => b.minTeachers - a.minTeachers)[0];
    
    if (applicableDiscount) {
      pricePerTeacher = applicableDiscount.pricePerTeacher;
      discountPercent = applicableDiscount.discount;
    }
  }

  // Calculate base monthly total
  const monthlyTotal = pricePerTeacher * teacherCount;
  
  // Apply annual discount if selected
  let finalPrice = monthlyTotal;
  let annualSavings = 0;
  
  if (isAnnual && tier.annualPrice) {
    const annualPricePerTeacher = Math.floor(tier.annualPrice / 12);
    finalPrice = annualPricePerTeacher * teacherCount;
    annualSavings = monthlyTotal - finalPrice;
  }

  return {
    tier,
    teacherCount,
    pricePerTeacher,
    monthlyTotal,
    finalPrice,
    discountPercent,
    annualSavings,
    isAnnual,
    savings: monthlyTotal - finalPrice
  };
};

export const getTrialInfo = () => ({
  duration: 30, // days
  description: '30-day free trial - no credit card required'
});

export const getSummerPauseInfo = () => ({
  duration: '2-3 months',
  description: 'Pause subscription during summer break',
  availability: 'June - August'
});
