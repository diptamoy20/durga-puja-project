// ---------------------------------------------------------------------------
// Tourism Concierge Types
// ---------------------------------------------------------------------------

export type TourismCircuit = {
  id: number;
  name: string;
  slug: string;
  region: string;
  description: string;
  duration: string;
  bestTimeOfDay: string | null;
  recommendedTransport: string | null;
  crowdLevel: string | null;
  tags: string[];
  coverImageUrl: string | null;
  galleryImages: string[] | null;
  highlightPandals: HighlightPandal[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type HighlightPandal = {
  name: string;
  location: string;
  highlight: string;
  pandalAtlasId?: number;
  latitude?: number;
  longitude?: number;
  timing?: string;
  photos?: string[];
  virtualTourUrl?: string;
};

export type TourismStay = {
  id: number;
  name: string;
  slug: string;
  type: string;
  location: string;
  city: string;
  district: string;
  priceRange: string;
  budgetTier: string;
  starRating: number | null;
  amenities: string[];
  contactPhone: string | null;
  contactEmail: string | null;
  bookingUrl: string | null;
  description: string | null;
  coverImageUrl: string | null;
  isWbtdc: boolean;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TourismTransport = {
  id: number;
  name: string;
  category: string;
  operatingHours: string;
  routeDescription: string;
  fareGuide: string;
  bookingOrHelpline: string | null;
  tips: string[];
  coverImageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type TourismFestivalDay = {
  id: number;
  tithiName: string;
  date: string;
  rituals: string;
  tourismTips: string;
  bestTimeWindows: string;
  highlights: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type TourismItinerary = {
  id: number;
  title: string;
  slug: string;
  durationDays: number;
  targetAudience: string;
  overview: string;
  dayPlans: ItineraryDayPlan[];
  includedHighlights: string[];
  coverImageUrl: string | null;
  isCurated: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ItineraryDayPlan = {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  night: string;
  pandals: string[];
  foodHighlights: string;
  transportTip: string;
};

export type TourismKnowledge = {
  id: number;
  category: string;
  title: string;
  content: string;
  quickTips: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TourismOperator = {
  id: number;
  name: string;
  licenseNo: string | null;
  operatorType: string;
  contactPerson: string | null;
  phone: string;
  email: string;
  website: string | null;
  address: string | null;
  packagesOffered: OperatorPackage[];
  rating: number | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OperatorPackage = {
  name: string;
  price: string;
  duration: string;
  meals?: string;
  includes?: string;
};

export type TourismEnquiry = {
  id: number;
  enquiryCode: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string | null;
  numberOfTravellers: number;
  startDate: string | null;
  endDate: string | null;
  durationPreference: string | null;
  preferredCircuits: string[];
  interests: string[];
  stayPreference: string | null;
  transportPreference: string | null;
  pujaPreferences: string[];
  specialRequirements: string | null;
  status: TourismEnquiryStatus;
  assignedToId: number | null;
  adminRemarks: string | null;
  consentGiven: boolean;
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: { id: number; name: string; email: string } | null;
  histories?: TourismEnquiryHistory[];
};

export type TourismEnquiryStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'CONTACTED'
  | 'ITINERARY_SENT'
  | 'CLOSED';

export type TourismEnquiryHistory = {
  id: number;
  enquiryId: number;
  changedById: number | null;
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  comment: string | null;
  createdAt: string;
  changedBy?: { id: number; name: string } | null;
};

export type TourismEnquiryFormValues = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city?: string;
  numberOfTravellers: number;
  startDate?: string;
  endDate?: string;
  durationPreference?: string;
  preferredCircuits?: string[];
  interests?: string[];
  stayPreference?: string;
  transportPreference?: string;
  pujaPreferences?: string[];
  specialRequirements?: string;
  consentGiven: boolean;
  preferredLanguage?: string;
  captchaToken: string;
  captchaAnswer: string;
  _hp?: string; // honeypot
};

export type TourismRecommendationRequest = {
  duration?: string;
  travellers?: string;
  interests?: string[];
  regions?: string[];
  stayPreference?: string;
  transportPreference?: string;
  pujaPreferences?: string[];
};

export type TourismRecommendationResponse = {
  recommendedCircuits: {
    circuit: TourismCircuit;
    matchScore: number;
    matchReasons: string[];
  }[];
  recommendedItinerary: TourismItinerary | null;
  suggestedStays: TourismStay[];
  recommendedTransports: TourismTransport[];
  pertinentCalendarDays: TourismFestivalDay[];
  summaryNote: string;
  generatedAt: string;
};

export type ChatbotMessage = {
  id?: string;
  sender?: 'user' | 'assistant';
  text?: string;
  timestamp?: string;
  role?: 'user' | 'assistant';
  content?: string;
  quickOptions?: string[];
  language?: 'en' | 'bn' | 'hi';
};

export type ChatbotRequest = {
  message: string;
  language?: 'en' | 'bn' | 'hi';
  conversationHistory?: ChatbotMessage[];
};

export type ChatbotResponse = {
  reply: string;
  quickOptions: string[];
  language: 'en' | 'bn' | 'hi';
};

export type CaptchaData = {
  question: string;
  token: string;
};

export type TourismListQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  status?: string;
  region?: string;
  type?: string;
  budgetTier?: string;
  isWbtdc?: string;
  durationDays?: number;
  category?: string;
};

export type TourismAdminStats = {
  enquiries: {
    total_enquiries: number;
    new_count: number;
    under_review_count: number;
    assigned_count: number;
    contacted_count: number;
    itinerary_sent_count: number;
    closed_count: number;
  };
  totalCircuits: number;
  totalStays: number;
  totalOperators: number;
};

export type PaginatedTourismData<T> = {
  items: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};