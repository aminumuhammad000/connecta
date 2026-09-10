import type { User } from '../types';

export const isProfileComplete = (user: User | null): boolean => {
  if (!user) return false;

  // Terms and Conditions MUST be accepted to consider setup complete
  if (!user.termsAccepted) return false;

  if (user.userType === 'client') {
    return !!(user.companyName || user.title || user.bio);
  }

  // Freelancer profile requirement check
  return !!(user.skills?.length && user.title && user.bio);
};

export const getProfileSetupRoute = (user: User | null, defaultRole?: string): string => {
  const role = user?.userType || defaultRole || 'freelancer';

  if (user && !user.termsAccepted) {
    // If profile details exist but terms not yet accepted, take user to terms page
    const hasDetails = user.userType === 'client' ? !!(user.companyName || user.title || user.bio) : !!(user.skills?.length || (user.title && user.bio));
    if (hasDetails) {
      return '/register/terms';
    }
  }

  return role === 'client' ? '/register/client-industry' : '/register/sector';
};
