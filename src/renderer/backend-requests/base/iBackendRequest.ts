import { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Interface representing a Backend Request
 */

interface IBackendRequest {
	backendRequest: AxiosInstance;
	readonly actionName: string;
	run(config?: AxiosRequestConfig, data?: any): Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export { IBackendRequest };
