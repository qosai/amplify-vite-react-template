// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import App from './App';

import { ThemeProvider, Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './index.css';
import { amplifyTheme } from './amplifyTheme';

// Configure Amplify from the generated outputs
Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={amplifyTheme}>
            <Authenticator
                // If your Cognito sign-in is email-based, uncomment the next line:
                // loginMechanisms={['email']}
                formFields={{
                    signIn: {
                        username: { label: 'Email', placeholder: 'you@company.com' },
                        password: { label: 'Password' },
                    },
                    signUp: {
                        email: { label: 'Work Email *' },
                        password: { label: 'Create a password' },
                        confirm_password: { label: 'Confirm password' },
                    },
                }}
                components={{
                    SignIn: {
                        Header() {
                            return (
                                <div style={{ padding: 12, textAlign: 'center' }}>
                                    <h2>Check Ride 3 demo 👋</h2>
                                </div>
                            );
                        },
                        Footer() {
                            return (
                                <div style={{ padding: 12, textAlign: 'center' }}>
                                    Demo by : Qosai Samara
                                </div>
                            );
                        },
                    },
                    SignUp: {
                        Header() {
                            return (
                                <div style={{ padding: 12, textAlign: 'center' }}>
                                    <h2>Create your account for CR3 Demo</h2>
                                </div>
                            );
                        },
                        Footer() {
                            return (
                                <div style={{ padding: 12, textAlign: 'center' }}>
                                    Demo by : Qosai Samara
                                </div>
                            );
                        },
                    },
                }}
            >
                <App />
            </Authenticator>
        </ThemeProvider>
    </React.StrictMode>
);
