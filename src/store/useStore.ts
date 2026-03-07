import { useState, useEffect, useRef, useCallback } from 'react';
import type { Exercise, Routine, RoutineExercise, Equipment, Position, Difficulty, MuscleGroup, Contraindication } from '../data/types';
import { exercises as seedExercises } from '../data/exercises';

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

  useEffect(() => { routinesRef.current = routines; }, [routines]);

  useEffect(() => {
    fetch('/api/routines')
      .then(r => r.json())
      .then((data: Routine[]) => {
        setRoutines(data);
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

  return {
    routines,
    loading,
    exercises: seedExercises,
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
