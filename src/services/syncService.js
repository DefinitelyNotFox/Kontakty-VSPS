// Cloud Relay Sync Service for Device-to-Device Profile Transfer
// Uses lightweight relay to generate short codes and QR links to transfer profile data across PC and Mobile

import {
  getActiveProfileId,
  getProfiles,
  getClassesData,
  getCustomPhotosMap,
  getNotesMap,
  getTykaniMap,
  getMemorizedMap,
  getLearningState,
  getSettings,
  setActiveProfileId
} from './storage';

const RELAY_API_URL = 'https://dpaste.com/api/v2/';

export async function generateSyncPayload(profileId = getActiveProfileId()) {
  const activeProfile = getProfiles().find(p => p.id === profileId) || { id: profileId, name: 'Honza' };
  
  const payload = {
    version: 1,
    app: 'kontakty-vsps',
    profile: activeProfile,
    classes: getClassesData(),
    customPhotos: getCustomPhotosMap(),
    notes: getNotesMap(),
    tykani: getTykaniMap(),
    memorized: getMemorizedMap(),
    learningState: getLearningState(),
    settings: getSettings(),
    exportedAt: new Date().toISOString()
  };

  const jsonString = JSON.stringify(payload);

  const formData = new URLSearchParams();
  formData.append('content', jsonString);
  formData.append('expiry_days', '14');
  formData.append('syntax', 'json');
  formData.append('title', `Kontakty VSPS Sync - ${activeProfile.name}`);

  const response = await fetch(RELAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Nepodařilo se odeslat synchronizační data na server.');
  }

  const rawUrl = (await response.text()).trim();
  // Extract paste code (e.g. from https://dpaste.com/FL52HXSLK -> FL52HXSLK)
  const syncCode = rawUrl.replace(/https?:\/\/dpaste\.com\//i, '').replace(/\.(txt|json)$/i, '').trim();

  // Create full app URL with query parameter for scanning with phone
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const syncAppUrl = `${origin}${pathname}?sync=${syncCode}`;

  return {
    syncCode,
    syncAppUrl,
    rawUrl: `https://dpaste.com/${syncCode}.txt`,
    studentCount: payload.classes.reduce((acc, c) => acc + c.students.length, 0),
    photoCount: Object.keys(payload.customPhotos).length,
    profileName: activeProfile.name
  };
}

export async function fetchSyncPayload(codeOrUrl) {
  let cleanCode = codeOrUrl.trim();
  // Clean up URL or query if user pasted a full link
  const match = cleanCode.match(/[?&]sync=([a-zA-Z0-9]+)/i) || cleanCode.match(/dpaste\.com\/([a-zA-Z0-9]+)/i);
  if (match) {
    cleanCode = match[1];
  } else {
    cleanCode = cleanCode.replace(/[^a-zA-Z0-9]/g, '');
  }

  if (!cleanCode) {
    throw new Error('Neplatný synchronizační kód.');
  }

  const fetchUrl = `https://dpaste.com/${cleanCode}.txt`;
  const response = await fetch(fetchUrl);

  if (!response.ok) {
    throw new Error('Kód nebyl nalezen nebo jeho platnost vypršela.');
  }

  const rawText = await response.text();
  try {
    const data = JSON.parse(rawText);
    if (!data || !data.classes) {
      throw new Error('Data nemají správný formát.');
    }
    return {
      data,
      syncCode: cleanCode
    };
  } catch (e) {
    throw new Error('Nepodařilo se přečíst stažená data (neplatný formát).');
  }
}

export function applySyncPayload(payload) {
  if (!payload || !payload.classes) {
    return false;
  }

  const profileId = payload.profile?.id || 'honza';
  const profileName = payload.profile?.name || 'Honza';

  // Ensure profile is registered
  const profiles = getProfiles();
  if (!profiles.some(p => p.id === profileId)) {
    const updatedProfiles = [...profiles, { id: profileId, name: profileName }];
    localStorage.setItem('vsps_profiles_list', JSON.stringify(updatedProfiles));
  }

  // Set as active profile
  setActiveProfileId(profileId);

  // Helper key
  const getKey = (k) => `vsps_${profileId}_${k}`;

  // Save all profile data
  if (payload.classes) {
    localStorage.setItem(getKey('classes_data'), JSON.stringify(payload.classes));
  }
  if (payload.customPhotos) {
    localStorage.setItem(getKey('custom_photos_map'), JSON.stringify(payload.customPhotos));
  }
  if (payload.notes) {
    localStorage.setItem(getKey('notes_map'), JSON.stringify(payload.notes));
  }
  if (payload.tykani) {
    localStorage.setItem(getKey('tykani_map'), JSON.stringify(payload.tykani));
  }
  if (payload.memorized) {
    localStorage.setItem(getKey('memorized_map'), JSON.stringify(payload.memorized));
  }
  if (payload.learningState) {
    localStorage.setItem(getKey('learning_state'), JSON.stringify(payload.learningState));
  }
  if (payload.settings) {
    localStorage.setItem(getKey('settings'), JSON.stringify(payload.settings));
  }

  return true;
}
