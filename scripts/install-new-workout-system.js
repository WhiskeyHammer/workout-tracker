const mongoose = require('mongoose');
require('dotenv').config();
const Workout = require('../models/Workout');

const USER_ID = '691e0bc03f47bad4f255fd44';

const rests = (sets, rest) =>
  Array.from({ length: sets }, (_, i) => (i === sets - 1 ? '0' : String(rest)));

// Most recent (weight, notes, weight group) per new exercise name, lifted from
// the user's historical workout sessions. Entries with `null` had no clean
// historical match and are left blank for the user to populate.
const HISTORY = {
  'Incline Dumbbell Press': { weight: '50+1.25', notes: 'Use pin 2 not 3', group: 'Incline DB Press' },
  'Low Incline Dumbbell Press': { weight: '55', notes: 'estimate — adjust on first session', group: 'Low Incline DB Press', estimate: true },
  'Pull-Ups or Lat Pulldowns (wide grip)': { weight: '60', notes: '', group: 'Assisted Pullups' },
  'Flat Dumbbell Bench Press': { weight: '60', notes: '', group: 'Flat Dumbbell Press' },
  'Chest-Supported Row (wide overhand)': { weight: '150', notes: '7 and 6 holes', group: 'Chest Supported Row' },
  'Chest-Supported Row (neutral grip)': { weight: '125', notes: 'Close neutral grip', group: 'Seated Cable Row' },
  'Lateral Raises': { weight: '12.5', notes: 'estimate — adjust on first session', group: 'Lateral Raises', estimate: true },
  'Cable Lateral Raise': { weight: '15+2.5', notes: '', group: 'Cable Lateral Raise' },
  'Face Pulls': { weight: '55+2.5', notes: '', group: 'Face Pulls' },
  'Dumbbell Shrugs': { weight: '50', notes: 'estimate — adjust on first session', group: 'Dumbbell Shrugs', estimate: true },
  'Cable Tricep Pushdowns': { weight: '60', notes: '', group: 'Triceps Pushdown' },
  'Overhead Tricep Extension': { weight: '60', notes: '', group: 'Overhead Triceps Ext' },
  'Cable Flyes': { weight: '25', notes: 'estimate — adjust on first session', group: 'Cable Flyes', estimate: true },
  'Cable Curls': { weight: '70+2.5', notes: '', group: 'Barbell Curls' },
  'Wrist Curls': { weight: '15', notes: 'estimate — adjust on first session', group: 'Wrist Curls', estimate: true },
  'Reverse Wrist Curls': { weight: '10', notes: 'estimate — adjust on first session', group: 'Reverse Wrist Curls', estimate: true },
  'Neck Curls': { weight: '10', notes: '', group: 'Neck Curls' },
  'Neck Extensions': { weight: '10', notes: '', group: 'Neck Extensions' },
  'Barbell Squat': { weight: '45', notes: '', group: 'Barbell Squat' },
  'Romanian Deadlift': { weight: '60', notes: '', group: 'Romanian Dumbbell Deadlift' },
  'Leg Curls': { weight: '60', notes: '2 holes', group: 'Leg Curls' },
  'Standing Calf Raises': { weight: '80', notes: '', group: 'Calfe Raise' },
};

const buildWorkoutData = (definitions) => {
  let id = 0;
  const flat = [];
  const nextWeights = {};
  const weightsSet = new Set();
  for (const { name, sets, reps, rests } of definitions) {
    const hist = HISTORY[name];
    const weight = hist?.weight ?? '';
    const note = hist?.notes ?? '';
    const group = hist?.group ?? name;
    if (hist) {
      nextWeights[group] = hist.weight;
      weightsSet.add(name);
    }
    for (let i = 0; i < sets; i++) {
      flat.push({
        id: id++,
        exercise: name,
        reps: String(reps),
        weight,
        rest: rests[i],
        notes: i === 0 ? note : '',
        'weight group': group,
        completed: false,
      });
    }
  }
  return { exercises: flat, nextWeights, weightsSet: [...weightsSet] };
};

