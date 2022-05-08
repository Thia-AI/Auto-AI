import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { PingBackendSecureBackendRequest } from './requests/get/pingBackendSecure';
import { PostNewUserClaimsBackendRequest, PostNewUserClaimsData } from './requests/post/setNewUserRoles';

/**
 * Class that manages all Backend Requests.
 */
export class BackendRequestHandler {
	private static instance: BackendRequestHandler;
	private backendRequest!: AxiosInstance;

	// Test
	private pingBackendSecureBR!: PingBackendSecureBackendRequest;
	// New User
	private setNewUserRolesBR!: PostNewUserClaimsBackendRequest;

	/**
	 * Private constructor.
	 */
	private constructor() {}

	/**
	 * Returns instance of the class.
	 *
	 * @returns Instance.
	 */
	public static getInstance(): BackendRequestHandler {
		if (!BackendRequestHandler.instance) {
			BackendRequestHandler.instance = new BackendRequestHandler();
		}

		return BackendRequestHandler.instance;
	}

	public initInstances = (backendRequest: AxiosInstance) => {
		this.backendRequest = backendRequest;

		this.pingBackendSecureBR = new PingBackendSecureBackendRequest(this.backendRequest);
		this.setNewUserRolesBR = new PostNewUserClaimsBackendRequest(this.backendRequest);
	};

	public pingBackendSecure = async (idToken: string, config?: AxiosRequestConfig) => {
		return this.pingBackendSecureBR.run(config, idToken);
	};

	public setNewUserRoles = async (idToken: string, data: PostNewUserClaimsData, config?: AxiosRequestConfig) => {
		return this.setNewUserRolesBR.run(config, [idToken, data]);
	};
}
