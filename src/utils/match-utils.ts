/**
 * Utility functions for calculating match scores between candidates and jobs.
 */

import { meetsLanguageRequirement } from './language-levels';

/**
 * Calculates the Haversine distance between two points in kilometers.
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
};

export interface MatchScoreResult {
    score: number; // 0 to 100
    matchedCriteria: string[];
    totalCriteria: number;
}

/**
 * Calculates how well a job matches a candidate's profile/filters.
 * @param job - The job to evaluate
 * @param filters - The candidate's filter criteria
 * @param flexibleMode - If true, being overqualified counts as full match
 */
export const calculateJobMatchScore = (job: any, filters: any, flexibleMode: boolean = false): number => {
    let matched = 0;
    let total = 0;

    // Title match (weighted higher)
    if (filters.title && filters.title.trim() !== '') {
        total += 2;
        if (job.title?.toLowerCase().includes(filters.title.toLowerCase())) {
            matched += 2;
        } else if (!job.title) {
            matched += 1; // Partial credit for missing job title
        }
    }

    // Sector
    if (filters.sector && filters.sector !== '' && filters.sector !== 'all') {
        total += 1;
        if (job.company?.industry === filters.sector) {
            matched += 1;
        } else if (!job.company?.industry) {
            matched += 0.5;
        }
    }

    // Range-based matches (Salary) - Only if not at defaults
    if (filters.salaryRange && (filters.salaryRange[0] > 0 || filters.salaryRange[1] < 250000)) {
        total += 1;
        const [min, max] = filters.salaryRange;
        if (job.salary_max >= min && job.salary_min <= max) {
            matched += 1;
        } else if (!job.salary_min && !job.salary_max) {
            matched += 0.5; // Neutral match if unknown
        }
    }

    // Location Scoring (Distance-based when coordinates available)
    // Check if we have coordinates to do distance-based scoring
    const hasJobCoords = job.latitude != null && job.longitude != null;
    const hasFilterCoords = filters.latitude != null && filters.longitude != null;

    if (hasJobCoords && hasFilterCoords) {
        // Distance-based scoring (similar to candidate scoring)
        total += 2;
        const distance = calculateDistance(
            filters.latitude,
            filters.longitude,
            job.latitude,
            job.longitude
        );

        const radius = filters.workRadius || 50;

        if (distance <= radius) {
            matched += 2; // Within radius -> Full points
        } else if (distance <= radius * 2) {
            matched += 1; // Within double radius -> 1 point
        } else if (distance <= radius * 4) {
            matched += 0.5; // Within quadruple radius -> 0.5 points
        }
        // Beyond that, 0 points
    } else if (filters.city && filters.city !== '' && filters.city !== 'all') {
        // Fallback: String-based city matching if no coordinates
        total += 1;
        if (job.city === filters.city) {
            matched += 1;
        } else if (!job.city) {
            matched += 0.5;
        }
    } else if (filters.country && filters.country !== '' && filters.country !== 'all') {
        // Fallback: Country matching
        total += 1;
        if (job.country === filters.country) {
            matched += 1;
        } else if (!job.country) {
            matched += 0.5;
        }
    }

    // Skills - Different logic based on flexible mode
    if (filters.skills && filters.skills.length > 0) {
        const jobSkills = (job.required_skills || []).map((s: string) => s.toLowerCase());

        if (flexibleMode) {
            // Flexible mode: Job with no requirements OR candidate has all required -> full match
            total += 1;
            if (jobSkills.length === 0) {
                matched += 1; // Overqualified but suitable
            } else {
                const hasAllRequiredSkills = jobSkills.every((jobSkill: string) =>
                    filters.skills.some((candidateSkill: string) =>
                        candidateSkill.toLowerCase().includes(jobSkill) ||
                        jobSkill.includes(candidateSkill.toLowerCase())
                    )
                );
                if (hasAllRequiredSkills) matched += 1;
            }
        } else {
            // Normal mode: Each skill is scored individually
            total += filters.skills.length;
            filters.skills.forEach((skill: string) => {
                if (jobSkills.some((s: string) => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s))) {
                    matched += 1;
                } else if (jobSkills.length === 0) {
                    matched += 0.5;
                }
            });
        }
    }

    // Qualifications - Same logic as skills
    if (filters.qualifications && filters.qualifications.length > 0) {
        const jobQuals = (job.required_qualifications || []).map((q: string) => q.toLowerCase());

        if (flexibleMode) {
            total += 1;
            if (jobQuals.length === 0) {
                matched += 1;
            } else {
                const hasAllRequiredQuals = jobQuals.every((jobQual: string) =>
                    filters.qualifications.some((candidateQual: string) =>
                        candidateQual.toLowerCase().includes(jobQual) ||
                        jobQual.includes(candidateQual.toLowerCase())
                    )
                );
                if (hasAllRequiredQuals) matched += 1;
            }
        } else {
            total += filters.qualifications.length;
            filters.qualifications.forEach((qual: string) => {
                if (jobQuals.some((q: string) => q.includes(qual.toLowerCase()) || qual.toLowerCase().includes(q))) {
                    matched += 1;
                } else if (jobQuals.length === 0) {
                    matched += 0.5;
                }
            });
        }
    }

    // Languages - Consider proficiency levels
    if (filters.languages && filters.languages.length > 0) {
        const jobLangs = job.required_languages || [];

        if (flexibleMode) {
            total += 1;
            if (jobLangs.length === 0) {
                matched += 1;
            } else {
                // Check if candidate has ALL required languages at sufficient level
                const hasAllRequiredLangs = jobLangs.every((jobLang: any) => {
                    const jobLangName = typeof jobLang === 'string' ? jobLang : jobLang.name;
                    const jobLangLevel = typeof jobLang === 'object' ? jobLang.level : 'B2';

                    return filters.languages.some((candidateLang: any) => {
                        const candidateLangName = typeof candidateLang === 'string' ? candidateLang : candidateLang.name;
                        const candidateLangLevel = typeof candidateLang === 'object' ? candidateLang.level : 'B2';

                        const nameMatch = candidateLangName.toLowerCase() === jobLangName.toLowerCase();
                        const levelMatch = meetsLanguageRequirement(candidateLangLevel, jobLangLevel);

                        return nameMatch && levelMatch;
                    });
                });
                if (hasAllRequiredLangs) matched += 1;
            }
        } else {
            total += filters.languages.length;
            filters.languages.forEach((candidateLang: any) => {
                const candidateLangName = typeof candidateLang === 'string' ? candidateLang : candidateLang.name;
                const candidateLangLevel = typeof candidateLang === 'object' ? candidateLang.level : 'B2';

                const hasMatch = jobLangs.some((jobLang: any) => {
                    const jobLangName = typeof jobLang === 'string' ? jobLang : jobLang.name;
                    const jobLangLevel = typeof jobLang === 'object' ? jobLang.level : 'B2';

                    const nameMatch = candidateLangName.toLowerCase() === jobLangName.toLowerCase();
                    const levelMatch = meetsLanguageRequirement(candidateLangLevel, jobLangLevel);

                    return nameMatch && levelMatch;
                });

                if (hasMatch) {
                    matched += 1;
                } else if (jobLangs.length === 0) {
                    matched += 0.5;
                }
            });
        }
    }

    // Employment Type
    if (filters.employmentTypes && filters.employmentTypes.length > 0) {
        total += 1;
        if (filters.employmentTypes.includes(job.employment_type)) {
            matched += 1;
        } else if (!job.employment_type) {
            matched += 0.5;
        }
    }

    // Experience - In flexible mode, more experience is always good
    if (filters.experienceYears !== null && filters.experienceYears !== undefined) {
        total += 1;
        if (job.experience_years === null || job.experience_years === undefined) {
            matched += 0.5;
        } else if (flexibleMode) {
            // Flexible: candidate with more or equal experience matches
            if (filters.experienceYears >= job.experience_years) matched += 1;
        } else {
            // Normal: job requires less or equal experience than candidate has
            if (job.experience_years <= filters.experienceYears) matched += 1;
        }
    }

    // Career Level
    if (filters.careerLevel && filters.careerLevel !== '' && filters.careerLevel !== 'all') {
        total += 1;
        if (job.career_level === filters.careerLevel) {
            matched += 1;
        } else if (!job.career_level) {
            matched += 0.5;
        }
    }

    // Bonus
    if (filters.minEntryBonus && filters.minEntryBonus > 0) {
        total += 1;
        if ((job.entry_bonus || 0) >= filters.minEntryBonus) {
            matched += 1;
        } else if (!job.entry_bonus) {
            matched += 0.5;
        }
    }

    // Vacation Days
    if (filters.minVacationDays && filters.minVacationDays > 0) {
        total += 1;
        if ((job.vacation_days || 0) >= filters.minVacationDays) {
            matched += 1;
        } else if (!job.vacation_days) {
            matched += 0.5;
        }
    }

    // Driving Licenses - Same logic as skills
    if (filters.drivingLicenses && filters.drivingLicenses.length > 0) {
        const jobLicenses = job.driving_licenses || [];

        if (flexibleMode) {
            total += 1;
            if (jobLicenses.length === 0) {
                matched += 1;
            } else {
                const hasAllRequiredLicenses = jobLicenses.every((lic: string) =>
                    filters.drivingLicenses.includes(lic)
                );
                if (hasAllRequiredLicenses) matched += 1;
            }
        } else {
            total += 1;
            if (jobLicenses.length === 0) {
                matched += 0.5;
            } else {
                const hasAllRequiredLicenses = jobLicenses.every((lic: string) =>
                    filters.drivingLicenses.includes(lic)
                );
                if (hasAllRequiredLicenses) matched += 1;
            }
        }
    }

    // Contract Terms
    if (filters.contractTerms && filters.contractTerms.length > 0) {
        total += 1;
        const jobTerms = job.contract_terms || [];
        if (filters.contractTerms.some((t: string) => jobTerms.includes(t))) {
            matched += 1;
        } else if (jobTerms.length === 0) {
            matched += 0.5;
        }
    }

    // Contract Duration
    if (filters.contractDuration && filters.contractDuration !== '') {
        total += 1;
        if (job.contract_duration === filters.contractDuration) {
            matched += 1;
        } else if (!job.contract_duration) {
            matched += 0.5;
        }
    }

    // Home Office
    if (filters.homeOffice === true) {
        total += 1;
        if (job.home_office_available) {
            matched += 1;
        } else if (job.home_office_available === null || job.home_office_available === undefined) {
            matched += 0.5;
        }
    }

    // Benefits
    if (filters.benefits && filters.benefits.length > 0) {
        total += filters.benefits.length;
        const jobBenefits = (job.benefits || []).map((b: string) => b.toLowerCase());

        filters.benefits.forEach((benefit: string) => {
            if (jobBenefits.some((b: string) => b.includes(benefit.toLowerCase()) || benefit.toLowerCase().includes(b))) {
                matched += 1;
            }
        });
    }

    if (total === 0) return 100;
    return Math.round((matched / total) * 100);
};

