const mongoose = require('mongoose');
require('dotenv').config();

const workoutValidator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['userId'],
    properties: {
      userId: { bsonType: 'objectId' },
      name: { bsonType: 'string' },
      order: { bsonType: ['int', 'long', 'double', 'decimal'] },
      data: {
        bsonType: 'object',
        properties: {
          exercises: { bsonType: 'array' },
          nextWeights: { bsonType: 'object' },
          weightsSet: { bsonType: 'array' }
        }
      },
      lastCompletedSession: {
        bsonType: ['object', 'null'],
        properties: {
          weightsSet: { bsonType: 'array' },
          completedAt: { bsonType: 'date' }
        }
      },
      exerciseNotes: { bsonType: 'object' },
      archivedAt: { bsonType: ['date', 'null'] },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' }
    }
  }
};

const sessionValidator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['userId', 'workoutId', 'workoutName', 'completedAt'],
    properties: {
      userId: { bsonType: 'objectId' },
      workoutId: { bsonType: 'objectId' },
      workoutName: { bsonType: 'string' },
      exercises: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          properties: {
            exercise: { bsonType: 'string' },
            exerciseNotes: { bsonType: 'string' },
            sets: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                properties: {
                  id: { bsonType: ['int', 'long', 'double'] },
                  reps: { bsonType: 'string' },
                  weight: { bsonType: 'string' },
                  rest: { bsonType: 'string' },
                  notes: { bsonType: 'string' },
                  'weight group': { bsonType: 'string' },
                  completed: { bsonType: 'bool' }
                }
              }
            }
          }
        }
      },
      weightsSet: { bsonType: 'array' },
      completedAt: { bsonType: 'date' },
      createdAt: { bsonType: 'date' }
    }
  }
};

async function applyValidator(db, collectionName, validator) {
  const existing = await db.listCollections({ name: collectionName }).toArray();
  if (existing.length === 0) {
    await db.createCollection(collectionName, {
      validator,
      validationLevel: 'moderate',
      validationAction: 'error'
    });
    console.log(`  created ${collectionName} with validator`);
  } else {
    await db.command({
      collMod: collectionName,
      validator,
      validationLevel: 'moderate',
      validationAction: 'error'
    });
    console.log(`  updated ${collectionName} validator`);
  }
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set. Add it to your environment or .env file.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log(`connected to ${db.databaseName}`);

  await applyValidator(db, 'workouts', workoutValidator);
  await applyValidator(db, 'workoutsessions', sessionValidator);

  console.log('done. validationLevel=moderate, validationAction=error');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
