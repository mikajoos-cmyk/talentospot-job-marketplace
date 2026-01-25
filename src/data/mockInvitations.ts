import { JobInvitation, CompanyFollow, CandidateFollower } from '@/types/invitation';

export const mockInvitations: JobInvitation[] = [
  {
    id: '1',
    jobId: '1',
    jobTitle: 'Senior Frontend Developer',
    companyId: 'techcorp',
    companyName: 'TechCorp',
    companyLogo: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_1.png',
    message: 'We think you would be a great fit for this role!',
    sentDate: '2024-01-15',
    status: 'pending',
  },
  {
    id: '2',
    jobId: '2',
    jobTitle: 'Product Manager',
    companyId: 'startupxyz',
    companyName: 'StartupXYZ',
    companyLogo: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_2.png',
    message: 'Your profile matches our requirements perfectly.',
    sentDate: '2024-01-14',
    status: 'pending',
  },
  {
    id: '3',
    jobId: '6',
    jobTitle: 'Data Scientist',
    companyId: 'aisolutions',
    companyName: 'AI Solutions',
    companyLogo: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_1.png',
    sentDate: '2024-01-12',
    status: 'pending',
  },
];

export const mockFollowing: CompanyFollow[] = [
  {
    id: '1',
    companyId: 'techcorp',
    companyName: 'TechCorp',
    companyLogo: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_1.png',
    followedDate: '2024-01-10',
  },
  {
    id: '2',
    companyId: 'startupxyz',
    companyName: 'StartupXYZ',
    companyLogo: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_2.png',
    followedDate: '2024-01-08',
  },
  {
    id: '3',
    companyId: 'cloudtech',
    companyName: 'CloudTech',
    companyLogo: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_5.png',
    followedDate: '2024-01-05',
  },
];

export const mockFollowers: CandidateFollower[] = [
  {
    id: '1',
    candidateId: '1',
    candidateName: 'Sarah Johnson',
    candidateAvatar: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_1.png',
    companyId: 'techcorp',
    companyName: 'TechCorp',
    followedDate: '2024-01-15',
  },
  {
    id: '2',
    candidateId: '1',
    candidateName: 'Sarah Johnson',
    candidateAvatar: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_1.png',
    companyId: 'dataco',
    companyName: 'DataCo',
    followedDate: '2024-01-14',
  },
  {
    id: '3',
    candidateId: '1',
    candidateName: 'Sarah Johnson',
    candidateAvatar: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_1.png',
    companyId: 'aisolutions',
    companyName: 'AI Solutions',
    followedDate: '2024-01-12',
  },
];
