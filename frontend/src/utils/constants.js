/**
 * Application-wide constants
 * These can be updated dynamically from admin configuration
 */

// Default static constants
export const CURRENCY_SYMBOL = '₹';
export const TOAST_DURATION = 4000;
export const NAVIGATION_DELAY = 1500;

// Dynamic configuration (can be updated from Google Sheets Admin panel)
let dynamicConfig = {
  // Pricing
  coursePrice: 4999,
  
  // Admin credentials (stored securely, not exposed to frontend)
  // adminUsername and adminPassword are fetched but not stored here
  
  // Registration settings
  registrationDeadline: '2025-11-07', // Format: YYYY-MM-DD
  webinarTime: '2025-11-08T19:00:00', // Format: ISO 8601
  
  // Contact information
  contactEmail: 'webinar@pystack.com',
  whatsappInviteLink: 'https://wa.me/yourwhatsapplink',
  discordCommunityLink: 'https://discord.gg/yourcommunity',
  
  // Course features
  courseFeatures: [
    'Complete 5-day Python Full Stack course',
    'Lifetime access to all recordings',
    'Downloadable code templates and projects',
    'Private WhatsApp community access',
    '1-on-1 mentorship session (30 minutes)',
    'Certificate of completion'
  ]
};

// Getter functions to access dynamic config
export const getCoursePrice = () => dynamicConfig.coursePrice;
export const getRegistrationDeadline = () => dynamicConfig.registrationDeadline;
export const getWebinarTime = () => dynamicConfig.webinarTime;
export const getContactEmail = () => dynamicConfig.contactEmail;
export const getWhatsappInviteLink = () => dynamicConfig.whatsappInviteLink;
export const getDiscordCommunityLink = () => dynamicConfig.discordCommunityLink;
export const getCourseFeatures = () => dynamicConfig.courseFeatures;

// Backward compatibility - export as constants
export const COURSE_PRICE = dynamicConfig.coursePrice;
export const COURSE_FEATURES = dynamicConfig.courseFeatures;

// Update function to be called when fetching from backend
export const updateDynamicConfig = (newConfig) => {
  if (newConfig.coursePrice !== undefined) {
    dynamicConfig.coursePrice = newConfig.coursePrice;
  }
  if (newConfig.registrationDeadline !== undefined) {
    dynamicConfig.registrationDeadline = newConfig.registrationDeadline;
  }
  if (newConfig.webinarTime !== undefined) {
    dynamicConfig.webinarTime = newConfig.webinarTime;
  }
  if (newConfig.contactEmail !== undefined) {
    dynamicConfig.contactEmail = newConfig.contactEmail;
  }
  if (newConfig.whatsappInviteLink !== undefined) {
    dynamicConfig.whatsappInviteLink = newConfig.whatsappInviteLink;
  }
  if (newConfig.discordCommunityLink !== undefined) {
    dynamicConfig.discordCommunityLink = newConfig.discordCommunityLink;
  }
  if (newConfig.courseFeatures !== undefined) {
    dynamicConfig.courseFeatures = newConfig.courseFeatures;
  }
  
  console.log('✅ Dynamic configuration updated:', dynamicConfig);
};

// Get all current config
export const getDynamicConfig = () => ({ ...dynamicConfig });
