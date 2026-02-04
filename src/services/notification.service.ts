import { applicationsService } from './applications.service';
import { invitationsService } from './invitations.service';

export type UserRole = 'candidate' | 'employer' | 'admin' | 'guest';

export interface Notification {
    id: string;
    type: 'application' | 'invitation' | 'system' | 'message';
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
    link?: string;
    relatedId?: string;
}

export const notificationService = {
    async getNotifications(userId: string, role: UserRole): Promise<Notification[]> {
        const notifications: Notification[] = [];

        try {
            if (role === 'employer') {
                const applications = await applicationsService.getApplicationsByEmployer(userId);

                // Add recent applications as notifications (last 7 days)
                const recentApps = applications?.filter(app => {
                    const appDate = new Date(app.applied_at);
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return appDate > sevenDaysAgo && app.status === 'pending';
                }) || [];

                recentApps.forEach(app => {
                    notifications.push({
                        id: `app-${app.id}`,
                        type: 'application',
                        title: 'New Application',
                        message: `${app.candidate_profiles?.profiles?.full_name || 'A candidate'} applied for ${app.jobs?.title}`,
                        createdAt: app.applied_at,
                        read: false, // In a real app, track read status in DB
                        link: `/employer/applications/${app.id}`,
                        relatedId: app.id
                    });
                });

            } else if (role === 'candidate') {
                const invitations = await invitationsService.getInvitationsByCandidate(userId);

                // Add pending invitations
                const pendingInvites = invitations?.filter((inv: any) => inv.status === 'pending') || [];

                pendingInvites.forEach((inv: any) => {
                    notifications.push({
                        id: `inv-${inv.id}`,
                        type: 'invitation',
                        title: 'New Interview Invitation',
                        message: `${inv.job?.employer_profiles?.company_name || 'A company'} invited you to interview for ${inv.job?.title}`,
                        createdAt: inv.created_at,
                        read: false,
                        link: '/candidate/invitations',
                        relatedId: inv.id
                    });
                });
            }

            // Sort by date desc
            return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    async markAsRead(_notificationId: string) {
        // Placeholder for future backend implementation
        // For now, we handle read state in local component state
        return true;
    }
};
