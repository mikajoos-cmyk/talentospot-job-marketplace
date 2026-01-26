import { supabase } from '../lib/supabase';
// Wir nutzen den globalen Typ, um Konflikte zu vermeiden
import { CandidateProfile } from '../types/candidate';

// Wandelt leere Strings in NULL um, damit Constraints nicht verletzt werden
const val = (v: any) => (v === '' ? null : v);


export const candidateService = {
  // Mapping: DB (snake_case) -> Frontend (camelCase)
  // Dies verhindert "undefined" Fehler im UI
  mapDbToProfile(data: any): CandidateProfile {
    return {
      id: data.id,
      name: data.profiles?.full_name || '',
      email: data.profiles?.email || '',
      phone: data.profiles?.phone || '',
      title: data.job_title || '',
      location: `${data.city || ''}, ${data.country || ''}`,
      city: data.city || '',
      country: data.country || '',
      address: data.address || '',
      dateOfBirth: data.date_of_birth || '',
      nationality: data.nationality || '',
      gender: data.gender || '',
      salary: {
        min: data.salary_expectation_min || 0,
        max: data.salary_expectation_max || 0
      },
      skills: data.candidate_skills?.map((item: any) => ({
        name: item.skills?.name,
        percentage: item.proficiency_percentage
      })) || [],
      qualifications: data.candidate_qualifications?.map((q: any) => q.qualifications?.name) || [],
      isRefugee: data.is_refugee,
      originCountry: data.origin_country,
      avatar: data.profiles?.avatar_url,
      videoUrl: data.video_url,
      portfolioImages: data.portfolio_images,
      sector: data.sector || '',
      careerLevel: data.career_level || '',
      employmentStatus: data.employment_status || '',
      jobTypes: data.job_type || [],
      travelWillingness: data.travel_willingness || 0,
      languages: data.candidate_languages?.map((l: any) => l.languages?.name) || [],
      drivingLicenses: data.driving_licenses || [],

      // Komplexe Objekte/Logik für Frontend-Struktur
      conditions: {
        entryBonus: data.desired_entry_bonus,
        startDate: data.available_from,
        noticePeriod: data.notice_period,
        salaryExpectation: {
          min: data.salary_expectation_min || 0,
          max: data.salary_expectation_max || 0
        },
        workRadius: data.work_radius_km,
        homeOfficePreference: data.home_office_preference,
        vacationDays: data.vacation_days
      },
      locationPreference: {
        continent: '', // Muss ggf. aus Relationen geladen werden
        country: '',
        cities: []
      },
      experience: data.candidate_experience?.map((exp: any) => ({
        id: exp.id,
        title: exp.job_title,
        company: exp.company_name,
        period: `${exp.start_date} - ${exp.end_date || 'Present'}`,
        description: exp.description
      })) || [],
      education: data.candidate_education?.map((edu: any) => ({
        id: edu.id,
        degree: edu.degree,
        institution: edu.institution,
        period: `${edu.start_date} - ${edu.end_date || 'Present'}`
      })) || []
    };
  },

  async getCandidateProfile(userId: string) {
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select(`
        *,
        profiles!inner(full_name, email, phone, avatar_url),
        candidate_skills(proficiency_percentage, skills(id, name)),
        candidate_languages(proficiency_level, languages(id, name)),
        candidate_experience(*),
        candidate_education(*),
        candidate_qualifications(qualifications(id, name))
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return this.mapDbToProfile(data);
  },

  async updateCandidateProfile(userId: string, updates: any) {
    console.log('Service empfängt Updates:', updates);

    // 1. Profil-Stammdaten (Tabelle: profiles)
    // Diese Daten liegen in der Auth-Tabelle 'profiles', nicht in 'candidate_profiles'
    if (updates.name || updates.phone || updates.email || updates.avatar) {
      const profileUpdates: any = {};
      if (updates.name) profileUpdates.full_name = updates.name;
      if (updates.phone) profileUpdates.phone = updates.phone;
      if (updates.avatar) profileUpdates.avatar_url = updates.avatar;

      const { error } = await supabase.from('profiles').update(profileUpdates).eq('id', userId);
      if (error) {
        console.error('Fehler beim Update von profiles:', error);
        throw error;
      }
    }

    if (updates.avatar) {
      const { error } = await supabase.from('profiles').update({ avatar_url: updates.avatar }).eq('id', userId);
      if (error) {
        console.error('Fehler beim Update von Avatar:', error);
        throw error;
      }
    }

    // 2. Kandidaten-Details (Tabelle: candidate_profiles)
    // Mapping von Frontend (camelCase) zu Datenbank (snake_case)
    const dbUpdates: any = {
      id: userId, // WICHTIG für Upsert!

      // Persönliche Daten
      date_of_birth: val(updates.dateOfBirth ?? updates.date_of_birth),
      gender: val(updates.gender),
      nationality: val(updates.nationality),
      address: val(updates.address),
      city: val(updates.city),
      country: val(updates.country),
      postal_code: val(updates.postalCode ?? updates.postal_code),
      is_refugee: updates.isRefugee ?? updates.is_refugee,
      origin_country: val(updates.originCountry ?? updates.origin_country),
      description: val(updates.description),

      // Berufliche Daten
      job_title: val(updates.jobTitle ?? updates.job_title ?? updates.title), // Fallback für 'title'
      sector: val(updates.sector),
      career_level: val(updates.careerLevel ?? updates.career_level),
      years_of_experience: updates.yearsOfExperience ?? updates.years_of_experience,
      employment_status: val(updates.employmentStatus ?? updates.employment_status),

      // Präferenzen & Konditionen
      notice_period: val(updates.noticePeriod ?? updates.notice_period),
      salary_expectation_min: updates.salaryMin ?? updates.salary_expectation_min,
      salary_expectation_max: updates.salaryMax ?? updates.salary_expectation_max,
      desired_entry_bonus: updates.entryBonus ?? updates.desired_entry_bonus,
      vacation_days: updates.vacationDays ?? updates.vacation_days,
      work_radius_km: updates.workRadius ?? updates.work_radius_km,
      travel_willingness: updates.travelWillingness ?? updates.travel_willingness,
      home_office_preference: updates.homeOfficePreference ?? updates.home_office_preference,
      available_from: val(updates.startDate ?? updates.available_from),

      // Medien
      video_url: val(updates.videoUrl ?? updates.video_url),
      cv_url: val(updates.cvUrl ?? updates.cv_url),

      // Arrays (Listen)
      // WICHTIG: Supabase erwartet Arrays für diese Spalten
      job_type: updates.jobTypes ?? updates.job_type,
      contract_type: updates.contractTypes ?? updates.contract_type,
      driving_licenses: updates.drivingLicenses ?? updates.driving_licenses,
      portfolio_images: updates.portfolio_images ?? (updates.portfolioImages ? updates.portfolioImages.map((p: any) => typeof p === 'string' ? p : p.image).filter(Boolean) : undefined)
    };

    // Gehaltsobjekt Fallback (falls Frontend { salary: { min, max } } sendet)
    if (updates.salary) {
      dbUpdates.salary_expectation_min = updates.salary.min;
      dbUpdates.salary_expectation_max = updates.salary.max;
      if (updates.salary.currency) dbUpdates.currency = updates.salary.currency;
    }

    // Upsert durchführen (Erstellt Eintrag wenn nicht vorhanden, sonst Update)
    console.log('Sende Upsert an DB:', dbUpdates);
    const { error: profileError } = await supabase
      .from('candidate_profiles')
      .upsert(dbUpdates)
      .select();

    if (profileError) {
      console.error('Fehler beim Upsert von candidate_profiles:', profileError);
      throw profileError;
    }

    // 3. Relationen speichern (Skills, Experience, Education, etc.)
    // Wir löschen alte Einträge und fügen neue hinzu (einfachste Sync-Methode)

    // --- Experience ---
    if (updates.experience && Array.isArray(updates.experience)) {
      await supabase.from('candidate_experience').delete().eq('candidate_id', userId);
      if (updates.experience.length > 0) {
        const expData = updates.experience.map((e: any) => ({
          candidate_id: userId,
          job_title: e.title || e.job_title,
          company_name: e.company || e.company_name,
          start_date: e.startDate || e.start_date || '2000-01-01', // Fallback Datumsformat beachten!
          end_date: e.endDate || e.end_date || null,
          description: e.description,
          is_current: e.isCurrent || e.is_current || false
        }));
        const { error: expError } = await supabase.from('candidate_experience').insert(expData);
        if (expError) console.error('Fehler Experience:', expError);
      }
    }

    // --- Education ---
    if (updates.education && Array.isArray(updates.education)) {
      await supabase.from('candidate_education').delete().eq('candidate_id', userId);
      if (updates.education.length > 0) {
        const eduData = updates.education.map((e: any) => ({
          candidate_id: userId,
          degree: e.degree,
          institution: e.institution,
          start_date: e.startDate || e.start_date || '2000-01-01',
          end_date: e.endDate || e.end_date || null,
          description: e.description
        }));
        const { error: eduError } = await supabase.from('candidate_education').insert(eduData);
        if (eduError) console.error('Fehler Education:', eduError);
      }
    }

    // --- Skills ---
    if (updates.skills && Array.isArray(updates.skills)) {
      await supabase.from('candidate_skills').delete().eq('candidate_id', userId);

      for (const skill of updates.skills) {
        // Name auslesen (entweder String oder Objekt)
        const skillName = typeof skill === 'string' ? skill : skill.name;
        const proficiency = typeof skill === 'object' ? (skill.percentage || skill.proficiency_percentage || 0) : 0;

        if (!skillName) continue;

        // Skill ID finden oder erstellen
        let skillId;
        const { data: existingSkill } = await supabase.from('skills').select('id').eq('name', skillName).maybeSingle();

        if (existingSkill) {
          skillId = existingSkill.id;
        } else {
          const { data: newSkill } = await supabase.from('skills').insert({ name: skillName, category: 'Other' }).select('id').single();
          skillId = newSkill?.id;
        }

        if (skillId) {
          await supabase.from('candidate_skills').insert({
            candidate_id: userId,
            skill_id: skillId,
            proficiency_percentage: proficiency
          });
        }
      }
    }

    // --- Languages ---
    if (updates.languages && Array.isArray(updates.languages)) {
      await supabase.from('candidate_languages').delete().eq('candidate_id', userId);

      for (const langItem of updates.languages) {
        const langName = typeof langItem === 'string' ? langItem : langItem.name;
        const level = typeof langItem === 'object' ? (langItem.level || langItem.proficiency_level) : 'native';

        if (!langName) continue;

        let langId;
        const { data: existing } = await supabase.from('languages').select('id').eq('name', langName).maybeSingle();

        if (existing) {
          langId = existing.id;
        } else {
          // Fallback Code generieren (nur erste 2 Buchstaben), da 'code' unique ist
          const code = langName.substring(0, 2).toLowerCase() + Math.floor(Math.random() * 100);
          const { data: newLang } = await supabase.from('languages').insert({ name: langName, code: code }).select('id').single();
          langId = newLang?.id;
        }

        if (langId) {
          await supabase.from('candidate_languages').insert({
            candidate_id: userId,
            language_id: langId,
            proficiency_level: level
          });
        }
      }
    }

    // --- Preferred Locations ---
    if (updates.preferredLocations && Array.isArray(updates.preferredLocations)) {
      await supabase.from('candidate_preferred_locations').delete().eq('candidate_id', userId);

      for (const loc of updates.preferredLocations) {
        // Find City ID
        const { data: cityData } = await supabase
          .from('cities')
          .select('id, country_id')
          .eq('name', loc.city)
          .maybeSingle();

        if (cityData) {
          const cityId = cityData.id;
          const countryId = cityData.country_id;

          // Find Continent ID
          const { data: countryData } = await supabase
            .from('countries')
            .select('continent_id')
            .eq('id', countryId)
            .single();

          const continentId = countryData?.continent_id;

          if (cityId && countryId && continentId) {
            await supabase.from('candidate_preferred_locations').insert({
              candidate_id: userId,
              city_id: cityId,
              country_id: countryId,
              continent_id: continentId
            });
          }
        } else {
          console.warn(`Location not found in DB: ${loc.city}, ${loc.country}`);
        }
      }
    }
  },

  async searchCandidates(filters: any = {}) {
    let query = supabase
      .from('candidate_profiles')
      .select(`
        *,
        profiles!inner(full_name, avatar_url, email),
        candidate_skills(
          id,
          skills(id, name)
        )
      `);

    if (filters.job_title) {
      query = query.ilike('job_title', `%${filters.job_title}%`);
    }

    if (filters.sector) {
      query = query.eq('sector', filters.sector);
    }

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.career_level) {
      query = query.eq('career_level', filters.career_level);
    }

    if (filters.min_salary) {
      query = query.gte('salary_expectation_min', filters.min_salary);
    }

    if (filters.max_salary) {
      query = query.lte('salary_expectation_max', filters.max_salary);
    }

    if (filters.is_refugee !== undefined) {
      query = query.eq('is_refugee', filters.is_refugee);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  // Helper Methoden für Relationen
  async getCandidateSkills(candidateId: string) {
    const { data, error } = await supabase
      .from('candidate_skills')
      .select(`*, skills(*)`)
      .eq('candidate_id', candidateId);
    if (error) throw error;
    return data;
  },

  async addCandidateSkill(candidateId: string, skillId: string, proficiency: number) {
    const { data, error } = await supabase
      .from('candidate_skills')
      .insert({
        candidate_id: candidateId,
        skill_id: skillId,
        proficiency_percentage: proficiency,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async addCandidateExperience(candidateId: string, experience: any) {
    const { data, error } = await supabase
      .from('candidate_experience')
      .insert({
        candidate_id: candidateId,
        ...experience,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async addCandidateEducation(candidateId: string, education: any) {
    const { data, error } = await supabase
      .from('candidate_education')
      .insert({
        candidate_id: candidateId,
        ...education,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getFeaturedTalent(limit: number = 6) {
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select(`
        *,
        profiles!inner(full_name, avatar_url),
        candidate_skills(
          skills(name)
        )
      `)
      .limit(limit);

    if (error) throw error;
    return data;
  },
};