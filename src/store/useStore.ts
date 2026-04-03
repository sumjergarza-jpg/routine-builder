import { useState, useEffect, useRef, useCallback } from 'react';
import type { Exercise, Routine, RoutineExercise, Folder, Equipment, Position, Difficulty, MuscleGroup, Contraindication } from '../data/types';
import { exercises as seedExercises } from '../data/exercises';

function loadFolders(): Folder[] {
  try { return JSON.parse(localStorage.getItem('align-folders') || '[]'); }
  catch { return []; }
}

function loadDescriptions(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem('align-descriptions') || '{}'); }
  catch { return {}; }
}

export interface Filters {
  equipment: Equipment | '';
  position: Position | '';
  difficulty: Difficulty | '';
  focus: MuscleGroup | '';
  contraindications: Contraindication[];
  search: string;
}

export const emptyFilters: Filters = {
  equipment: '',
  position: '',
  difficulty: '',
  focus: '',
  contraindications: [],
  search: '',
};

function putRoutine(id: string, routine: Routine) {
  fetch(`/api/routines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: routine.title, exercises: routine.exercises }),
  }).catch(console.error);
}

export function useStore() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const routinesRef = useRef<Routine[]>([]);
  const [folders, setFolders] = useState<Folder[]>(() => loadFolders());

  useEffect(() => {
    localStorage.setItem('align-folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => { routinesRef.current = routines; }, [routines]);

  useEffect(() => {
    fetch('/api/routines')
      .then(r => r.json())
      .then((data: Routine[]) => {
        const descs = loadDescriptions();
        setRoutines(data.map(r => ({ ...r, description: descs[r.id] })));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load routines:', err);
        setLoading(false);
      });
  }, []);

  const getExercise = useCallback((id: string): Exercise | undefined => {
    return seedExercises.find(e => e.id === id);
  }, []);

  const filterExercises = useCallback((filters: Filters): Exercise[] => {
    return seedExercises.filter(ex => {
      if (filters.equipment && ex.equipment !== filters.equipment) return false;
      if (filters.position && ex.position !== filters.position) return false;
      if (filters.difficulty && ex.difficulty !== filters.difficulty) return false;
      if (filters.focus && !ex.focus.includes(filters.focus)) return false;
      if (filters.contraindications.length > 0) {
        const hasContra = filters.contraindications.some(c => ex.contraindications.includes(c));
        if (hasContra) return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!ex.name.toLowerCase().includes(q) && !ex.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, []);

  const createRoutine = useCallback((title: string): Routine => {
    const routine: Routine = {
      id: `routine-${Date.now()}`,
      title,
      createdDate: new Date().toISOString(),
      exercises: [],
    };
    setRoutines(rs => [routine, ...rs]);
    fetch('/api/routines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(routine),
    }).catch(console.error);
    return routine;
  }, []);

  const updateRoutine = useCallback((id: string, updates: Partial<Pick<Routine, 'title' | 'exercises'>>) => {
    const current = routinesRef.current.find(r => r.id === id);
    if (!current) return;
    const updated = { ...current, ...updates };
    setRoutines(rs => rs.map(r => r.id === id ? updated : r));
    putRoutine(id, updated);
  }, []);

  const deleteRoutine = useCallback((id: string) => {
    setRoutines(rs => rs.filter(r => r.id !== id));
    fetch(`/api/routines/${id}`, { method: 'DELETE' }).catch(console.error);
  }, []);

  const addExerciseToRoutine = useCallback((routineId: string, exerciseId: string) => {
    const routine = routinesRef.current.find(r => r.id === routineId);
    if (!routine || routine.exercises.some(e => e.exerciseId === exerciseId)) return;
    const exercises = [...routine.exercises, { exerciseId, order: routine.exercises.length }];
    const updated = { ...routine, exercises };
    setRoutines(rs => rs.map(r => r.id === routineId ? updated : r));
    putRoutine(routineId, updated);
  }, []);

  const removeExerciseFromRoutine = useCallback((routineId: string, exerciseId: string) => {
    const routine = routinesRef.current.find(r => r.id === routineId);
    if (!routine) return;
    const exercises = routine.exercises
      .filter(e => e.exerciseId !== exerciseId)
      .map((e, i) => ({ ...e, order: i }));
    const updated = { ...routine, exercises };
    setRoutines(rs => rs.map(r => r.id === routineId ? updated : r));
    putRoutine(routineId, updated);
  }, []);

  const reorderRoutineExercises = useCallback((routineId: string, exercises: RoutineExercise[]) => {
    const routine = routinesRef.current.find(r => r.id === routineId);
    if (!routine) return;
    const reordered = exercises.map((e, i) => ({ ...e, order: i }));
    const updated = { ...routine, exercises: reordered };
    setRoutines(rs => rs.map(r => r.id === routineId ? updated : r));
    putRoutine(routineId, updated);
  }, []);

  const updateDescription = useCallback((routineId: string, description: string) => {
    const descs = loadDescriptions();
    descs[routineId] = description;
    localStorage.setItem('align-descriptions', JSON.stringify(descs));
    setRoutines(rs => rs.map(r => r.id === routineId ? { ...r, description } : r));
  }, []);

  const createFolder = useCallback((name: string): Folder => {
    const folder: Folder = { id: `folder-${Date.now()}`, name, routineIds: [] };
    setFolders(fs => [...fs, folder]);
    return folder;
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders(fs => fs.filter(f => f.id !== id));
  }, []);

  const renameFolder = useCallback((id: string, name: string) => {
    setFolders(fs => fs.map(f => f.id === id ? { ...f, name } : f));
  }, []);

  const toggleRoutineInFolder = useCallback((routineId: string, folderId: string) => {
    setFolders(fs => fs.map(f => {
      if (f.id !== folderId) return f;
      const isIn = f.routineIds.includes(routineId);
      return {
        ...f,
        routineIds: isIn
          ? f.routineIds.filter(id => id !== routineId)
          : [...f.routineIds, routineId],
      };
    }));
  }, []);

  return {
    routines,
    loading,
    folders,
    exercises: seedExercises,
    getExercise,
    filterExercises,
    createRoutine,
    updateRoutine,
    updateDescription,
    deleteRoutine,
    addExerciseToRoutine,
    removeExerciseFromRoutine,
    reorderRoutineExercises,
    createFolder,
    deleteFolder,
    renameFolder,
    toggleRoutineInFolder,
  };
}
