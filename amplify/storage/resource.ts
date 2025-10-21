// amplify/storage/resource.ts
import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
    name: 'appUserFiles',
    isDefault: true,
    access: (allow) => ({
        // Authenticated users can list/read/write/delete under this prefix
        'user-uploads/*': [allow.authenticated.to(['read', 'write', 'delete'])],
    }),
});
