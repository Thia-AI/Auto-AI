import { INotification } from './actionTypes';

// State for list of notifications
export interface INotificationsReducer {
	value: INotification[];
}
