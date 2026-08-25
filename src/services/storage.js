// Local Device Storage Service with Multi-Profile Support
// Stores Tykání, personal notes, custom photos, classes, and flashcard learning progress
// independently per device/browser AND per user profile on the same device!

const PROFILES_KEY = 'vsps_profiles_list';
const ACTIVE_PROFILE_KEY = 'vsps_active_profile_id';

// --- Profile Management ---
export function getProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : [{ id: 'default', name: 'Můj profil' }];
  } catch (e) {
    return [{ id: 'default', name: 'Můj profil' }];
  }
}

export function getActiveProfileId() {
  try {
    return localStorage.getItem(ACTIVE_PROFILE_KEY) || 'default';
  } catch (e) {
    return 'default';
  }
}

export function setActiveProfileId(profileId) {
  localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
  return profileId;
}

export function createProfile(profileName) {
  const profiles = getProfiles();
  const newProfile = {
    id: `profile_${Date.now()}`,
    name: profileName.trim()
  };
  const updated = [...profiles, newProfile];
  localStorage.setItem(PROFILES_KEY, JSON.stringify(updated));
  setActiveProfileId(newProfile.id);
  return { profiles: updated, activeId: newProfile.id };
}

export function deleteProfile(profileId) {
  if (profileId === 'default') return getProfiles();
  const profiles = getProfiles().filter(p => p.id !== profileId);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  if (getActiveProfileId() === profileId) {
    setActiveProfileId('default');
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

// --- Classes & Students Storage ---
export function getClassesData() {
  try {
    // Classes are shared on the device across profiles or profile-specific
    const raw = localStorage.getItem('vsps_shared_classes_data');
    return raw ? JSON.parse(raw) : [
      {
        id: 'class_demo',
        name: 'Ukázková třída 4.A',
        students: [
          {
            id: 'student_demo_1',
            name: 'Jan Novák',
            role: 'Žák třídy 4.A',
            category: 'Žáci (4.A)',
            cabinet: 'Třída 4.A (učebna 102)',
            hasPhoto: false,
            photoUrl: '',
            classId: 'class_demo'
          }
        ]
      }
    ];
  } catch (e) {
    return [];
  }
}

export function saveClassesData(classes) {
  localStorage.setItem('vsps_shared_classes_data', JSON.stringify(classes));
  return classes;
}

export function addClass(className) {
  const classes = getClassesData();
  const newClass = {
    id: `class_${Date.now()}`,
    name: className.trim(),
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
    return raw ? JSON.parse(raw) : { soundEnabled: true, theme: 'dark', cardBatchSize: 10 };
  } catch (e) {
    return { soundEnabled: true, theme: 'dark', cardBatchSize: 10 };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(getKey('settings'), JSON.stringify(settings));
}

// --- Export & Import ---
export function exportAllData() {
  return JSON.stringify({
    profileId: getActiveProfileId(),
    tykani: getTykaniMap(),
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
    if (parsed.tykani) localStorage.setItem(getKey('tykani_map'), JSON.stringify(parsed.tykani));
    if (parsed.notes) localStorage.setItem(getKey('notes_map'), JSON.stringify(parsed.notes));
    if (parsed.customPhotos) localStorage.setItem(getKey('custom_photos_map'), JSON.stringify(parsed.customPhotos));
    if (parsed.classes) localStorage.setItem('vsps_shared_classes_data', JSON.stringify(parsed.classes));
    if (parsed.learningState) localStorage.setItem(getKey('learning_state'), JSON.stringify(parsed.learningState));
    if (parsed.settings) localStorage.setItem(getKey('settings'), JSON.stringify(parsed.settings));
    return true;
  } catch (e) {
    return false;
  }
}
