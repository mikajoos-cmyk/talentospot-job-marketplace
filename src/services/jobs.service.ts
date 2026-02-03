import { supabase } from '../lib/supabase';
import { masterDataService } from './master-data.service';
import { ensureCityExists } from './candidate.service';
import { packagesService } from './packages.service';

export interface JobLanguageRequirement {
  name: string;
  level: string;
}

export interface Job {
  id?: string;
  employer_id: string;
  title: string;
  description: string;
  continent?: string;
  country?: string;
  city?: string;
  location_display?: string;
  employment_type: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  entry_bonus?: number;
  contract_duration?: string;
  required_languages?: JobLanguageRequirement[] | string[]; // Support both formats for backward compatibility
  home_office_available?: boolean;
  required_qualifications?: string[];
  required_skills?: string[];
  career_level?: string;
  experience_years?: number;
  status?: string;
  is_featured?: boolean;
  driving_licenses?: string[];
  contract_terms?: string[];
  benefits?: string[];
  vacation_days?: number;
}

export const jobsService = {
  async resolveEntities(names: string[], table: string, category: string = 'Other'): Promise<string[]> {
    if (!names || names.length === 0) return [];


    const ids: string[] = [];
    for (const name of names) {
      if (!name) continue;

      // Search by name (case-insensitive)
      const { data: existing } = await supabase
        .from(table)
        .select('id')
        .ilike('name', name)
        .maybeSingle();

      if (existing) {
        ids.push(existing.id);
      } else {
        // Create new entity
        const insertData: any = { name };
        if (table === 'languages') {
          // Generate a simple code for languages if missing
          insertData.code = name.substring(0, 2).toLowerCase() + Math.floor(Math.random() * 1000);
        } else {
          insertData.category = category;
        }

        const { data: created, error } = await supabase
          .from(table)
          .insert(insertData)
          .select('id')
          .single();

        if (!error && created) {
          ids.push(created.id);
        } else {
          console.error(`Error creating ${table} entity:`, error);
        }
      }
    }
    return ids;
  },

  async createJob(job: Job) {
    // 1. Limit Check: Darf ich überhaupt noch Jobs posten?
    const limitCheck = await packagesService.checkLimit(job.employer_id, 'jobs');
    if (!limitCheck.allowed) {
      throw new Error(limitCheck.message);
    }

    // 2. Limit Check: Wenn Featured, darf ich noch Featured Jobs posten?
    if (job.is_featured) {
      const featuredCheck = await packagesService.checkLimit(job.employer_id, 'featured_jobs');
      if (!featuredCheck.allowed) {
        throw new Error(featuredCheck.message);
      }
    }

    // Resolve names to IDs for array fields
    const resolvedJob: any = { ...job };

    // Handle required_languages separately - don't include in main insert
    const languagesWithLevels = job.required_languages;
    delete resolvedJob.required_languages;

    if (job.required_qualifications) {
      resolvedJob.required_qualifications = await this.resolveEntities(job.required_qualifications, 'qualifications');
    }
    if (job.required_skills) {
      resolvedJob.required_skills = await this.resolveEntities(job.required_skills, 'skills');
    }

    // Geocode city if provided
    if (job.city) {
      const cityData = await ensureCityExists(job.city, job.country);
      if (cityData?.latitude != null && cityData?.longitude != null) {
        resolvedJob.latitude = cityData.latitude;
        resolvedJob.longitude = cityData.longitude;
      }
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        ...resolvedJob,
        posted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // 3. Usage Increment: Zähler hochsetzen
    if (data) {
      await packagesService.incrementUsage(job.employer_id, 'jobs');
      if (job.is_featured) {
        await packagesService.incrementUsage(job.employer_id, 'featured_jobs');
      }
    }

    // Now insert language requirements with levels into junction table
    if (languagesWithLevels && languagesWithLevels.length > 0 && data.id) {
      await this.saveJobLanguageRequirements(data.id, languagesWithLevels);
    }

    // Sync Master Data
    try {
      if (job.title) await masterDataService.syncMasterData('job_titles', [job.title]);
      if (job.required_skills) await masterDataService.syncMasterData('skills', job.required_skills);
      if (job.required_qualifications) await masterDataService.syncMasterData('qualifications', job.required_qualifications);
      if (languagesWithLevels) {
        const langNames = languagesWithLevels.map((l: any) => typeof l === 'string' ? l : l.name);
        await masterDataService.syncMasterData('languages', langNames);
      }
    } catch (e) {
      console.error('Error syncing job master data:', e);
    }

    return data;
  },

  async saveJobLanguageRequirements(jobId: string, languages: JobLanguageRequirement[] | string[]) {
    // Delete existing language requirements
    await supabase.from('job_required_languages').delete().eq('job_id', jobId);

    if (!languages || languages.length === 0) return;

    for (const lang of languages) {
      const langName = typeof lang === 'string' ? lang : lang.name;
      const langLevel = typeof lang === 'object' ? lang.level : 'B2';

      // Find or create language
      let langId;
      const { data: existing } = await supabase
        .from('languages')
        .select('id')
        .ilike('name', langName)
        .maybeSingle();

      if (existing) {
        langId = existing.id;
      } else {
        const code = langName.substring(0, 2).toLowerCase() + Math.floor(Math.random() * 10000);
        const { data: newLang } = await supabase
          .from('languages')
          .insert({ name: langName, code })
          .select('id')
          .single();
        langId = newLang?.id;
      }

      // Insert junction record
      if (langId) {
        await supabase.from('job_required_languages').insert({
          job_id: jobId,
          language_id: langId,
          proficiency_level: langLevel
        });
      }
    }
  },

  async updateJob(jobId: string, updates: Partial<Job>) {
    // Resolve names to IDs for array fields
    const resolvedUpdates: any = { ...updates };

    // Handle required_languages separately
    const languagesWithLevels = updates.required_languages;
    delete resolvedUpdates.required_languages;

    if (updates.required_qualifications) {
      resolvedUpdates.required_qualifications = await this.resolveEntities(updates.required_qualifications, 'qualifications');
    }
    if (updates.required_skills) {
      resolvedUpdates.required_skills = await this.resolveEntities(updates.required_skills, 'skills');
    }

    // Geocode city if updated
    if (updates.city) {
      const cityData = await ensureCityExists(updates.city, updates.country);
      if (cityData?.latitude != null && cityData?.longitude != null) {
        resolvedUpdates.latitude = cityData.latitude;
        resolvedUpdates.longitude = cityData.longitude;
      }
    }

    const { data, error } = await supabase
      .from('jobs')
      .update(resolvedUpdates)
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw error;

    // Update language requirements if provided
    if (languagesWithLevels !== undefined) {
      await this.saveJobLanguageRequirements(jobId, languagesWithLevels as any);
    }

    // Sync Master Data
    try {
      if (updates.title) await masterDataService.syncMasterData('job_titles', [updates.title]);
      if (updates.required_skills) await masterDataService.syncMasterData('skills', updates.required_skills);
      if (updates.required_qualifications) await masterDataService.syncMasterData('qualifications', updates.required_qualifications);
      if (languagesWithLevels) {
        const langNames = (languagesWithLevels as any).map((l: any) => typeof l === 'string' ? l : l.name);
        await masterDataService.syncMasterData('languages', langNames);
      }
    } catch (e) {
      // Ignore master data sync errors (permission issues) to prevent blocking job updates
      console.warn('Warning: Could not sync master data (permissions may be missing):', e);
    }

    return data;
  },

  async deleteJob(jobId: string) {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (error) throw error;
  },

  async mapDbJobToFrontend(data: any) {
    if (!data) return null;

    // Load language requirements from junction table
    const { data: langReqs } = await supabase
      .from('job_required_languages')
      .select('proficiency_level, languages(name)')
      .eq('job_id', data.id);

    data.required_languages = (langReqs || []).map((lr: any) => ({
      name: lr.languages?.name || '',
      level: lr.proficiency_level
    }));

    // Resolve IDs back to names for array fields
    if (data.required_qualifications?.length > 0) {
      const { data: quals } = await supabase.from('qualifications').select('id, name').in('id', data.required_qualifications);
      data.required_qualifications = data.required_qualifications.map((id: string) => quals?.find(q => q.id === id)?.name || id);
    }
    if (data.required_skills?.length > 0) {
      const { data: skills } = await supabase.from('skills').select('id, name').in('id', data.required_skills);
      data.required_skills = data.required_skills.map((id: string) => skills?.find(s => s.id === id)?.name || id);
    }

    // Map company data if employer_profiles join exists
    const result = { ...data };
    if (data.employer_profiles) {
      result.company = {
        name: data.employer_profiles.company_name,
        logo: data.employer_profiles.logo_url,
        location: `${data.employer_profiles.headquarters_city || ''}, ${data.employer_profiles.headquarters_country || ''}`.replace(/^, |, $/g, ''), // Clean up if parts missing
        industry: data.employer_profiles.industry,
        size: data.employer_profiles.company_size,
        website: data.employer_profiles.website,
        email: data.employer_profiles.profiles?.email
      };
    }

    return result;
  },

  async getJobById(jobId: string) {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        employer_profiles!inner(
          id,
          company_name,
          logo_url,
          industry,
          company_size,
          website,
          headquarters_city,
          headquarters_country,
          profiles!inner (
             email
          )
        )
      `)
      .eq('id', jobId)
      .single();

    if (error) throw error;

    await supabase
      .from('jobs')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', jobId);

    return this.mapDbJobToFrontend(data);
  },

  async searchJobs(filters: any = {}, searchRadius?: number) {
    console.log('[DEBUG] searchJobs called with filters:', filters, 'radius:', searchRadius);

    let query = supabase
      .from('jobs')
      .select(`
        *,
        employer_profiles!inner(
          company_name,
          logo_url,
          profiles!inner(full_name)
        )
      `)
      .eq('status', 'active');

    if (filters.title) {
      query = query.ilike('title', `%${filters.title}%`);
    }

    if (filters.sector) {
      query = query.eq('employer_profiles.industry', filters.sector);
    }

    if (filters.city) {
      // 2. RADIUS SEARCH for Jobs
      let radiusJobIds: string[] | null = null;
      if (searchRadius) {
        console.log(`[DEBUG] Performing Radius Search for jobs in ${filters.city} within ${searchRadius}km`);
        const cityData = await ensureCityExists(filters.city, filters.country);
        console.log('[DEBUG] City data for job radius:', cityData);

        if (cityData?.latitude != null && cityData?.longitude != null) {
          console.log(`[DEBUG] Calling search_jobs_radius rpc with lat=${cityData.latitude}, lon=${cityData.longitude}, radius=${searchRadius}`);
          const { data: radiusData, error: radiusError } = await supabase.rpc('search_jobs_radius', {
            search_lat: cityData.latitude,
            search_lon: cityData.longitude,
            radius_km: searchRadius
          });

          if (radiusError) {
            console.error('[DEBUG] Error in search_jobs_radius RPC:', radiusError);
          } else if (radiusData) {
            radiusJobIds = radiusData.map((d: any) => d.id);
            console.log(`[DEBUG] Found ${radiusJobIds?.length} jobs in radius:`, radiusJobIds);
          }
        } else {
          console.warn(`[DEBUG] Could not get coords for job search in ${filters.city}`);
        }
      }

      if (radiusJobIds !== null) {
        if (radiusJobIds.length > 0) {
          query = query.in('id', radiusJobIds);
        } else {
          query = query.eq('id', '00000000-0000-0000-0000-000000000000');
        }
      } else {
        query = query.eq('city', filters.city);
      }
    }

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.continent) {
      query = query.eq('continent', filters.continent);
    }

    if (filters.employment_type) {
      if (Array.isArray(filters.employment_type) && filters.employment_type.length > 0) {
        query = query.in('employment_type', filters.employment_type);
      } else if (typeof filters.employment_type === 'string') {
        query = query.eq('employment_type', filters.employment_type);
      }
    }

    if (filters.min_salary !== undefined && filters.min_salary !== null) {
      query = query.gte('salary_min', filters.min_salary);
    }

    if (filters.max_salary !== undefined && filters.max_salary !== null) {
      query = query.lte('salary_max', filters.max_salary);
    }

    if (filters.min_entry_bonus !== undefined && filters.min_entry_bonus !== null) {
      query = query.gte('entry_bonus', filters.min_entry_bonus);
    }

    if (filters.benefits && filters.benefits.length > 0) {
      query = query.overlaps('benefits', filters.benefits);
    }

    // --- ID pre-fetching for many-to-many array filters ---
    if (filters.required_skills && filters.required_skills.length > 0) {
      const orStr = filters.required_skills.map((s: string) => `name.ilike.%${s.trim()}%`).join(',');
      const { data: matchedSkills } = await supabase.from('skills').select('id').or(orStr);
      const ids = matchedSkills?.map(m => m.id) || [];
      if (ids.length > 0) {
        query = query.overlaps('required_skills', ids);
      } else {
        query = query.eq('id', '00000000-0000-0000-0000-000000000000');
      }
    }

    if (filters.required_qualifications && filters.required_qualifications.length > 0) {
      const orStr = filters.required_qualifications.map((q: string) => `name.ilike.%${q.trim()}%`).join(',');
      const { data: matchedQuals } = await supabase.from('qualifications').select('id').or(orStr);
      const ids = matchedQuals?.map(m => m.id) || [];
      if (ids.length > 0) {
        query = query.overlaps('required_qualifications', ids);
      } else {
        query = query.eq('id', '00000000-0000-0000-0000-000000000000');
      }
    }

    if (filters.required_languages && filters.required_languages.length > 0) {
      const orStr = filters.required_languages.map((l: any) => {
        const val = typeof l === 'string' ? l : (l.name || l.value || '');
        return `name.ilike.%${val.trim()}%`;
      }).join(',');
      const { data: matchedLangs } = await supabase.from('languages').select('id').or(orStr);
      const ids = matchedLangs?.map(m => m.id) || [];
      if (ids.length > 0) {
        query = query.overlaps('required_languages', ids);
      } else {
        query = query.eq('id', '00000000-0000-0000-0000-000000000000');
      }
    }

    if (filters.contract_duration) {
      query = query.ilike('contract_duration', `%${filters.contract_duration}%`);
    }

    if (filters.career_level) {
      query = query.eq('career_level', filters.career_level);
    }

    if (filters.experience_years !== undefined && filters.experience_years !== null) {
      // Show jobs that require at most X years OR have no experience requirement set (NULL)
      query = query.or(`experience_years.lte.${filters.experience_years},experience_years.is.null`);
    }

    if (filters.driving_licenses && Array.isArray(filters.driving_licenses) && filters.driving_licenses.length > 0) {
      query = query.overlaps('driving_licenses', filters.driving_licenses);
    }

    if (filters.contract_terms && Array.isArray(filters.contract_terms) && filters.contract_terms.length > 0) {
      query = query.overlaps('contract_terms', filters.contract_terms);
    }

    if (filters.min_vacation_days !== undefined && filters.min_vacation_days !== null) {
      query = query.gte('vacation_days', filters.min_vacation_days);
    }

    if (filters.is_featured) {
      query = query.eq('is_featured', true);
    }

    if (filters.home_office_available) {
      query = query.eq('home_office_available', true);
    }

    query = query.order('posted_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    // Map multiple results
    return Promise.all((data || []).map(job => this.mapDbJobToFrontend(job)));
  },

  async getJobsByEmployer(employerId: string) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', employerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Promise.all((data || []).map(job => this.mapDbJobToFrontend(job)));
  },

  async getLatestJobs(limit: number = 10) {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        employer_profiles!inner(
          company_name,
          logo_url,
          profiles!inner(full_name)
        )
      `)
      .eq('status', 'active')
      .order('posted_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return Promise.all((data || []).map(job => this.mapDbJobToFrontend(job)));
  },

  async getFeaturedJobs(limit: number = 6) {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        employer_profiles!inner(
          company_name,
          logo_url,
          profiles!inner(full_name)
        )
      `)
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('posted_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return Promise.all((data || []).map(job => this.mapDbJobToFrontend(job)));
  },
};
