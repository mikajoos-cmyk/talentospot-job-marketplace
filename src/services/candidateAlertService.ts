import { supabase } from '../lib/supabase';
import { CandidateFilters } from '@/types/candidate';
import { candidateService } from './candidate.service';
import { calculateCandidateMatchScore } from '@/utils/match-utils';

export interface CandidateAlert {
    id: string;
    employer_id: string;
    title: string;
    filters: CandidateFilters;
    is_paused: boolean;
    created_at: string;
    updated_at: string;
}

export const candidateAlertService = {
    async getAlerts() {
        const { data, error } = await supabase
            .from('candidate_alerts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as CandidateAlert[];
    },

    async createAlert(employerId: string, title: string, filters: CandidateFilters) {
        console.log('candidateAlertService: Creating alert...', { employerId, title, filters });

        const insertData = {
            employer_id: employerId,
            title,
            filters: filters || {}
        };

        const { data, error } = await supabase
            .from('candidate_alerts')
            .insert(insertData)
            .select()
            .maybeSingle();

        if (error) {
            console.error('candidateAlertService: Insert error:', error);
            throw error;
        }
        return data as CandidateAlert;
    },

    async updateAlert(id: string, updates: Partial<CandidateAlert>) {
        console.log('candidateAlertService: Updating alert...', { id, updates });
        const { data, error } = await supabase
            .from('candidate_alerts')
            .update(updates)
            .eq('id', id)
            .select()
            .maybeSingle();

        if (error) {
            console.error('candidateAlertService: Update error:', error);
            throw error;
        }
        return data as CandidateAlert;
    },

    async deleteAlert(id: string) {
        const { error } = await supabase
            .from('candidate_alerts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getMatchingCandidates(filters: CandidateFilters) {
        const searchFilters: any = {};

        // Transform the complex CandidateFilters object into the simpler search params expected by candidateService
        // This mapping logic should mirror what's in CandidateSearch.tsx to ensure consistency

        if (!filters.enablePartialMatch) {
            if (filters.salary && filters.salary[0] > 0) searchFilters.min_salary = filters.salary[0];
            if (filters.salary && filters.salary[1] < 200000) searchFilters.max_salary = filters.salary[1];
            if (filters.bonus && filters.bonus[0] > 0) searchFilters.min_bonus = filters.bonus[0];

            if (filters.jobTitle) searchFilters.job_title = filters.jobTitle;

            if (filters.jobTypes && filters.jobTypes.length > 0) searchFilters.job_types = filters.jobTypes;

            if (filters.careerLevel && filters.careerLevel.length > 0) searchFilters.career_level = filters.careerLevel;

            if (filters.yearsOfExperience) {
                if (filters.yearsOfExperience[0] > 0) searchFilters.min_years_experience = filters.yearsOfExperience[0];
                if (filters.yearsOfExperience[1] < 30) searchFilters.max_years_experience = filters.yearsOfExperience[1];
            }

            if (filters.contractTerm && filters.contractTerm.length > 0) searchFilters.contract_term = filters.contractTerm;

            if (filters.languages && filters.languages.length > 0) searchFilters.languages = filters.languages;

            if (filters.skills && filters.skills.length > 0) searchFilters.skills = filters.skills;

            if (filters.drivingLicenses && filters.drivingLicenses.length > 0) searchFilters.driving_licenses = filters.drivingLicenses;

            if (filters.isRefugee) searchFilters.is_refugee = true;

            if (filters.originCountry) searchFilters.origin_country = filters.originCountry;

            if (filters.sector && filters.sector !== 'any') searchFilters.sector = filters.sector;

            if (filters.candidateStatus && filters.candidateStatus.length > 0) searchFilters.employment_status = filters.candidateStatus;

            if (filters.homeOfficePreference && filters.homeOfficePreference.length > 0) searchFilters.home_office_preference = filters.homeOfficePreference;

            if (filters.vacationDays) {
                if (filters.vacationDays[0] > 0) searchFilters.min_vacation_days = filters.vacationDays[0];
            }

            if (filters.noticePeriod && filters.noticePeriod.length > 0) searchFilters.notice_period = filters.noticePeriod;

            if (filters.customTags && filters.customTags.length > 0) searchFilters.tags = filters.customTags;

            if (filters.qualifications && filters.qualifications.length > 0) searchFilters.qualifications = filters.qualifications;

            if (filters.location.continent) searchFilters.continent = filters.location.continent;
            if (filters.location.country) searchFilters.country = filters.location.country;
            if (filters.location.cities && filters.location.cities.length > 0) searchFilters.city = filters.location.cities[0];

            if (filters.gender && filters.gender.length > 0) searchFilters.gender = filters.gender;

            if (filters.allowOverqualification) searchFilters.allow_overqualification = filters.allowOverqualification;
        }

        const data = await candidateService.searchCandidates(searchFilters, filters.workRadius || 200);
        let results = data || [];

        // Apply client-side scoring if partial matching is enabled or even if not ensuring correct sorting logic if needed
        if (filters.enablePartialMatch) {
            results = results.map(candidate => ({
                ...candidate,
                matchScore: calculateCandidateMatchScore(candidate, filters)
            })).filter(candidate => candidate.matchScore >= (filters.minMatchThreshold || 50))
                .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        }

        return results;
    }
};
