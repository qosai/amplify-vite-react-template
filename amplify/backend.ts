import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource'; // <-- add

export const backend = defineBackend({
  auth,
  data,
  storage, // <-- add
});


