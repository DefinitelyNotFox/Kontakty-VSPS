// Local Device Storage Service with Multi-Teacher Support & Memorized Tracking
// Stores Tykání, personal notes, custom photos, classes, memorized status, and learning progress

import { HONZA_CLASSES_DATA } from '../data/honzaClassesData';

const PROFILES_KEY = 'vsps_profiles_list';
const ACTIVE_PROFILE_KEY = 'vsps_active_profile_id';

const DEFAULT_PROFILES = [{ id: 'honza', name: 'Honza' }];

// --- Teacher Profile Management ---
export function getProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(DEFAULT_PROFILES));
      return DEFAULT_PROFILES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(DEFAULT_PROFILES));
      return DEFAULT_PROFILES;
    }
    // If 'honza' is missing in existing profiles, prepend it
    if (!parsed.some(p => p.id === 'honza')) {
      const updated = [{ id: 'honza', name: 'Honza' }, ...parsed.filter(p => p.id !== 'default')];
      localStorage.setItem(PROFILES_KEY, JSON.stringify(updated));
      return updated;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_PROFILES;
  }
}

export function getActiveProfileId() {
  try {
    const id = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (!id || id === 'default') {
      localStorage.setItem(ACTIVE_PROFILE_KEY, 'honza');
      return 'honza';
    }
    return id;
  } catch (e) {
    return 'honza';
  }
}

export function setActiveProfileId(profileId) {
  localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
  return profileId;
}

export function createProfile(profileName) {
  const profiles = getProfiles();
  const newProfile = {
    id: `profile_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: profileName.trim()
  };
  const updated = [...profiles, newProfile];
  localStorage.setItem(PROFILES_KEY, JSON.stringify(updated));
  setActiveProfileId(newProfile.id);
  return { profiles: updated, activeId: newProfile.id };
}

export function deleteProfile(profileId) {
  if (profileId === 'honza') return getProfiles();
  const profiles = getProfiles().filter(p => p.id !== profileId);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  if (getActiveProfileId() === profileId) {
    setActiveProfileId('honza');
  }
  return profiles;
}

// Helper to prefix keys by active profile
function getKey(baseKey) {
  const profileId = getActiveProfileId();
  return `vsps_${profileId}_${baseKey}`;
}

// --- Tykání Storage ---
export function getTykaniMap() {
  try {
    const raw = localStorage.getItem(getKey('tykani_map'));
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveTykani(contactId, isTykani) {
  const map = getTykaniMap();
  map[contactId] = isTykani;
  localStorage.setItem(getKey('tykani_map'), JSON.stringify(map));
  return map;
}

// --- Memorized / Mastered Tracking ("Pamatuji si") ---
export function getMemorizedMap() {
  try {
    const raw = localStorage.getItem(getKey('memorized_map'));
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveMemorized(contactId, isMemorized) {
  const map = getMemorizedMap();
  if (isMemorized) {
    map[contactId] = true;
  } else {
    delete map[contactId];
  }
  localStorage.setItem(getKey('memorized_map'), JSON.stringify(map));
  return map;
}

// --- Personal Notes Storage ---
export function getNotesMap() {
  try {
    const raw = localStorage.getItem(getKey('notes_map'));
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveNote(contactId, noteText) {
  const map = getNotesMap();
  if (noteText && noteText.trim()) {
    map[contactId] = noteText.trim();
  } else {
    delete map[contactId];
  }
  localStorage.setItem(getKey('notes_map'), JSON.stringify(map));
  return map;
}

// --- Custom Photos Storage ---
export function getCustomPhotosMap() {
  try {
    const raw = localStorage.getItem(getKey('custom_photos_map'));
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveCustomPhoto(contactId, photoUrl) {
  const map = getCustomPhotosMap();
  if (photoUrl && photoUrl.trim()) {
    map[contactId] = photoUrl.trim();
  } else {
    delete map[contactId];
  }
  localStorage.setItem(getKey('custom_photos_map'), JSON.stringify(map));
  return map;
}

// --- Classes & Students Storage (Profile-specific) ---
export function getClassesData() {
  try {
    const activeProfile = getActiveProfileId();
    const raw = localStorage.getItem(getKey('classes_data'));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (activeProfile === 'honza' && Array.isArray(parsed)) {
        // Ensure "S1 Celá" is present in Honza's classes
        const s1CelaClass = HONZA_CLASSES_DATA.find(c => c.name === 'S1 Celá');
        if (s1CelaClass && !parsed.some(c => c.name === 'S1 Celá' || c.id === 'class_s1_cela')) {
          const updated = [s1CelaClass, ...parsed];
          localStorage.setItem(getKey('classes_data'), JSON.stringify(updated));
          return updated;
        }
      }
      return parsed;
    }
    // If Honza profile and no custom storage yet -> initialize with pre-loaded classes!
    if (activeProfile === 'honza') {
      localStorage.setItem(getKey('classes_data'), JSON.stringify(HONZA_CLASSES_DATA));
      return HONZA_CLASSES_DATA;
    }
    return [];
  } catch (e) {
    return activeProfile === 'honza' ? HONZA_CLASSES_DATA : [];
  }
}

export function saveClassesData(classes) {
  localStorage.setItem(getKey('classes_data'), JSON.stringify(classes));
  return classes;
}

export function addClass(className) {
  const classes = getClassesData();
  const cleanName = className.trim();
  const newClass = {
    id: `class_${Date.now()}`,
    name: cleanName,
    students: []
  };
  const updated = [...classes, newClass];
  saveClassesData(updated);
  return updated;
}

export function deleteClass(classId) {
  const classes = getClassesData();
  const updated = classes.filter(c => c.id !== classId);
  saveClassesData(updated);
  return updated;
}

export function addStudentToClass(classId, studentData) {
  const classes = getClassesData();
  const updated = classes.map(c => {
    if (c.id === classId) {
      const newStudent = {
        id: `student_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: studentData.name.trim(),
        role: `Žák třídy ${c.name}`,
        category: `Žáci (${c.name})`,
        cabinet: `Třída ${c.name}`,
        hasPhoto: !!studentData.photoUrl,
        photoUrl: studentData.photoUrl || '',
        classId: c.id
      };

      if (studentData.note) {
        saveNote(newStudent.id, studentData.note);
      }
      if (studentData.photoUrl) {
        saveCustomPhoto(newStudent.id, studentData.photoUrl);
      }

      return {
        ...c,
        students: [...c.students, newStudent]
      };
    }
    return c;
  });

  saveClassesData(updated);
  return updated;
}

