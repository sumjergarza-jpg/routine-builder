import type { Equipment, Position, Difficulty, MuscleGroup, Contraindication } from './types';

export const equipmentLabels: Record<Equipment, string> = {
  mat: 'Mat',
  reformer: 'Reformer',
  high_chair: 'High Chair',
  wunda_chair: 'Wunda Chair',
  small_barrel: 'Small Barrel',
  spine_corrector: 'Spine Corrector',
  ped_o_pul: 'Ped-O-Pul',
};

export const positionLabels: Record<Position, string> = {
  supine: 'Supine',
  prone: 'Prone',
  sitting: 'Sitting',
  standing: 'Standing',
  side_lying: 'Side Lying',
  kneeling: 'Kneeling',
  all_fours: 'All Fours',
};

export const difficultyLabels: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const focusLabels: Record<MuscleGroup, string> = {
  core: 'Core',
  glutes: 'Glutes',
  back: 'Back',
  shoulders: 'Shoulders',
  legs: 'Legs',
  arms: 'Arms',
  full_body: 'Full Body',
};

export const contraindicationLabels: Record<Contraindication, string> = {
  back_injury: 'Back Injury',
  knee_injury: 'Knee Injury',
  shoulder_injury: 'Shoulder Injury',
  neck_injury: 'Neck Injury',
  pregnancy: 'Pregnancy',
  osteoporosis: 'Osteoporosis',
};
