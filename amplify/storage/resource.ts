// amplify/storage/resource.ts

import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
    name: 'qosai_appUserUploads',   // new bucket unique to your app
    isDefault: true,                 // ensures SDK finds it automatically
    access: (allow) => ({
        'user-uploads/*': [allow.authenticated.to(['read', 'write', 'delete'])],
    }),
});