/**
 * Calculates how well a candidate matches an employer's search filters.
 */
export const calculateCandidateMatchScore = (candidate: any, filters: any): number => {
    let matched = 0;
    let total = 0;

    // Title match
    if (filters.jobTitle && filters.jobTitle.trim() !== '') {
        total += 2;
        const candidateTitle = candidate.job_title || candidate.jobTitle || candidate.title || '';
        if (candidateTitle.toLowerCase().includes(filters.jobTitle.toLowerCase())) {
            matched += 2;
        }
    }

    // Sector match
    if (filters.sector && filters.sector !== '') {
        total += 1;
        const candidateSector = candidate.sector || '';
        if (candidateSector.toLowerCase() === filters.sector.toLowerCase()) {
            matched += 1;
        }
    }

    // Gender match
    if (filters.gender && filters.gender.length > 0) {
        total += 1;
        const candidateGender = candidate.gender || '';
        if (filters.gender.includes(candidateGender.toLowerCase())) {
            matched += 1;
        }
    }

    // Candidate Status match
    if (filters.candidateStatus && filters.candidateStatus.length > 0) {
        total += 1;
        const candidateStatus = candidate.employment_status || candidate.employmentStatus || '';
        if (filters.candidateStatus.includes(candidateStatus)) {
            matched += 1;
        }
    }

    // Salary Recommendation
    if (filters.salary && (filters.salary[0] > 20000 || filters.salary[1] < 200000)) {
        total += 1;
        const [min, max] = filters.salary;
        const salaryMin = candidate.salary_expectation_min || candidate.salary?.min || 0;
        const salaryMax = candidate.salary_expectation_max || candidate.salary?.max || 0;
        if (salaryMin <= max && salaryMax >= min) {
            matched += 1;
        }
    }

    // Bonus
    if (filters.bonus && (filters.bonus[0] > 0 || filters.bonus[1] < 100000)) {
        total += 1;
        const [min, max] = filters.bonus;
        const candidateBonus = candidate.desired_entry_bonus || candidate.conditions?.entryBonus || 0;
        if (candidateBonus >= min && candidateBonus <= max) {
            matched += 1;
        }
    }

    // Vacation Days
    if (filters.vacationDays && (filters.vacationDays[0] > 0 || filters.vacationDays[1] < 50)) {
        total += 1;
        const [min, max] = filters.vacationDays;
        const candidateVacation = candidate.vacation_days || candidate.conditions?.vacationDays || 0;
        if (candidateVacation >= min && candidateVacation <= max) {
            matched += 1;
        }
    }

    // Skills - Each skill must match individually
    if (filters.skills && filters.skills.length > 0) {
        total += filters.skills.length;
        const candSkills = (candidate.candidate_skills || candidate.skills || []).map((s: any) =>
            typeof s === 'string' ? s : (s.skills?.name || s.name || '')
        );
        filters.skills.forEach((skill: string) => {
            if (candSkills.some((s: string) => typeof s === 'string' && s.toLowerCase().includes(skill.toLowerCase()))) {
                matched += 1;
            }
        });
    }

    // Qualifications - Each qualification must match individually
    if (filters.qualifications && filters.qualifications.length > 0) {
        total += filters.qualifications.length;
        const candQuals = (candidate.candidate_qualifications || candidate.qualifications || []).map((q: any) =>
            typeof q === 'string' ? q : (q.qualifications?.name || q.name || '')
        );
        filters.qualifications.forEach((qual: string) => {
            if (candQuals.some((q: string) => typeof q === 'string' && q.toLowerCase().includes(qual.toLowerCase()))) {
                matched += 1;
            }
        });
    }

    // Languages - Consider proficiency levels and hierarchy
    if (filters.languages && filters.languages.length > 0) {
        total += filters.languages.length;

        // Get candidate languages with levels
        const candLangs = (candidate.candidate_languages || candidate.languages || []).map((l: any) => {
            if (typeof l === 'string') {
                return { name: l, level: 'native' };
            }
            return {
                name: l.languages?.name || l.name || '',
                level: l.proficiency_level || l.level || 'native'
            };
        });

        filters.languages.forEach((filterLang: any) => {
            const filterLangName = typeof filterLang === 'string' ? filterLang : filterLang.name;
            const filterLangLevel = typeof filterLang === 'object' ? filterLang.level : 'B2';

            const hasMatch = candLangs.some((candLang: any) => {
                const nameMatch = candLang.name.toLowerCase().includes(filterLangName.toLowerCase());
                const levelMatch = meetsLanguageRequirement(candLang.level, filterLangLevel);
                return nameMatch && levelMatch;
            });

            if (hasMatch) {
                matched += 1;
            }
        });
    }

    // Job Types
    if (filters.jobTypes && filters.jobTypes.length > 0) {
        total += 1;
        const candJobTypes = candidate.job_type || candidate.jobTypes || [];
        if (filters.jobTypes.some((t: string) => candJobTypes.includes(t))) {
            matched += 1;
        }
    }

    // Career Level
    if (filters.careerLevel && filters.careerLevel.length > 0) {
        total += 1;
        const candidateLevel = candidate.career_level || candidate.careerLevel || '';
        if (filters.careerLevel.includes(candidateLevel)) {
            matched += 1;
        }
    }

    // Years of Experience
    if (filters.yearsOfExperience && (filters.yearsOfExperience[0] > 0 || filters.yearsOfExperience[1] < 30)) {
        total += 1;
        const [min, max] = filters.yearsOfExperience;
        const candidateYears = candidate.years_of_experience || candidate.yearsOfExperience || 0;

        if (filters.allowOverqualification) {
            if (candidateYears >= min) {
                matched += 1;
            }
        } else {
            if (candidateYears >= min && candidateYears <= max) {
                matched += 1;
            }
        }
    }

    // Notice Period
    if (filters.noticePeriod && filters.noticePeriod.length > 0) {
        total += 1;
        const candidateNotice = candidate.notice_period || candidate.conditions?.noticePeriod || '';
        if (filters.noticePeriod.includes(candidateNotice)) {
            matched += 1;
        }
    }

    // Contract Term
    if (filters.contractTerm && filters.contractTerm.length > 0) {
        total += 1;
        const candContractTypes = candidate.contract_type || candidate.contractTermPreference || [];
        if (filters.contractTerm.some((t: string) => candContractTypes.includes(t))) {
            matched += 1;
        }
    }

    // Home Office Preference
    if (filters.homeOfficePreference && filters.homeOfficePreference.length > 0) {
        total += 1;
        const candidateHomeOffice = candidate.home_office_preference || candidate.conditions?.homeOfficePreference || '';
        if (filters.homeOfficePreference.includes(candidateHomeOffice)) {
            matched += 1;
        }
    }

    // Travel Willingness
    if (filters.travelWillingness && (filters.travelWillingness[0] > 0 || filters.travelWillingness[1] < 100)) {
        total += 1;
        const [min, max] = filters.travelWillingness;
        const candidateTravel = candidate.travel_willingness || candidate.travelWillingness || 0;
        if (candidateTravel >= min && candidateTravel <= max) {
            matched += 1;
        }
    }

    // Driving Licenses - Each license is scored individually
    if (filters.drivingLicenses && filters.drivingLicenses.length > 0) {
        total += filters.drivingLicenses.length;
        const candLicenses = candidate.driving_licenses || candidate.drivingLicenses || [];
        filters.drivingLicenses.forEach((license: string) => {
            if (candLicenses.includes(license)) {
                matched += 1;
            }
        });
    }

    // Location matching is handled by radius search in the database query
    // We don't need to match preferred work locations in the score calculation

    // Custom Tags - Each tag must match individually
    if (filters.customTags && filters.customTags.length > 0) {
        total += filters.customTags.length;
        const candidateTags = candidate.tags || [];
        filters.customTags.forEach((tag: string) => {
            if (candidateTags.some((t: string) => t.toLowerCase() === tag.toLowerCase())) {
                matched += 1;
            }
        });
    }

    // Refugee Status
    if (filters.isRefugee === true) {
        total += 1;
        const candidateRefugee = candidate.is_refugee || candidate.isRefugee || false;
        if (candidateRefugee) matched += 1;
    }

    // Origin Country
    if (filters.originCountry && filters.originCountry !== '') {
        total += 1;
        const candidateOrigin = candidate.origin_country || candidate.originCountry || '';
        if (candidateOrigin.toLowerCase() === filters.originCountry.toLowerCase()) {
            matched += 1;
        }
    }

    // Location Scoring (Distance-based)
    // If a city is selected, we calculate a score based on distance.
    // This is NOT an exclusion criterion anymore, but adds to the score.
    if (filters.location && filters.location.latitude && filters.location.longitude) {
        total += 2; // Weight location match with 2 points
        const candLat = candidate.latitude;
        const candLon = candidate.longitude;

        if (candLat && candLon) {
            const distance = calculateDistance(
                filters.location.latitude,
                filters.location.longitude,
                candLat,
                candLon
            );

            const radius = filters.workRadius || 50;

            if (distance <= radius) {
                // Within radius -> Full points
                matched += 2;
            } else if (distance <= radius * 2) {
                // Within double radius -> 1 point (partial match)
                matched += 1;
            } else if (distance <= radius * 4) {
                // Within quadruple radius -> 0.5 points
                matched += 0.5;
            }
            // Beyond that, 0 points
        }
        // If candidate has no coords, they get 0 points (but total is still incremented)
    } else if (filters.location && filters.location.cities && filters.location.cities.length > 0) {
        // Fallback for city text match if no coordinates available (for CandidateFilters structure)
        total += 1;
        const filterCity = filters.location.cities[0];
        const candCity = candidate.city || '';
        if (candCity.toLowerCase().includes(filterCity.toLowerCase())) {
            matched += 1;
        }
    } else if (filters.city && filters.city !== '') {
        // Fallback for city text match if no coordinates available (for JobFilters structure)
        total += 1;
        const candCity = candidate.city || '';
        if (candCity.toLowerCase().includes(filters.city.toLowerCase())) {
            matched += 1;
        }
    }

    if (total === 0) return 100;
    return Math.round((matched / total) * 100);
};

