import { FirebaseOptions } from 'firebase/app';
// Create config file with firebase config objects if doesn't exist already
import { firebaseDevConfig, firebaseProdConfig } from './_config';

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