export function updateStudent(classId, studentId, updatedFields) {
  const classes = getClassesData();
  const updated = classes.map(c => {
    if (c.id === classId) {
      return {
        ...c,
        students: c.students.map(s => {
          if (s.id === studentId) {
            const hasPhoto = updatedFields.photoUrl !== undefined ? !!updatedFields.photoUrl : s.hasPhoto;
            const photoUrl = updatedFields.photoUrl !== undefined ? updatedFields.photoUrl : s.photoUrl;
            return {
              ...s,
              ...updatedFields,
              hasPhoto,
              photoUrl
            };
          }
          return s;
        })
      };
    }
    return c;
  });

  if (updatedFields.photoUrl !== undefined) {
    saveCustomPhoto(studentId, updatedFields.photoUrl);
  }
  if (updatedFields.note !== undefined) {
    saveNote(studentId, updatedFields.note);
  }

  saveClassesData(updated);
  return updated;
}

export function updateStudentPhoto(classId, studentId, photoUrl) {
  return updateStudent(classId, studentId, { photoUrl });
}

export function deleteStudent(classId, studentId) {
  const classes = getClassesData();
  const updated = classes.map(c => {
    if (c.id === classId) {
      return {
        ...c,
        students: c.students.filter(s => s.id !== studentId)
      };
    }
    return c;
  });

  saveClassesData(updated);
  return updated;
}

// --- Active Dataset Filter ---
export function getActiveDataset() {
  try {
    return localStorage.getItem(getKey('active_dataset')) || 'teachers';
  } catch (e) {
    return 'teachers';
  }
}

export function setActiveDataset(datasetId) {
  localStorage.setItem(getKey('active_dataset'), datasetId);
  return datasetId;
}

// --- Learning Progress & Spaced Repetition (Leitner) ---
export function getLearningState() {
  try {
    const raw = localStorage.getItem(getKey('learning_state'));
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function recordReviewResult(contactId, isCorrect) {
  const state = getLearningState();
  const current = state[contactId] || { level: 0, correctCount: 0, wrongCount: 0, lastReviewed: 0 };
  
  let newLevel = current.level;
  if (isCorrect) {
    newLevel = Math.min(5, current.level + 1);
  } else {
    newLevel = Math.max(0, current.level - 1);
  }

  state[contactId] = {
    level: newLevel,
    correctCount: current.correctCount + (isCorrect ? 1 : 0),
    wrongCount: current.wrongCount + (isCorrect ? 0 : 1),
    lastReviewed: Date.now()
  };

  localStorage.setItem(getKey('learning_state'), JSON.stringify(state));
  return state;
}

export function resetAllLearning() {
  localStorage.removeItem(getKey('learning_state'));
  return {};
}

// --- Settings ---
export function getSettings() {
  try {
    const raw = localStorage.getItem(getKey('settings'));
    return raw ? JSON.parse(raw) : { soundEnabled: true, theme: 'light', cardBatchSize: 10, includeMemorizedInQuiz: false };
  } catch (e) {
    return { soundEnabled: true, theme: 'light', cardBatchSize: 10, includeMemorizedInQuiz: false };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(getKey('settings'), JSON.stringify(settings));
}

// --- Export & Import ---
export function exportAllData() {
  return JSON.stringify({
    profileId: getActiveProfileId(),
    profiles: getProfiles(),
    tykani: getTykaniMap(),
    memorized: getMemorizedMap(),
    notes: getNotesMap(),
    customPhotos: getCustomPhotosMap(),
    classes: getClassesData(),
    learningState: getLearningState(),
    settings: getSettings(),
    exportedAt: new Date().toISOString()
  }, null, 2);
}

export function importAllData(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.profiles) localStorage.setItem(PROFILES_KEY, JSON.stringify(parsed.profiles));
    if (parsed.profileId) localStorage.setItem(ACTIVE_PROFILE_KEY, parsed.profileId);
    if (parsed.tykani) localStorage.setItem(getKey('tykani_map'), JSON.stringify(parsed.tykani));
    if (parsed.memorized) localStorage.setItem(getKey('memorized_map'), JSON.stringify(parsed.memorized));
    if (parsed.notes) localStorage.setItem(getKey('notes_map'), JSON.stringify(parsed.notes));
    if (parsed.customPhotos) localStorage.setItem(getKey('custom_photos_map'), JSON.stringify(parsed.customPhotos));
    if (parsed.classes) localStorage.setItem(getKey('classes_data'), JSON.stringify(parsed.classes));
    if (parsed.learningState) localStorage.setItem(getKey('learning_state'), JSON.stringify(parsed.learningState));
    if (parsed.settings) localStorage.setItem(getKey('settings'), JSON.stringify(parsed.settings));
    return true;
  } catch (e) {
    return false;
  }
}
