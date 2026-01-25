export interface JobInvitation {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  message?: string;
  sentDate: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface CompanyFollow {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  followedDate: string;
}

export interface CandidateFollower {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateAvatar: string;
  companyId: string;
  companyName: string;
  followedDate: string;
}
