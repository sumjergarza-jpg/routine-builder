import { useState, useEffect, useRef, useCallback } from 'react';
import type { Exercise, Routine, RoutineExercise, Folder, Equipment, Position, Difficulty, MuscleGroup, Contraindication } from '../data/types';


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

// fetch wrapper for writes: surfaces non-2xx responses (fetch only rejects on network errors)
function apiWrite(url: string, init: RequestInit) {
  return fetch(url, init)
    .then(res => {
      if (!res.ok) throw new Error(`${init.method} ${url} failed: ${res.status}`);
    })
    .catch(console.error);
}

function putRoutine(id: string, routine: Routine) {
  apiWrite(`/api/routines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: routine.title, description: routine.description || '', exercises: routine.exercises }),
  });
}

export function useStore() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const routinesRef = useRef<Routine[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const exercisesRef = useRef<Exercise[]>([]);

  useEffect(() => { routinesRef.current = routines; }, [routines]);
  useEffect(() => { exercisesRef.current = exercises; }, [exercises]);

  useEffect(() => {
    Promise.all([
      fetch('/api/routines').then(r => r.json()),
      fetch('/api/folders').then(r => r.json()),
      fetch('/api/exercises').then(r => r.json()),
    ])
      .then(([routineData, folderData, exerciseData]) => {
        setRoutines(routineData);
        setFolders(folderData);
        setExercises(exerciseData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setLoading(false);
      });
  }, []);

  const getExercise = useCallback((id: string): Exercise | undefined => {
    return exercisesRef.current.find(e => e.id === id);
  }, []);

  const filterExercises = useCallback((filters: Filters): Exercise[] => {
    return exercisesRef.current.filter(ex => {
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
    apiWrite('/api/routines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(routine),
    });
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
    apiWrite(`/api/routines/${id}`, { method: 'DELETE' });
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

  const updateExerciseReps = useCallback((routineId: string, exerciseId: string, reps: string) => {
    const routine = routinesRef.current.find(r => r.id === routineId);
    if (!routine) return;
    const exercises = routine.exercises.map(e =>
      e.exerciseId === exerciseId ? { ...e, reps: reps || undefined } : e
    );
    const updated = { ...routine, exercises };
    setRoutines(rs => rs.map(r => r.id === routineId ? updated : r));
    putRoutine(routineId, updated);
  }, []);

  const updateDescription = useCallback((routineId: string, description: string) => {
    const routine = routinesRef.current.find(r => r.id === routineId);
    if (!routine) return;
    const updated = { ...routine, description };
    setRoutines(rs => rs.map(r => r.id === routineId ? updated : r));
    putRoutine(routineId, updated);
  }, []);

  const createFolder = useCallback((name: string): Folder => {
    const folder: Folder = { id: `folder-${Date.now()}`, name, routineIds: [] };
    setFolders(fs => [...fs, folder]);
    apiWrite('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: folder.id, name }),
    });
    return folder;
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders(fs => fs.filter(f => f.id !== id));
    apiWrite(`/api/folders/${id}`, { method: 'DELETE' });
  }, []);

  const renameFolder = useCallback((id: string, name: string) => {
    setFolders(fs => fs.map(f => f.id === id ? { ...f, name } : f));
    apiWrite(`/api/folders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  }, []);

  const toggleRoutineInFolder = useCallback((routineId: string, folderId: string) => {
    let action = 'add';
    setFolders(fs => fs.map(f => {
      if (f.id !== folderId) return f;
      const isIn = f.routineIds.includes(routineId);
      if (isIn) action = 'remove';
      return {
        ...f,
        routineIds: isIn
          ? f.routineIds.filter(id => id !== routineId)
          : [...f.routineIds, routineId],
      };
    }));
    apiWrite(`/api/folders/${folderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routineId, action }),
    });
  }, []);

  return {
    routines,
    loading,
    folders,
    exercises,
    getExercise,
    filterExercises,
    createRoutine,
    updateRoutine,
    updateDescription,
    deleteRoutine,
    addExerciseToRoutine,
    removeExerciseFromRoutine,
    reorderRoutineExercises,
    updateExerciseReps,
    createFolder,
    deleteFolder,
    renameFolder,
    toggleRoutineInFolder,
  };
}
