// RUNTIME

/**
 * Used for checking whether we are in a development environment.
 */
export const IPC_RUNTIME_IS_DEV = 'runtime:isDev';

// NOTIFICATIONS

/**
 * Used for showing a native OS notification.
 */
export const IPC_NOTIFICATIONS_SHOW_NOTIFICATION = 'notifications:showNotification';

// LOGIN WINDOW / AUTHENTICATION

/**
 * Used for showing the login window when needing to login
 */
export const IPC_SHOW_LOGIN_WINDOW = 'loginWindow:show';

/**
 * Used to send auth credentials to main renderer from app when signed in with custom token.
 */
export const IPC_SEND_AUTH_CREDENTIAL_TO_MAIN_RENDERER = 'auth:sendCredentialToMainRenderer';
// DEVELOPMENT ONLY

/**
 * Used only when in a development environment for checking whether **Engine** is running (development **renderer** reloads).
 */
export const IPC_DEV_ENGINE_STARTED = 'dev:engineStarted';

export const IPC_DEV_TOGGLE_DEV_DASHBOARD = 'dev:toggleDevDashboard';

// DRAG AND DROP

/**
 * Used for opening an OS file explorer for selecting multiple files (for uploading new inputs to a dataset).
 */
export const IPC_DRAG_AND_DROP_SELECT_MULTIPLE_FILES = 'dragAndDrop:selectMultipleFiles';

/**
 * Used for opening an OS file explorer for selecting a folder (for uploading new inputs to a dataset).
 */
export const IPC_DRAG_AND_DROP_SELECT_FOLDER = 'dragNDrop:selectFolder';

// WORKER

/**
 * Used from a **worker** to **main** telling it that it is now ready to do another task.
 */
export const IPC_WORKER_READY = 'worker:ready';

/**
 * Used when a task for the **renderer** is to be done by the **worker**.
 */
export const IPC_WORKER_TASK_ASSIGNED = 'worker:taskAssigned';

/**
 * Used when a task the **worker** was working on is now done and to send **renderer** the results.
 */
export const IPC_WORKER_TASK_DONE = 'worker:taskDone';

/**
 * Used when **main** informs a **worker** that it is ready to initialize (once it has loaded and **main** has stored its instance in memory).
 */
export const IPC_WORKER_READY_TO_INIT = 'worker:readyToInit';

/**
 * Used when a task to be done for the **renderer** has been received by a **worker**.
 */
export const IPC_WORKER_TASK_RECEIVED = 'worker:taskFromQueueSent';

// ENGINE

/**
 * Used for telling **main** to connect to **Engine**'s Socket-IO server.
 */
export const IPC_CONNECT_SOCKET = 'engine:connectSocket';

/**
 * Used for notifying **renderer** that the **Engine** process has started.
 */
export const IPC_ENGINE_STARTED = 'engine:started';

/**
 * Used when **renderer** notifies **main** that it wants the **Engine** process to start.
 */
export const IPC_ENGINE_START = 'engine:start';

/**
 * Used for notifying **renderer** that the **Engine** process has stopped.
 */
export const IPC_ENGINE_STOPPED = 'engine:stopped';

/**
 * Used for notifying **main** to stop **Engine** process.
 */
export const IPC_ENGINE_STOP = 'engine:stop';

/**
 * Used for notifiying **renderer** that a job has finished on **Engine**.
 */
export const IPC_ENGINE_JOB_FINISHED = 'engine:jobFinished';

// MAIN WINDOW

/**
 * Used for closing the **App**.
 */
export const IPC_WINDOW_CLOSED = 'window:close';

/**
 * Used for unmaximizing the **App**.
 */
export const IPC_WINDOW_UNMAXIMIZE = 'window:unmaximize';

/**
 * Used for maximizing the **App**.
 */
export const IPC_WINDOW_MAXIMIZE = 'window:maximize';

/**
 * Used for minimizing the **App**.
 */
export const IPC_WINDOW_MINIMIZE = 'window:minimize';

/**
 * Used for focusing the **App**.
 */
export const IPC_WINDOW_FOCUS = 'window:focus';

/**
 * Used for showing the dialog to close the **App**.
 */
export const IPC_SHOW_CLOSE_WINDOW_DIALOG = 'window:showCloseWindowDialog';

/**
 * Used when window is maximized, **main** sends to **renderer**.
 */
export const IPC_WINDOW_MAXIMIZED = 'window:maximized';

/**
 * Used when window is unmaximized, **main** sends to **renderer**.
 */
export const IPC_WINDOW_UNMAXIMIZED = 'window:unmaximized';
