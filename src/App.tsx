import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Dashboard } from './pages/Dashboard';
import { RoutineBuilder } from './pages/RoutineBuilder';
import { RoutineView } from './pages/RoutineView';

function App() {
  const store = useStore();

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                routines={store.routines}
                onCreateRoutine={store.createRoutine}
                onDeleteRoutine={store.deleteRoutine}
                getExercise={store.getExercise}
              />
            }
          />
          <Route
            path="/build/:id"
            element={
              <RoutineBuilder
                routines={store.routines}
                filterExercises={store.filterExercises}
                getExercise={store.getExercise}
                addExerciseToRoutine={store.addExerciseToRoutine}
                removeExerciseFromRoutine={store.removeExerciseFromRoutine}
              />
            }
          />
          <Route
            path="/routine/:id"
            element={
              <RoutineView
                routines={store.routines}
                getExercise={store.getExercise}
                removeExerciseFromRoutine={store.removeExerciseFromRoutine}
                reorderRoutineExercises={store.reorderRoutineExercises}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
