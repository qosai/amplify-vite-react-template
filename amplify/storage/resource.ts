// amplify/storage/resource.ts
import { defineStorage } from '@aws-amplify/backend';

/**
 * Default bucket where authenticated users can upload/list/download
 * everything under the `user-uploads/` prefix.
 */
export const storage = defineStorage({
    name: 'appUserFiles',
    isDefault: true,
    access: (allow) => ({
        //'user-uploads/*': [
        // Authenticated users can read, write, and delete files under this prefix
        //    allow.authenticated.to(['read', 'write', 'delete']),

        'user-uploads/{entity_id}/*': [
            allow.entity('identity').to(['read', 'write', 'delete']),
        ],
    }),
});