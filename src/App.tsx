import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useStore } from './store/useStore';
import { NavProvider } from './context/NavContext';
import { TopNav } from './components/TopNav';
import { Dashboard } from './pages/Dashboard';
import { RoutineBuilder } from './pages/RoutineBuilder';
import { RoutineView } from './pages/RoutineView';
import { FolderView } from './pages/FolderView';

function App() {
  const store = useStore();

  if (store.loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
        Loading…
      </div>
    );
  }

  return (
    <BrowserRouter>
      <NavProvider>
        <div className="app">
          {/* Sticky top nav — rendered once, visible on every page */}
          <TopNav />

          {/* Scrollable content area — fills remaining height */}
          <div className="app-content">
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    routines={store.routines}
                    folders={store.folders}
                    onCreateRoutine={store.createRoutine}
                    onDeleteRoutine={store.deleteRoutine}
                    onCreateFolder={store.createFolder}
                    onDeleteFolder={store.deleteFolder}
                    onRenameFolder={store.renameFolder}
                    onToggleRoutineInFolder={store.toggleRoutineInFolder}
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
                    reorderRoutineExercises={store.reorderRoutineExercises}
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
                    updateRoutine={store.updateRoutine}
                    updateDescription={store.updateDescription}
                  />
                }
              />
              <Route
                path="/folder/:id"
                element={
                  <FolderView
                    routines={store.routines}
                    folders={store.folders}
                    onDeleteRoutine={store.deleteRoutine}
                    onToggleRoutineInFolder={store.toggleRoutineInFolder}
                    onCreateRoutine={store.createRoutine}
                  />
                }
              />
            </Routes>
          </div>
        </div>
      </NavProvider>
    </BrowserRouter>
  );
}

export default App;
