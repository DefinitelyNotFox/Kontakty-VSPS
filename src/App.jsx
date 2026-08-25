import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import ContactList from './components/ContactList';
import ClassManager from './components/ClassManager';
import QuizGame from './components/QuizGame';
import FlashcardGame from './components/FlashcardGame';
import DatasetSelector from './components/DatasetSelector';
import NoteModal from './components/NoteModal';
import StatsModal from './components/StatsModal';
import ImageLightboxModal from './components/ImageLightboxModal';

import contactsData from './data/contacts.json';
import {
  getProfiles,
  getActiveProfileId,
  setActiveProfileId,
  createProfile,
  getTykaniMap,
  saveTykani,
  getMemorizedMap,
  saveMemorized,
  getNotesMap,
  saveNote,
  getCustomPhotosMap,
  saveCustomPhoto,
  getClassesData,
  addClass,
  deleteClass,
  addStudentToClass,
  deleteStudent,
  getActiveDataset,
  setActiveDataset,
  getLearningState,
  recordReviewResult,
  resetAllLearning,
  getSettings,
  saveSettings
} from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('contacts'); // 'contacts', 'classes', 'quiz', 'flashcards'
  
  // Profile state
  const [profiles, setProfiles] = useState(getProfiles());
  const [activeProfileId, setProfileIdState] = useState(getActiveProfileId());

  // Persistent States (for active profile)
  const [tykaniMap, setTykaniMap] = useState(getTykaniMap());
  const [memorizedMap, setMemorizedMap] = useState(getMemorizedMap());
  const [notesMap, setNotesMap] = useState(getNotesMap());
  const [customPhotosMap, setCustomPhotosMap] = useState(getCustomPhotosMap());
  const [classesData, setClassesData] = useState(getClassesData());
  const [activeDataset, setDatasetState] = useState(getActiveDataset());
  const [learningState, setLearningState] = useState(getLearningState());
  const [settings, setSettingsState] = useState(getSettings());

  // Modal States
  const [editingContact, setEditingContact] = useState(null);
  const [viewingPhotoContact, setViewingPhotoContact] = useState(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Reload states whenever profile changes
  const refreshProfileData = useCallback(() => {
    setTykaniMap(getTykaniMap());
    setMemorizedMap(getMemorizedMap());
    setNotesMap(getNotesMap());
    setCustomPhotosMap(getCustomPhotosMap());
    setClassesData(getClassesData());
    setDatasetState(getActiveDataset());
    setLearningState(getLearningState());
    setSettingsState(getSettings());
  }, []);

  const handleSelectProfile = (profileId) => {
    setActiveProfileId(profileId);
    setProfileIdState(profileId);
    refreshProfileData();
  };

  const handleCreateProfile = (profileName) => {
    const { profiles: updated, activeId } = createProfile(profileName);
    setProfiles(updated);
    setProfileIdState(activeId);
    refreshProfileData();
  };

  // Apply Theme attribute to HTML document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme || 'light');
  }, [settings.theme]);

  // Dataset selector handler
  const handleSelectDataset = (datasetId) => {
    const updated = setActiveDataset(datasetId);
    setDatasetState(updated);
  };

  // Resolve raw active contacts list based on selected dataset
  const rawDatasetContacts = useMemo(() => {
    if (activeDataset === 'teachers') {
      return contactsData;
    }
    const allStudents = classesData.flatMap(c => c.students);
    if (activeDataset === 'all_students') {
      return allStudents.length > 0 ? allStudents : contactsData;
    }
    if (activeDataset === 'mix') {
      return [...contactsData, ...allStudents];
    }
    if (activeDataset.startsWith('class_')) {
      const classId = activeDataset.replace('class_', '');
      const targetCls = classesData.find(c => c.id === classId);
      return (targetCls && targetCls.students.length > 0) ? targetCls.students : contactsData;
    }
    return contactsData;
  }, [activeDataset, classesData]);

  // Active pool contacts for learning (only contacts with photo or custom photo, excluding memorized if setting active)
  const learningContactsList = useMemo(() => {
    // Exclude photoless contacts unless a custom photo is assigned
    const withPhotoOnly = rawDatasetContacts.filter(c => c.hasPhoto || !!customPhotosMap[c.id]);

    if (settings.includeMemorizedInQuiz) {
      return withPhotoOnly;
    }
    const unmemorized = withPhotoOnly.filter(c => !memorizedMap[c.id]);
    return unmemorized.length > 0 ? unmemorized : withPhotoOnly;
  }, [rawDatasetContacts, customPhotosMap, memorizedMap, settings.includeMemorizedInQuiz]);

  const memorizedInDatasetCount = useMemo(() => {
    return rawDatasetContacts.filter(c => memorizedMap[c.id]).length;
  }, [rawDatasetContacts, memorizedMap]);

  // Tykání toggle handler
  const handleToggleTykani = (contactId) => {
    const current = !!tykaniMap[contactId];
    const updated = saveTykani(contactId, !current);
    setTykaniMap({ ...updated });
  };

  // Memorized toggle handler
  const handleToggleMemorized = (contactId) => {
    const current = !!memorizedMap[contactId];
    const updated = saveMemorized(contactId, !current);
    setMemorizedMap({ ...updated });
  };

  const handleToggleIncludeMemorized = () => {
    const nextVal = !settings.includeMemorizedInQuiz;
    const updated = { ...settings, includeMemorizedInQuiz: nextVal };
    setSettingsState(updated);
    saveSettings(updated);
  };

  // Note & Custom Photo save handler
  const handleSaveNote = (contactId, noteText, photoUrl) => {
    const updatedNotes = saveNote(contactId, noteText);
    setNotesMap({ ...updatedNotes });

    const updatedPhotos = saveCustomPhoto(contactId, photoUrl);
    setCustomPhotosMap({ ...updatedPhotos });
  };

  // Class management handlers
  const handleAddClass = (className) => {
    const updated = addClass(className);
    setClassesData(updated);
    return updated;
  };

  const handleDeleteClass = (classId) => {
    const updated = deleteClass(classId);
    setClassesData(updated);
  };

  const handleAddStudent = (classId, studentData) => {
    const updated = addStudentToClass(classId, studentData);
    setClassesData(updated);
  };

  const handleDeleteStudent = (classId, studentId) => {
    const updated = deleteStudent(classId, studentId);
    setClassesData(updated);
  };

  // Learning result callback
  const handleRecordResult = (contactId, isCorrect) => {
    const updated = recordReviewResult(contactId, isCorrect);
    setLearningState({ ...updated });
  };

  // Reset learning data
  const handleResetLearning = () => {
    const cleared = resetAllLearning();
    setLearningState({ ...cleared });
  };

  // Reload state on backup import
  const handleDataImported = () => {
    refreshProfileData();
  };

  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    const updated = { ...settings, theme: nextTheme };
    setSettingsState(updated);
    saveSettings(updated);
  };

  const handleToggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettingsState(updated);
    saveSettings(updated);
  };

  const tykaniCount = Object.values(tykaniMap).filter(Boolean).length;

  return (
    <div className="app-layout">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Tab Content */}
      <main style={{ flex: 1 }}>
        {activeTab === 'contacts' && (
          <ContactList
            contacts={contactsData}
            tykaniMap={tykaniMap}
            memorizedMap={memorizedMap}
            notesMap={notesMap}
            customPhotosMap={customPhotosMap}
            onToggleTykani={handleToggleTykani}
            onToggleMemorized={handleToggleMemorized}
            onEditNote={(c) => setEditingContact(c)}
            onViewPhoto={(c) => setViewingPhotoContact(c)}
          />
        )}

        {activeTab === 'classes' && (
          <ClassManager
            classes={classesData}
            onAddClass={handleAddClass}
            onDeleteClass={handleDeleteClass}
            onAddStudent={handleAddStudent}
            onDeleteStudent={handleDeleteStudent}
            tykaniMap={tykaniMap}
            notesMap={notesMap}
            onToggleTykani={handleToggleTykani}
            onEditNote={(c) => setEditingContact(c)}
          />
        )}

        {activeTab === 'quiz' && (
          <>
            <DatasetSelector
              activeDataset={activeDataset}
              onSelectDataset={handleSelectDataset}
              teacherCount={contactsData.length}
              classes={classesData}
              includeMemorized={settings.includeMemorizedInQuiz}
              onToggleIncludeMemorized={handleToggleIncludeMemorized}
              memorizedCount={memorizedInDatasetCount}
              activePoolCount={learningContactsList.length}
            />
            <QuizGame
              key={`${activeProfileId}_${activeDataset}_${settings.includeMemorizedInQuiz}_${Object.keys(memorizedMap).length}`}
              contacts={learningContactsList}
              notesMap={notesMap}
              customPhotosMap={customPhotosMap}
              soundEnabled={settings.soundEnabled}
              onRecordResult={handleRecordResult}
            />
          </>
        )}

        {activeTab === 'flashcards' && (
          <>
            <DatasetSelector
              activeDataset={activeDataset}
              onSelectDataset={handleSelectDataset}
              teacherCount={contactsData.length}
              classes={classesData}
              includeMemorized={settings.includeMemorizedInQuiz}
              onToggleIncludeMemorized={handleToggleIncludeMemorized}
              memorizedCount={memorizedInDatasetCount}
              activePoolCount={learningContactsList.length}
            />
            <FlashcardGame
              key={`${activeProfileId}_${activeDataset}_${settings.includeMemorizedInQuiz}_${Object.keys(memorizedMap).length}`}
              contacts={learningContactsList}
              notesMap={notesMap}
              customPhotosMap={customPhotosMap}
              learningState={learningState}
              soundEnabled={settings.soundEnabled}
              onRecordResult={handleRecordResult}
            />
          </>
        )}
      </main>

      {/* Note / Hint Editing Modal */}
      {editingContact && (
        <NoteModal
          contact={editingContact}
          note={notesMap[editingContact.id]}
          customPhoto={customPhotosMap[editingContact.id]}
          onClose={() => setEditingContact(null)}
          onSave={handleSaveNote}
        />
      )}

      {/* Full-size Image Lightbox Modal */}
      {viewingPhotoContact && (
        <ImageLightboxModal
          contact={viewingPhotoContact}
          customPhoto={customPhotosMap[viewingPhotoContact.id]}
          onClose={() => setViewingPhotoContact(null)}
        />
      )}

      {/* Stats & Backup Modal */}
      {isStatsOpen && (
        <StatsModal
          contacts={contactsData}
          learningState={learningState}
          tykaniMap={tykaniMap}
          notesMap={notesMap}
          onClose={() => setIsStatsOpen(false)}
          onDataReset={handleResetLearning}
          onDataImported={handleDataImported}
        />
      )}
    </div>
  );
}
