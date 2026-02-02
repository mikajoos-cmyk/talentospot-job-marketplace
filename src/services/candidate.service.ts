import { supabase } from '../lib/supabase';
// Wir nutzen den globalen Typ, um Konflikte zu vermeiden
import { CandidateProfile } from '../types/candidate';
import { masterDataService } from './master-data.service';
import { getCoordinates } from '../utils/geocoding';

// Wandelt leere Strings in NULL um, damit Constraints nicht verletzt werden
const val = (v: any) => (v === '' ? null : v);

export const candidateService = {
  // Data Access Requests
  async requestDataAccess(candidateId: string, employerId: string) {
    const { data, error } = await supabase
      .from('data_access_requests')
      .insert({
        candidate_id: candidateId,
        employer_id: employerId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      // If unique constraint fails (23505) or conflict (409) occurs, it means request exists.
      if (error.code === '23505' || (error as any).status === 409) return { status: 'exists' };
      throw error;
    }
    return data;
  },

  async checkDataAccess(candidateId: string, employerId: string) {
    const { data, error } = await supabase
      .from('data_access_requests')
      .select('status')
      .eq('candidate_id', candidateId)
      .eq('employer_id', employerId)
      .maybeSingle();

    if (error) return 'none'; // Or handle error
    return data?.status || 'none';
  },

  async getDataAccessRequests(candidateId: string) {
    const { data, error } = await supabase
      .from('data_access_requests')
      .select(`
        *,
        employer:employer_id (
          id,
          company_name,
          logo_url,
          description
        )
      `)
      .eq('candidate_id', candidateId)
      .eq('status', 'pending');

    if (error) throw error;
    return data;
  },

  async respondToDataAccessRequest(requestId: string, status: 'approved' | 'rejected') {
    const { data, error } = await supabase
      .from('data_access_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getEmployerAccessRequests(employerId: string) {
    const { data, error } = await supabase
      .from('data_access_requests')
      .select('candidate_id, status')
      .eq('employer_id', employerId);

    if (error) throw error;
    return { data };
  },

  // Mapping: DB (snake_case) -> Frontend (camelCase)
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
      street: data.street || '',
      houseNumber: data.house_number || '',
      postalCode: data.postal_code || '',
      state: data.state || '',
      latitude: data.latitude,
      longitude: data.longitude,
      tags: data.tags || [],
      cvUrl: data.cv_url || '',
      dateOfBirth: data.date_of_birth || '',
      nationality: data.nationality || '',
      gender: data.gender || '',
      nationalityCode: data.nationality_code || '',
      salary: {
        min: data.salary_expectation_min || 0,
        max: data.salary_expectation_max || 0
      },
      currency: data.currency || 'EUR',
      skills: data.candidate_skills?.map((item: any) => ({
        name: item.skills?.name,
        percentage: item.proficiency_percentage
      })) || [],
      qualifications: data.candidate_qualifications?.map((q: any) => q.qualifications?.name) || [],
      requirements: data.candidate_requirements?.map((r: any) => r.requirements?.name) || [],
      isRefugee: data.is_refugee,
      originCountry: data.origin_country,
      avatar: data.profiles?.avatar_url,
      videoUrl: data.video_url,
      portfolioImages: data.portfolio_images?.map((item: any) => {
        if (typeof item === 'string') {
          try {
            const parsed = JSON.parse(item);
            if (parsed && typeof parsed === 'object') {
              return {
                images: parsed.images || (parsed.image ? [parsed.image] : []),
                title: parsed.title || '',
                description: parsed.description || ''
              };
            }
          } catch (e) {
            // Not JSON
          }
          return { images: [item], title: '', description: '' };
        }
        return {
          images: item?.images || (item?.image ? [item.image] : (item?.url ? [item.url] : [])),
          title: item?.title || '',
          description: item?.description || ''
        };
      }) || [],
      sector: data.sector || '',
      careerLevel: data.career_level || '',
      employmentStatus: data.employment_status || '',
      jobTypes: data.job_type || [],
      travelWillingness: data.travel_willingness || 0,
      languages: data.candidate_languages?.map((l: any) => ({
        name: l.languages?.name,
        level: l.proficiency_level
      })) || [],
      drivingLicenses: data.driving_licenses || [],
      contractTermPreference: data.contract_type || [],
      yearsOfExperience: data.years_of_experience || 0,

      // Komplexe Objekte/Logik für Frontend-Struktur
      availableFrom: data.available_from,
      conditions: {
        entryBonus: data.desired_entry_bonus,
        startDate: data.available_from,
        noticePeriod: data.notice_period,
        salaryExpectation: {
          min: data.salary_expectation_min || 0,
          max: data.salary_expectation_max || 0
        },
        currency: data.currency || 'EUR',
        workRadius: data.work_radius_km,
        homeOfficePreference: data.home_office_preference,
        vacationDays: data.vacation_days
      },
      preferredLocations: data.candidate_preferred_locations?.map((l: any) => ({
        continent: l.continents?.name || '',
        country: l.countries?.name || '',
        city: l.cities?.name || ''
      })) || [],



      experience: data.candidate_experience?.map((exp: any) => ({
        id: exp.id,
        title: exp.job_title,
        company: exp.company_name,
        startDate: exp.start_date,
        endDate: exp.end_date,
        period: `${exp.start_date} - ${exp.end_date || 'Present'}`,
        description: exp.description
      })) || [],
      education: data.candidate_education?.map((edu: any) => ({
        id: edu.id,
        degree: edu.degree,
        institution: edu.institution,
        startDate: edu.start_date,
        endDate: edu.end_date,
        period: `${edu.start_date} - ${edu.end_date || 'Present'}`,
        description: edu.description || ''
      })) || [],
      awards: data.candidate_awards?.map((award: any) => ({
        id: award.id,
        title: award.title,
        year: award.year,
        description: award.description,
        certificateImage: award.certificate_image
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
        candidate_awards(*),
        candidate_qualifications(qualifications(id, name)),
        candidate_requirements(requirements(id, name)),
        candidate_preferred_locations(
          id,
          cities(name),
          countries(name),
          continents(name)
        )
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
    console.log('Verarbeite Profil-Stammdaten Updates:', {
      name: updates.name,
      phone: updates.phone,
      email: updates.email,
      avatar: updates.avatar
    });

    if (updates.name || updates.phone || updates.email || updates.avatar !== undefined) {
      const profileUpdates: any = {};
      if (updates.name) profileUpdates.full_name = updates.name;
      if (updates.phone) profileUpdates.phone = updates.phone;
      if (updates.avatar !== undefined) profileUpdates.avatar_url = updates.avatar;

      console.log('Führe Update auf Tabelle "profiles" aus:', profileUpdates);
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Fehler beim Update der "profiles" Tabelle:', error);
        throw error;
      }
      console.log('Update der "profiles" Tabelle erfolgreich:', updatedProfile);
    }

    // 2. Kandidaten-Details (Tabelle: candidate_profiles)
    const dbUpdates: any = {
      id: userId, // WICHTIG für Upsert!

      // Persönliche Daten
      date_of_birth: val(updates.dateOfBirth ?? updates.date_of_birth),
      gender: val(updates.gender),
      nationality: val(updates.nationality),
      address: val(updates.address),
      street: val(updates.street),
      house_number: val(updates.houseNumber ?? updates.house_number),
      state: val(updates.state),
      postal_code: val(updates.postalCode ?? updates.postal_code),
      city: val(updates.city),
      country: val(updates.country),
      is_refugee: updates.isRefugee ?? updates.is_refugee,
      origin_country: val(updates.originCountry ?? updates.origin_country),
      description: val(updates.description),
      tags: updates.tags || [],
      nationality_code: val(updates.nationalityCode ?? updates.nationality_code),

      // Berufliche Daten
      job_title: val(updates.jobTitle ?? updates.job_title ?? updates.title),
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
      currency: updates.currency || 'EUR',

      // Medien
      video_url: val(updates.videoUrl ?? updates.video_url),
      cv_url: val(updates.cvUrl ?? updates.cv_url),

      // Arrays (Listen)
      job_type: updates.jobTypes ?? updates.job_type,
      contract_type: updates.contractTermPreference ?? updates.contract_type,
      driving_licenses: updates.drivingLicenses ?? updates.driving_licenses,
      portfolio_images: (updates.portfolioImages || updates.portfolio_images)?.map((p: any) =>
        typeof p === 'object' ? JSON.stringify(p) : p
      )
    };

    // Gehaltsobjekt Fallback
    if (updates.salary) {
      dbUpdates.salary_expectation_min = updates.salary.min;
      dbUpdates.salary_expectation_max = updates.salary.max;
      if (updates.salary.currency) dbUpdates.currency = updates.salary.currency;
    }

    // --- GEOCODING (Residence / Wohnort) ---
    // Wenn Stadt gesetzt wird, hole Koordinaten (Lokal oder API)
    if (updates.city) {
      console.log(`Geocoding residence city: ${updates.city}`);

      // 1. Try finding in DB
      const { data: cityData } = await supabase
        .from('cities')
        .select('latitude, longitude')
        .ilike('name', updates.city.trim())
        .maybeSingle();

      if (cityData?.latitude && cityData?.longitude) {
        dbUpdates.latitude = cityData.latitude;
        dbUpdates.longitude = cityData.longitude;
        console.log('Geocoded residence from DB:', cityData);
      } else {
        // 2. Fallback: API Call
        console.log('Coordinates not found in DB, fetching from API...');
        const coords = await getCoordinates(updates.city, updates.country);
        if (coords) {
          dbUpdates.latitude = coords.latitude;
          dbUpdates.longitude = coords.longitude;
          console.log('Geocoded residence from API:', coords);
        } else {
          console.warn('Could not geocode residence city:', updates.city);
          dbUpdates.latitude = null;
          dbUpdates.longitude = null;
        }
      }
    }

    console.log('Sende Upsert an DB:', dbUpdates);
    const { error: profileError } = await supabase
      .from('candidate_profiles')
      .upsert(dbUpdates)
      .select();

    if (profileError) {
      console.error('Fehler beim Upsert von candidate_profiles:', profileError);
      throw profileError;
    }
    console.log('Update der "candidate_profiles" Tabelle erfolgreich');

    // Sync Master Data
    try {
      if (dbUpdates.job_title) {
        await masterDataService.syncMasterData('job_titles', [dbUpdates.job_title]);
      }
      if (dbUpdates.tags && dbUpdates.tags.length > 0) {
        await masterDataService.syncMasterData('tags', dbUpdates.tags);
      }
    } catch (e) {
      console.error('Error syncing master data tags/titles:', e);
    }

    // 3. Relationen speichern

    // --- Experience ---
    if (updates.experience && Array.isArray(updates.experience)) {
      await supabase.from('candidate_experience').delete().eq('candidate_id', userId);
      if (updates.experience.length > 0) {
        const expData = updates.experience.map((e: any) => ({
          candidate_id: userId,
          job_title: e.title || e.job_title,
          company_name: e.company || e.company_name,
          start_date: e.startDate || e.start_date || '2000-01-01', // Fallback Datum
          end_date: e.endDate || e.end_date || null,
          description: e.description,
          is_current: e.isCurrent || e.is_current || false
        }));
        await supabase.from('candidate_experience').insert(expData);
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
          description: e.description || ''
        }));
        await supabase.from('candidate_education').insert(eduData);
      }
    }

    // --- Skills (Optimiert: Case-Insensitive Suche) ---
    if (updates.skills && Array.isArray(updates.skills)) {
      await supabase.from('candidate_skills').delete().eq('candidate_id', userId);

      for (const skill of updates.skills) {
        const skillName = typeof skill === 'string' ? skill : skill.name;
        const proficiency = typeof skill === 'object' ? (skill.percentage || skill.proficiency_percentage || 0) : 0;

        if (!skillName) continue;

        let skillId;
        // Nutze ilike für Case-Insensitive Suche
        const { data: existingSkill } = await supabase
          .from('skills')
          .select('id')
          .ilike('name', skillName)
          .maybeSingle();

        if (existingSkill) {
          skillId = existingSkill.id;
        } else {
          // Versuche Insert (klappt jetzt dank neuer Policy)
          const { data: newSkill, error: insertError } = await supabase
            .from('skills')
            .insert({ name: skillName, category: 'Other' })
            .select('id')
            .single();

          if (insertError) {
            console.error('Error creating skill:', insertError);
            continue; // Überspringen bei Fehler
          }
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

    // --- Qualifications (Optimiert) ---
    if (updates.qualifications && Array.isArray(updates.qualifications)) {
      await supabase.from('candidate_qualifications').delete().eq('candidate_id', userId);

      for (const qualName of updates.qualifications) {
        if (!qualName) continue;
        let qualId;
        const { data: existing } = await supabase
          .from('qualifications')
          .select('id')
          .ilike('name', qualName)
          .maybeSingle();

        if (existing) {
          qualId = existing.id;
        } else {
          const { data: newQual, error: insertError } = await supabase
            .from('qualifications')
            .insert({ name: qualName, category: 'Other' })
            .select('id')
            .single();

          if (insertError) {
            console.error('Error creating qualification:', insertError);
            continue;
          }
          qualId = newQual?.id;
        }

        if (qualId) {
          await supabase.from('candidate_qualifications').insert({ candidate_id: userId, qualification_id: qualId });
        }
      }
    }

    // --- Requirements (Optimiert) ---
    if (updates.requirements && Array.isArray(updates.requirements)) {
      await supabase.from('candidate_requirements').delete().eq('candidate_id', userId);

      for (const reqName of updates.requirements) {
        if (!reqName) continue;
        let reqId;
        const { data: existing } = await supabase
          .from('requirements')
          .select('id')
          .ilike('name', reqName)
          .maybeSingle();

        if (existing) {
          reqId = existing.id;
        } else {
          const { data: newReq, error: insertError } = await supabase
            .from('requirements')
            .insert({ name: reqName, category: 'Other' })
            .select('id')
            .single();

          if (insertError) {
            console.error('Error creating requirement:', insertError);
            continue;
          }
          reqId = newReq?.id;
        }

        if (reqId) {
          await supabase.from('candidate_requirements').insert({ candidate_id: userId, requirement_id: reqId });
        }
      }
    }

    // --- Languages (Optimiert) ---
    if (updates.languages && Array.isArray(updates.languages)) {
      console.log('Processing languages:', updates.languages);
      await supabase.from('candidate_languages').delete().eq('candidate_id', userId);

      for (const langItem of updates.languages) {
        const langName = typeof langItem === 'string' ? langItem : langItem.name;
        const level = typeof langItem === 'object' ? (langItem.proficiency_level || langItem.level) : 'native';

        console.log('Processing language:', { langName, level, langItem });

        if (!langName) continue;

        let langId;
        const { data: existing } = await supabase
          .from('languages')
          .select('id')
          .ilike('name', langName)
          .maybeSingle();

        if (existing) {
          langId = existing.id;
        } else {
          // Generiere Dummy-Code sicher
          const code = langName.substring(0, 2).toLowerCase() + Math.floor(Math.random() * 10000);
          const { data: newLang, error: insertError } = await supabase
            .from('languages')
            .insert({ name: langName, code: code })
            .select('id')
            .single();

          if (insertError) {
            console.error('Error creating language:', insertError);
            continue;
          }
          langId = newLang?.id;
        }

        if (langId) {
          const insertData = {
            candidate_id: userId,
            language_id: langId,
            proficiency_level: level
          };
          console.log('Inserting candidate_language:', insertData);
          const { error: langError } = await supabase.from('candidate_languages').insert(insertData);
          if (langError) {
            console.error('Error inserting candidate_language:', langError);
          }
        }
      }
    }

    // --- Preferred Locations (Geocoded) ---
    if (updates.preferredLocations && Array.isArray(updates.preferredLocations)) {
      await supabase.from('candidate_preferred_locations').delete().eq('candidate_id', userId);

      for (const loc of updates.preferredLocations) {
        if (!loc.city || !loc.country || !loc.continent) continue;

        // 1. Kontinent finden oder erstellen
        let continentId;
        const { data: contData } = await supabase.from('continents').select('id').eq('name', loc.continent).maybeSingle();
        if (contData) {
          continentId = contData.id;
        } else {
          // Dummy Code generieren
          const code = loc.continent.substring(0, 2).toUpperCase() + Math.floor(Math.random() * 100);
          const { data: newCont } = await supabase.from('continents').insert({ name: loc.continent, code: code }).select('id').single();
          continentId = newCont?.id;
        }

        // 2. Land finden oder erstellen
        let countryId;
        if (continentId) {
          const { data: countryData } = await supabase.from('countries').select('id').eq('name', loc.country).maybeSingle();
          if (countryData) {
            countryId = countryData.id;
          } else {
            const code = loc.country.substring(0, 2).toUpperCase() + Math.floor(Math.random() * 100);
            const { data: newCountry } = await supabase.from('countries').insert({
              name: loc.country,
              code: code,
              continent_id: continentId
            }).select('id').single();
            countryId = newCountry?.id;
          }
        }

        // 3. Stadt finden oder erstellen (mit Geocoding)
        let cityId;
        if (countryId) {
          const { data: cityData } = await supabase.from('cities').select('id').eq('name', loc.city).maybeSingle();
          if (cityData) {
            cityId = cityData.id;
          } else {
            // New City: Get Coordinates first
            console.log(`Preferred location new city: ${loc.city}. Fetching coordinates...`);
            const coords = await getCoordinates(loc.city, loc.country);

            const cityInsert = {
              name: loc.city,
              country_id: countryId,
              latitude: coords?.latitude || null,
              longitude: coords?.longitude || null
            };

            const { data: newCity } = await supabase.from('cities').insert(cityInsert).select('id').single();
            cityId = newCity?.id;
          }
        }

        // 4. Verknüpfung speichern
        if (cityId && countryId && continentId) {
          await supabase.from('candidate_preferred_locations').insert({
            candidate_id: userId,
            city_id: cityId,
            country_id: countryId,
            continent_id: continentId
          });
        }
      }
    }

    // --- Awards (NEW) ---
    if (updates.awards && Array.isArray(updates.awards)) {
      await supabase.from('candidate_awards').delete().eq('candidate_id', userId);
      if (updates.awards.length > 0) {
        const awardsData = updates.awards.map((award: any) => ({
          candidate_id: userId,
          title: award.title,
          year: award.year,
          description: award.description,
          certificate_image: award.certificateImage
        }));
        await supabase.from('candidate_awards').insert(awardsData);
      }
    }
  },

  async searchCandidates(filters: any = {}, searchRadius?: number) {
    console.log('Searching candidates with filters:', filters);

    // 1. IDs für Preferred Locations sammeln (falls Stadt gefiltert wird)
    let preferredLocationCandidateIds: string[] = [];

    // Explicitly use the passed arg as the geographic radius
    const radius = searchRadius;

    if (filters.city) {
      // Suche in den verknüpften Tabellen nach der Stadt
      const { data: prefData } = await supabase
        .from('candidate_preferred_locations')
        .select('candidate_id, cities!inner(name)')
        .ilike('cities.name', `%${filters.city.trim()}%`);

      if (prefData) {
        preferredLocationCandidateIds = prefData.map((d: any) => d.candidate_id);
      }
    }

    // 2. RADIUS SEARCH (Refactored)
    let radiusCandidateIds: string[] | null = null;
    if (filters.city && radius) {
      console.log(`Performing Radius Search for ${filters.city} within ${radius}km`);

      // Step A: Try logic DB lookup
      let searchLat, searchLon;
      const { data: cityData } = await supabase
        .from('cities')
        .select('latitude, longitude')
        .ilike('name', filters.city.trim())
        .maybeSingle();

      if (cityData?.latitude && cityData?.longitude) {
        searchLat = cityData.latitude;
        searchLon = cityData.longitude;
      } else {
        // Step B: Use Geocoding API if DB misses coords
        const coords = await getCoordinates(filters.city, filters.country);
        if (coords) {
          searchLat = coords.latitude;
          searchLon = coords.longitude;
        }
      }

      // Step C: Execute RPC if we have coords
      if (searchLat && searchLon) {
        const { data: radiusData, error: radiusError } = await supabase.rpc('search_candidates_radius', {
          search_lat: searchLat,
          search_lon: searchLon,
          radius_km: radius
        });

        if (radiusError) {
          console.error('Error in radius search RPC:', radiusError);
        } else if (radiusData) {
          radiusCandidateIds = radiusData.map((d: any) => d.candidate_id);
          console.log(`Found ${radiusCandidateIds?.length} candidates in radius`);
        }
      } else {
        console.warn(`City coordinates not found for ${filters.city} (after DB and API check)`);
        // If we can't find coords, we can't do a radius search.
        // We will leave radiusCandidateIds as null, so it falls back to string matching.
      }
    }

    // Build the dynamic select string based on active many-to-many filters
    const selectString = `
      id,
      job_title,
      city,
      country,
      nationality,
      nationality_code,
      is_refugee,
      origin_country,
      salary_expectation_min,
      salary_expectation_max,
      desired_entry_bonus,
      available_from,
      notice_period,
      sector,
      career_level,
      employment_status,
      profiles!inner(full_name, avatar_url, email, is_visible),
      candidate_preferred_locations(
        id,
        cities(name),
        countries(name),
        continents(name)
      ),
      candidate_skills${filters.skills?.length ? '!inner' : ''}(
        id,
        proficiency_percentage,
        skills(name)
      ),
      candidate_languages${filters.languages?.length ? '!inner' : ''}(
        proficiency_level,
        languages(name)
      ),
      candidate_qualifications${filters.qualifications?.length ? '!inner' : ''}(
        qualifications(name)
      ),
      driving_licenses,
      work_radius_km
    `;

    let query = supabase
      .from('candidate_profiles')
      .select(selectString)
      .eq('profiles.is_visible', true);

    if (filters.job_title) {
      query = query.ilike('job_title', `%${filters.job_title.trim()}%`);
    }

    if (filters.sector) {
      query = query.eq('sector', filters.sector);
    }

    if (filters.city) {
      if (radiusCandidateIds !== null) {
        // RADIUS SEARCH ACTIVE:
        // Filter by the IDs returned from the RPC
        if (radiusCandidateIds.length > 0) {
          query = query.in('id', radiusCandidateIds);
        } else {
          // Radius search returned no results -> force empty result
          query = query.eq('id', '00000000-0000-0000-0000-000000000000');
        }
      } else if (preferredLocationCandidateIds.length > 0) {
        // Fallback: No Radius or City not found -> Normal Text Search including preferred locations
        const idsString = `(${preferredLocationCandidateIds.join(',')})`;
        query = query.or(`city.ilike.%${filters.city.trim()}%,id.in.${idsString}`);
      } else {
        // Keine Wunschorte gefunden -> Nur nach Wohnort filtern
        query = query.ilike('city', `%${filters.city.trim()}%`);
      }
    }

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.career_level) {
      if (Array.isArray(filters.career_level) && filters.career_level.length > 0) {
        query = query.in('career_level', filters.career_level);
      } else if (typeof filters.career_level === 'string') {
        query = query.eq('career_level', filters.career_level);
      }
    }

    if (filters.job_types && Array.isArray(filters.job_types) && filters.job_types.length > 0) {
      query = query.overlaps('job_type', filters.job_types);
    }

    if (filters.contract_term && Array.isArray(filters.contract_term) && filters.contract_term.length > 0) {
      query = query.overlaps('contract_type', filters.contract_term);
    }

    if (filters.min_years_experience !== undefined) {
      query = query.gte('years_of_experience', filters.min_years_experience);
    }

    if (filters.max_years_experience !== undefined) {
      query = query.lte('years_of_experience', filters.max_years_experience);
    }

    if (filters.min_bonus !== undefined) {
      query = query.gte('desired_entry_bonus', filters.min_bonus);
    }

    if (filters.max_bonus !== undefined) {
      query = query.lte('desired_entry_bonus', filters.max_bonus);
    }

    if (filters.work_radius !== undefined) {
      // NOTE: This filter applies to the candidate's willingness to travel (attribute),
      // NOT the radius search of the employer.
      query = query.lte('work_radius_km', filters.work_radius);
    }

    if (filters.min_travel_willingness !== undefined) {
      query = query.gte('travel_willingness', filters.min_travel_willingness);
    }

    if (filters.max_travel_willingness !== undefined) {
      query = query.lte('travel_willingness', filters.max_travel_willingness);
    }

    // --- Complex Many-To-Many Filtering via ID pre-fetching ---
    // This avoids the deeply nested relation filtering issues in PostgREST/Supabase

    // 1. Languages
    if (filters.languages?.length) {
      const orStr = filters.languages.map((l: string) => `name.ilike.%${l.trim()}%`).join(',');
      const { data: matchedLangs } = await supabase.from('languages').select('id').or(orStr);
      const ids = matchedLangs?.map(m => m.id) || [];
      if (ids.length > 0) {
        query = query.in('candidate_languages.language_id', ids);
      } else {
        // Force no results if filter matches nothing
        query = query.eq('id', '00000000-0000-0000-0000-000000000000');
      }
    }

    // 2. Skills
    if (filters.skills?.length) {
      const orStr = filters.skills.map((s: string) => `name.ilike.%${s.trim()}%`).join(',');
      const { data: matchedSkills } = await supabase.from('skills').select('id').or(orStr);
      const ids = matchedSkills?.map(m => m.id) || [];
      if (ids.length > 0) {
        query = query.in('candidate_skills.skill_id', ids);
      } else {
        query = query.eq('id', '00000000-0000-0000-0000-000000000000');
      }
    }

    // 3. Qualifications
    if (filters.qualifications?.length) {
      const orStr = filters.qualifications.map((q: string) => `name.ilike.%${q.trim()}%`).join(',');
      const { data: matchedQuals } = await supabase.from('qualifications').select('id').or(orStr);
      const ids = matchedQuals?.map(m => m.id) || [];
      if (ids.length > 0) {
        query = query.in('candidate_qualifications.qualification_id', ids);
      } else {
        query = query.eq('id', '00000000-0000-0000-0000-000000000000');
      }
    }

    if (filters.origin_country) {
      query = query.eq('origin_country', filters.origin_country);
    }

    if (filters.driving_licenses && Array.isArray(filters.driving_licenses) && filters.driving_licenses.length > 0) {
      query = query.overlaps('driving_licenses', filters.driving_licenses);
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

    if (filters.employment_status && filters.employment_status.length > 0) {
      query = query.in('employment_status', filters.employment_status);
    }

    if (filters.notice_period && filters.notice_period.length > 0) {
      query = query.in('notice_period', filters.notice_period);
    }

    if (filters.home_office_preference && filters.home_office_preference.length > 0) {
      query = query.in('home_office_preference', filters.home_office_preference);
    }

    if (filters.min_vacation_days !== undefined) {
      query = query.gte('vacation_days', filters.min_vacation_days);
    }

    if (filters.max_vacation_days !== undefined) {
      query = query.lte('vacation_days', filters.max_vacation_days);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Search error details:', error);
      throw error;
    }

    console.log(`Search returned ${data?.length || 0} candidates`);
    return data?.map((item: any) => this.mapDbToProfile(item)) || [];
  },

  async getFeaturedTalent(limit: number = 6) {
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select(`
        *,
        profiles!inner(full_name, avatar_url, is_visible),
        candidate_skills(
          skills(name)
        ),
        candidate_languages(
          proficiency_level,
          languages(name)
        ),
        candidate_qualifications(
          qualifications(name)
        )
      `)
      .eq('profiles.is_visible', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Helper Methoden
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
  }
};