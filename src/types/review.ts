export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewerRole: 'candidate' | 'employer';
  reviewerCompany?: string;
  targetId: string;
  targetRole: 'candidate' | 'employer';
  rating: number;
  comment: string;
  date: string;
}