const WORKOUTS = [
  {
    name: 'Upper A',
    order: 0,
    description: 'Chest + Back (Sunday)',
    exercises: [
      { name: 'Incline Dumbbell Press', sets: 4, reps: 12, rests: rests(4, 2) },
      { name: 'Pull-Ups or Lat Pulldowns (wide grip)', sets: 3, reps: 10, rests: rests(3, 2) },
      { name: 'Flat Dumbbell Bench Press', sets: 3, reps: 10, rests: rests(3, 2) },
      { name: 'Chest-Supported Row (wide overhand)', sets: 3, reps: 12, rests: rests(3, 2) },
      { name: 'Lateral Raises', sets: 3, reps: 15, rests: rests(3, 1) },
      { name: 'Cable Tricep Pushdowns', sets: 2, reps: 12, rests: rests(2, 1) },
    ],
    notes: {},
  },
  {
    name: 'Upper B',
    order: 1,
    description: 'Pull Heavy + Shoulders (Tuesday)',
    exercises: [
      { name: 'Pull-Ups or Lat Pulldowns (wide grip)', sets: 4, reps: 10, rests: rests(4, 2) },
      { name: 'Chest-Supported Row (neutral grip)', sets: 3, reps: 12, rests: rests(3, 2) },
      { name: 'Cable Lateral Raise', sets: 3, reps: 15, rests: rests(3, 1) },
      { name: 'Face Pulls', sets: 3, reps: 15, rests: rests(3, 1) },
      { name: 'Lateral Raises', sets: 4, reps: 15, rests: rests(4, 1) },
      { name: 'Dumbbell Shrugs', sets: 3, reps: 15, rests: rests(3, 1) },
      { name: 'Overhead Tricep Extension', sets: 2, reps: 12, rests: rests(2, 1) },
    ],
    notes: {},
  },
  {
    name: 'Upper C',
    order: 2,
    description: 'Weak Points (Thursday)',
    exercises: [
      { name: 'Low Incline Dumbbell Press', sets: 3, reps: 12, rests: rests(3, 2) },
      { name: 'Cable Flyes', sets: 3, reps: 15, rests: rests(3, 1) },
      { name: 'Chest-Supported Row (wide overhand)', sets: 3, reps: 12, rests: rests(3, 2) },
      { name: 'Lateral Raises', sets: 3, reps: 15, rests: rests(3, 1) },
      { name: 'Cable Curls', sets: 3, reps: 12, rests: rests(3, 1) },
      { name: 'Wrist Curls', sets: 3, reps: 15, rests: ['0', '0', '0'] },
      { name: 'Reverse Wrist Curls', sets: 3, reps: 15, rests: ['1', '1', '0'] },
      { name: 'Neck Curls', sets: 2, reps: 15, rests: ['0', '0'] },
      { name: 'Neck Extensions', sets: 2, reps: 15, rests: ['1', '0'] },
    ],
    notes: {
      'Wrist Curls': 'Superset with Reverse Wrist Curls (60s rest after both)',
      'Reverse Wrist Curls': 'Superset with Wrist Curls (60s rest after both)',
      'Neck Curls': 'Superset with Neck Extensions (60s rest after both)',
      'Neck Extensions': 'Superset with Neck Curls (60s rest after both)',
    },
  },
  {
    name: 'Lower',
    order: 3,
    description: 'Maintenance (Saturday)',
    exercises: [
      { name: 'Barbell Squat', sets: 3, reps: 8, rests: rests(3, 2) },
      { name: 'Romanian Deadlift', sets: 3, reps: 8, rests: rests(3, 2) },
      { name: 'Leg Curls', sets: 2, reps: 12, rests: rests(2, 1) },
      { name: 'Standing Calf Raises', sets: 2, reps: 15, rests: rests(2, 1) },
      { name: 'Neck Curls', sets: 2, reps: 15, rests: ['0', '0'] },
      { name: 'Neck Extensions', sets: 2, reps: 15, rests: ['1', '0'] },
    ],
    notes: {
      'Neck Curls': 'Superset with Neck Extensions (60s rest after both)',
      'Neck Extensions': 'Superset with Neck Curls (60s rest after both)',
    },
  },
];

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`connected to ${mongoose.connection.db.databaseName}`);

  const userId = new mongoose.Types.ObjectId(USER_ID);
  const now = new Date();
  const newNames = WORKOUTS.map((w) => w.name);

  // Step 1: Upsert each workout by (userId, name, active). Re-runnable.
  console.log('\nupserting workouts:');
  const estimates = new Set();
  for (const w of WORKOUTS) {
    const data = buildWorkoutData(w.exercises);
    w.exercises.forEach(({ name }) => {
      if (HISTORY[name]?.estimate) estimates.add(name);
    });
    const existing = await Workout.findOne({ userId, name: w.name, archivedAt: null });
    const isUpdate = !!existing;
    await Workout.findOneAndUpdate(
      { userId, name: w.name, archivedAt: null },
      {
        $set: {
          order: w.order,
          data,
          exerciseNotes: w.notes,
          updatedAt: now,
        },
        $setOnInsert: {
          userId,
          archivedAt: null,
          createdAt: now,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const totalSets = data.exercises.length;
    const uniqueExercises = new Set(data.exercises.map((e) => e.exercise)).size;
    const populated = data.weightsSet.length;
    console.log(`  ${isUpdate ? 'updated ' : 'inserted'} ${w.name} (order ${w.order}): ${uniqueExercises} exercises (${populated} with history), ${totalSets} sets`);
  }
  if (estimates.size > 0) {
    console.log(`\nestimated (no clean historical match):`);
    [...estimates].sort().forEach((n) => console.log(`  - ${n}: ${HISTORY[n].weight}`));
  }

  // Step 2: Archive any other active workouts not in the new system
  const stragglers = await Workout.find({
    userId,
    archivedAt: null,
    name: { $nin: newNames },
  });
  if (stragglers.length > 0) {
    console.log(`\narchiving ${stragglers.length} non-system workouts:`);
    stragglers.forEach((w) => console.log(`  - ${w.name} (order ${w.order})`));
    await Workout.updateMany(
      { _id: { $in: stragglers.map((w) => w._id) } },
      { $set: { archivedAt: now, updatedAt: now } }
    );
  }

  await mongoose.disconnect();
  console.log('\ndone');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
