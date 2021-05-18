import sqlite3
import threading
import uuid
import queue
from log.logger import log


class Sqlite3Worker(threading.Thread):
    """SQLite thread-safe queue-based worker"""
    def __init__(self, db_path, max_queue_size=1000, raise_on_error=True, log_worker=False):
        """Initialize worker and start thread

        :param db_path: sqlite database path (.sqlite or .db)
        :param max_queue_size: how many queries can be stored at once
        :param raise_on_error: whether to raise an exception on error
        """
        threading.Thread.__init__(self, name="sqlite_worker", daemon=True)
        self._sqlite3_conn = sqlite3.connect(
            db_path, check_same_thread=False, detect_types=sqlite3.PARSE_DECLTYPES
        )
        self._sqlite3_conn.row_factory = sqlite3.Row
        self._sqlite3_cursor = self._sqlite3_conn.cursor()
        self._sql_queue = queue.Queue(maxsize=max_queue_size)
        self._results = {}
        self._max_queue_size = max_queue_size
        self._raise_on_error = raise_on_error
        self.log_worker = log_worker
        # Event that is triggered once the run_query has been executed.
        self._select_events = {}
        # Event to start the close process.
        self._close_event = threading.Event()
        # Event that closes out the threads.
        self._close_lock = threading.Lock()
        self.start()

    def run(self):
        """Worker thread loop

            Worker's thread loop. The iter method calls self._sql_queue.get() which blocks
            if there are no values in the queue **[good for performance]**. Once values are placed into
            the queue, the process resumes. If many executes happen at once, it will churn through all
            of them before calling `self._sqlite3_conn.commit()` to speed things up by reducing the
            number of times `commit()` is called

        :return: None
        """
        log("Sqlite Worker Started", log_it=self.log_worker)
        execute_count = 0
        for token, query, values in iter(self._sql_queue.get, None):
            if query:
                log(f"_sql_queue: {self._sql_queue.qsize()}", log_it=self.log_worker)
                log(f"run: {query}", log_it=self.log_worker)
                self._run_query(token, query, values)
                execute_count += 1
                # Let the executes build up a little before committing to disk
                # to speed things up.
                if self._sql_queue.empty() or execute_count == self._max_queue_size:
                    try:
                        log("run: commit", log_it=self.log_worker)
                        self._sqlite3_conn.commit()
                        execute_count = 0
                    except Exception as e:
                        log(e, log_it=self.log_worker)
                        if self._raise_on_error:
                            raise e
            # Only close if the queue is empty.  Otherwise keep getting
            # through the queue until it's empty.
            if self._close_event.is_set() and self._sql_queue.empty():
                self._sqlite3_conn.commit()
                self._sqlite3_conn.close()
                return

    def _run_query(self, token, query, values):
        """Runs a query from the queue

        :param token: Uuid object of the query that needs to be returned
        :param query: SQLite string, use ? for placeholders of dynamic values
        :param values: Tuple of values to be replaced into the ? of the query
        :return: None
        """
        if query.lower().strip().startswith("select") or query.lower().strip().startswith("update"):
            try:
                self._sqlite3_cursor.execute(query, values)
                self._results[token] = self._sqlite3_cursor.fetchall()
            except sqlite3.Error as err:
                # Put the error into the output queue since a response
                # is required.
                self._results[token] = "Query returned error: %s: %s: %s" % (
                    query,
                    values,
                    err,
                )
                log(f"Query returned error: {query}: {values}: {err}", log_it=self.log_worker)
            finally:
                # Wake up the thread waiting on the execution of the select
                # query.
                self._select_events.setdefault(token, threading.Event())
                self._select_events[token].set()
        else:
            try:
                self._sqlite3_cursor.execute(query, values)
            except sqlite3.Error as err:
                log(f"Query returned error: {query}: {values}: {err}", log_it=self.log_worker)

    def close(self):
        """Closes the worker's thread

        :return: If already closed, returns False, else returns True once closed
        """
        with self._close_lock:
            if not self.is_alive():
                log("Already Closed", log_it=self.log_worker)
                return False
            self._close_event.set()
            # Put a value in the queue to push through the block waiting for
            # items in the queue.
            self._sql_queue.put(("", "", ""), timeout=5)
            # Check that the thread is done before returning.
            self.join()
            return True

    @property
    def queue_size(self):
        return self._sql_queue.qsize()

    def _query_results(self, token):
        """Gets the query results for a token

        :param token: Uuid object of the query that needs to be returned
        :return: Results of the query when it's executed by the worker
        """
        try:
            # Wait until the select query has executed
            self._select_events.setdefault(token, threading.Event())
            self._select_events[token].wait()
            return self._results[token]
        finally:
            self._select_events[token].clear()
            del self._results[token]
            del self._select_events[token]

    def execute(self, query, values=None):
        """Executes a query

        :param query: SQLite string, use ? for placeholders of dynamic values
        :param values: Tuple of values to be replaced into the ? of the query
        :return: If it is a SELECT or UPDATE query, it will return the results of the query.
                 If execute() is called while connection was being closed, False will be
                 returned instead
        """
        if self._close_event.is_set():
            log(f"Close set, not running: {query}", log_it=self.log_worker)
            return False

        """ Uncomment below temporarily if you also want to log once execute is called in
            addition to when the query is actually executed in _run_query()"""
        # log(f"execute: {query}", log_it=self.log_worker)
        values = values or []
        # A token to track this query with.
        token = str(uuid.uuid4())
        self._sql_queue.put((token, query, values), timeout=5)
        # If it's a select we queue it up with a token to mark the results
        # into the output queue so we know what results are ours.
        if query.lower().strip().startswith("select") or query.lower().strip().startswith("update"):
            return self._query_results(token)
