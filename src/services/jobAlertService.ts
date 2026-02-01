import { supabase } from '../lib/supabase';
import { JobFiltersState } from '@/components/candidate/JobFilters';
import { jobsService } from './jobs.service';

export interface JobAlert {
    id: string;
    candidate_id: string;
    title: string;
    filters: JobFiltersState;
    is_paused: boolean;
    created_at: string;
    updated_at: string;
}

export const jobAlertService = {
    async getAlerts() {
        const { data, error } = await supabase
            .from('job_alerts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as JobAlert[];
    },

    async createAlert(userId: string, title: string, filters: JobFiltersState) {
        console.log('jobAlertService: Creating alert...', { userId, title, filters });

        const insertData = {
            candidate_id: userId,
            title,
            filters: filters || {}
        };

        console.log('jobAlertService: Inserting data...', insertData);
        const { data, error } = await supabase
            .from('job_alerts')
            .insert(insertData)
            .select()
            .maybeSingle();

        if (error) {
            console.error('jobAlertService: Insert error:', error);
            throw error;
        }
        console.log('jobAlertService: Created successfully:', data);
        return data as JobAlert;
    },

    async updateAlert(id: string, updates: Partial<JobAlert>) {
        console.log('jobAlertService: Updating alert...', { id, updates });
        const { data, error } = await supabase
            .from('job_alerts')
            .update(updates)
            .eq('id', id)
            .select()
            .maybeSingle();

        if (error) {
            console.error('jobAlertService: Update error:', error);
            throw error;
        }
        console.log('jobAlertService: Updated successfully:', data);
        return data as JobAlert;
    },

    async deleteAlert(id: string) {
        const { error } = await supabase
            .from('job_alerts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getMatchingJobs(filters: JobFiltersState) {
        const searchParams: any = {};
        if (filters.title) searchParams.title = filters.title;
        if (filters.sector && filters.sector !== 'all') searchParams.sector = filters.sector;
        if (filters.continent && filters.continent !== 'all') searchParams.continent = filters.continent;
        if (filters.country && filters.country !== 'all') searchParams.country = filters.country;
        if (filters.city && filters.city !== 'all') searchParams.city = filters.city;
        if (filters.employmentTypes.length > 0) searchParams.employment_type = filters.employmentTypes;
        if (filters.salaryRange[0] > 0) searchParams.min_salary = filters.salaryRange[0];
        if (filters.salaryRange[1] < 250000) searchParams.max_salary = filters.salaryRange[1];
        if (filters.minEntryBonus > 0) searchParams.min_entry_bonus = filters.minEntryBonus;
        if (filters.skills.length > 0) searchParams.required_skills = filters.skills;
        if (filters.qualifications.length > 0) searchParams.required_qualifications = filters.qualifications;
        if (filters.languages.length > 0) searchParams.required_languages = filters.languages;
        if (filters.careerLevel && filters.careerLevel !== 'all') searchParams.career_level = filters.careerLevel;
        if (filters.experienceYears !== null) searchParams.experience_years = filters.experienceYears;
        if (filters.drivingLicenses.length > 0) searchParams.driving_licenses = filters.drivingLicenses;
        if (filters.contractTerms.length > 0) searchParams.contract_terms = filters.contractTerms;
        if (filters.homeOffice) searchParams.home_office_available = true;
        if (filters.minVacationDays > 0) searchParams.min_vacation_days = filters.minVacationDays;

        return await jobsService.searchJobs(searchParams);
    }
};
