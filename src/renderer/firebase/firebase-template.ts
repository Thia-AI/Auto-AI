// Template for a firebase config

import { AppOptions } from 'firebase-admin/app';
import { FirebaseOptions } from 'firebase/app';

export const firebaseConfig: FirebaseOptions = {
	apiKey: '',
	authDomain: '',
	projectId: '',
	storageBucket: '',
	messagingSenderId: '',
	appId: '',
	measurementId: '',
};

export const firebaseAdminConfig: AppOptions = {
	serviceAccountId: '',
	projectId: '',
};
