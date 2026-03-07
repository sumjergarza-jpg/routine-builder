import { useState, useCallback } from 'react';
import type { Exercise, Routine, RoutineExercise, Equipment, Position, Difficulty, MuscleGroup, Contraindication } from '../data/types';
import { exercises as seedExercises } from '../data/exercises';

const STORAGE_KEY = 'routine-builder-data';

interface StoredData {
  routines: Routine[];
  customExercises: Exercise[];
}

function loadData(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { routines: [], customExercises: [] };
}

function saveData(data: StoredData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

export function useStore() {
  const [data, setData] = useState<StoredData>(loadData);

  const allExercises = [...seedExercises, ...data.customExercises];

  const persist = useCallback((next: StoredData) => {
    setData(next);
    saveData(next);
  }, []);

  const getExercise = useCallback((id: string): Exercise | undefined => {
    return allExercises.find(e => e.id === id);
  }, [allExercises]);

  const filterExercises = useCallback((filters: Filters): Exercise[] => {
    return allExercises.filter(ex => {
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
  }, [allExercises]);

  const createRoutine = useCallback((title: string): Routine => {
    const routine: Routine = {
      id: `routine-${Date.now()}`,
      title,
      createdDate: new Date().toISOString(),
      exercises: [],
    };
    persist({ ...data, routines: [routine, ...data.routines] });
    return routine;
  }, [data, persist]);

  const updateRoutine = useCallback((id: string, updates: Partial<Pick<Routine, 'title' | 'exercises'>>) => {
    const next = {
      ...data,
      routines: data.routines.map(r =>
        r.id === id ? { ...r, ...updates } : r
      ),
    };
    persist(next);
  }, [data, persist]);

  const deleteRoutine = useCallback((id: string) => {
    persist({ ...data, routines: data.routines.filter(r => r.id !== id) });
  }, [data, persist]);

  const addExerciseToRoutine = useCallback((routineId: string, exerciseId: string) => {
    const routine = data.routines.find(r => r.id === routineId);
    if (!routine) return;
    if (routine.exercises.some(e => e.exerciseId === exerciseId)) return;
    const entry: RoutineExercise = {
      exerciseId,
      order: routine.exercises.length,
    };
    updateRoutine(routineId, { exercises: [...routine.exercises, entry] });
  }, [data, updateRoutine]);

  const removeExerciseFromRoutine = useCallback((routineId: string, exerciseId: string) => {
    const routine = data.routines.find(r => r.id === routineId);
    if (!routine) return;
    const next = routine.exercises
      .filter(e => e.exerciseId !== exerciseId)
      .map((e, i) => ({ ...e, order: i }));
    updateRoutine(routineId, { exercises: next });
  }, [data, updateRoutine]);

  const reorderRoutineExercises = useCallback((routineId: string, exercises: RoutineExercise[]) => {
    updateRoutine(routineId, { exercises: exercises.map((e, i) => ({ ...e, order: i })) });
  }, [updateRoutine]);

  return {
    routines: data.routines,
    exercises: allExercises,
    getExercise,
    filterExercises,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    addExerciseToRoutine,
    removeExerciseFromRoutine,
    reorderRoutineExercises,
  };
}
