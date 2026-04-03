export type Equipment = 'mat' | 'reformer' | 'high_chair' | 'wunda_chair' | 'small_barrel' | 'spine_corrector' | 'ped_o_pul';
export type Position = 'supine' | 'prone' | 'sitting' | 'standing' | 'side_lying' | 'kneeling' | 'all_fours';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type MuscleGroup = 'core' | 'glutes' | 'back' | 'shoulders' | 'legs' | 'arms' | 'full_body';
export type Contraindication = 'back_injury' | 'knee_injury' | 'shoulder_injury' | 'neck_injury' | 'pregnancy' | 'osteoporosis';

export interface Exercise {
  id: string;
  name: string;
  equipment: Equipment;
  position: Position;
  difficulty: Difficulty;
  focus: MuscleGroup[];
  contraindications: Contraindication[];
  description: string;
}

export interface RoutineExercise {
  exerciseId: string;
  order: number;
}

export interface Routine {
  id: string;
  title: string;
  description?: string;
  createdDate: string;
  exercises: RoutineExercise[];
}

export interface Folder {
  id: string;
  name: string;
  routineIds: string[];
}
