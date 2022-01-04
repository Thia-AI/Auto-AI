// Engine Status

/**
 * When the engine has started
 */
export const ENGINE_STARTED = 'ENGINE_STARTED';
/**
 * For checking the engine status TODO: Change naming from dev to dynamic because that's what it really does
 * and we only use it during dev right now because of reloading but later we will need to get it dynamically.
 */
export const ENGINE_DEV_STATUS = 'ENGINE_DEV_STATUS';

// Header

/**
 * When the application is maximized/minimized.
 */
export const APP_MAXIMIZE_CHANGE = 'APP_MAXIMIZE_CHANGE';

// Choose Model

/**
 * When new model selection modal is opened.
 */
export const CLICK_CHOOSE_MODEL_BUTTON = 'CLICK_CHOOSE_MODEL_BUTTON';
/**
 * When changing the model type during model selection.
 */
export const CHANGE_SELECTED_MODEL = 'CHANGE_SELECTED_MODEL';

// Side Menu

/**
 * When side menu is opened/closed.
 */
export const OPEN_CLOSE_SIDE_MENU = 'OPEN_SIDE_MENU';
/**
 * When changing the selected page in the side menu.
 */
export const CHANGE_SELECTED_PAGE = 'CHANGE_SELECTED_PAGE';

// Choose Dataset for Training

/**
 * When changing the selected dataset for training.
 */
export const CHANGE_SELECTED_DATASET = 'CHOOSE_DATASET_TRAINING';
/**
 * When reseting the selected dataset.
 */
export const RESET_SELECTED_DATASET = 'RESET_SELECTED_DATASET';

// Delete modals alert dialog

/**
 * When opening/closing the delete dataset confirmation alert dialog.
 */
export const OPEN_CLOSE_DELETE_DATASET = 'OPEN_CLOSE_DELETE_DATASET';
/**
 * When opening/closing the delete label confirmation alert dialog.
 */
export const OPEN_CLOSE_DELETE_LABEL = 'OPEN_CLOSE_DELETE_LABEL';

// Dataset List

/**
 * When refreshing the list of datasets.
 */
export const REFRESH_DATASET_LIST = 'REFRESH_DATASET_LIST';
/**
 * The loading status when refreshing the list of datasets.
 */
export const DATASET_LOADING = 'DATASET_LOADING';
/**
 * When updating the list of files (inputs) when adding new files (inputs) to a dataset in the preview area.
 */
export const UPDATE_DATASET_PREVIEW_UPLOAD_FILES = 'UPDATE_DATASET_PREVIEW_UPLOAD_FILES';

// Notifications

/**
 * When we are sending an OS notification.
 */
export const NOTIFICATION_SEND = 'NOTIFY_SEND';
/**
 * When we are dismissing an OS notification.
 */
export const NOTIFICATION_DISMISS = 'NOTIFY_DISMISS';
/**
 * When we are clearing all notifications.
 */
export const NOTIFICATION_CLEAR = 'NOTIF_CLEAR';

// Active Dataset

/**
 * When we are changing the active dataset.
 */
export const CHANGE_ACTIVE_DATASET = 'CHANGE_ACTIVE_DATASET';
