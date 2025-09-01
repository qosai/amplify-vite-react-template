// src/amplifyTheme.ts
import { createTheme } from '@aws-amplify/ui-react';

export const amplifyTheme = createTheme({
    name: 'brand',
    tokens: {
        colors: {
            brand: {
                primary: { 10: '#e6f7f9', 80: '#007b86', 90: '#00616a' }, // buttons/links
            },
        },
        radii: { small: '10px', medium: '14px' },
        fonts: {
            default: { variable: { fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif' } },
        },
    },
});
