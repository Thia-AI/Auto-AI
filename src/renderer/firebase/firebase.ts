import { FirebaseOptions } from 'firebase/app';

const firebaseProdConfig: FirebaseOptions = {
	apiKey: 'AIzaSyDJOaqbWCPHazZsu4uyXCcYl69bSzr-hdc',
	authDomain: 'thia-1458b.firebaseapp.com',
	projectId: 'thia-1458b',
	storageBucket: 'thia-1458b.appspot.com',
	messagingSenderId: '564483189530',
	appId: '1:564483189530:web:62e754e4173dfb80fd1aa3',
	measurementId: 'G-PFW73XVXV6',
};

const firebaseDevConfig: FirebaseOptions = {
	apiKey: 'AIzaSyAoiWNvP_NuTIoXQ-oghg3Ix9jWLblQXcU',
	authDomain: 'thia-dev.firebaseapp.com',
	projectId: 'thia-dev',
	storageBucket: 'thia-dev.appspot.com',
	messagingSenderId: '554589208456',
	appId: '1:554589208456:web:33c36d197c8467b1f6443d',
};

/**
 * Gets Firebase config depending on if **App** is running in production or development.
 *
 * @returns Firebase config.
 */
export const getFirebaseConfig = (): FirebaseOptions => {
	if (process.env.NODE_ENV === 'development') return firebaseDevConfig;
	else return firebaseProdConfig;
};

interface FirebaseCustomTokenConfig {
	serviceAccountId: string;
	projectId: string;
}

const firebaseProdCustomTokenConfig = {
	serviceAccountId: 'firebase-adminsdk-e60qi@thia-1458b.iam.gserviceaccount.com',
	projectId: 'thia-1458b',
};

const firebaseDevCustomTokenConfig = {
	serviceAccountId: 'firebase-adminsdk-blzjr@thia-dev.iam.gserviceaccount.com',
	projectId: 'thia-dev',
};

/**
 * Gets Firebase function, custom-token, config depending on if **App** is running in production or development.
 *
 * @returns Firebase function custom-token config.
 */
export const getFirebaseCustomTokenConfig = (): FirebaseCustomTokenConfig => {
	if (process.env.NODE_ENV === 'development') return firebaseDevCustomTokenConfig;
	else return firebaseProdCustomTokenConfig;
};
