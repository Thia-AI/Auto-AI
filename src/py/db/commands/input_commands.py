from db.commands.base_commands import DBCommand
from db.database import DBManager


def add_images_to_db_batch(values):
    cmd = DBCommand(name="Add Inputs To DB",
                    command='''INSERT INTO input (id, dataset_id, file_name, label, date_created) values (?, ?, ?, ?, ?)''',
                    values=values)
    DBManager.get_instance().execute(cmd)


def get_all_inputs(limit=100):
    cmd = DBCommand(name="Get All Inputs",
                    command=f'''SELECT * FROM input ORDER BY date_created DESC LIMIT {limit}''')
    return DBManager.get_instance().execute(cmd)


def get_input(uuid: str):
    cmd = DBCommand(name=f"Get Input With ID: {uuid}", command=f"SELECT * FROM input WHERE id = '{uuid}'")
    return DBManager.get_instance().execute(cmd)


def delete_all_inputs_of_dataset(uuid: str):
    cmd = DBCommand(name=f"Delete All Inputs From Dataset '{uuid}'",
                    command='DELETE FROM input WHERE dataset_id = ?',
                    values=(uuid,))
    DBManager.get_instance().execute(cmd)


def reset_labels_of_inputs(dataset_id: str, label_to_reset: str):
    cmd = DBCommand(name=f"Reset Inputs With Label: {label_to_reset}",
                    command='''UPDATE input SET label = 'unlabelled' WHERE dataset_id = ? AND label = ?''',
                    values=(dataset_id, label_to_reset))
    DBManager.get_instance().execute(cmd)


def update_input_label(input_id: str, new_label: str, ):
    cmd = DBCommand(name=f"Update Input: {input_id}'s label to: {new_label}",
                    command='''UPDATE input SET label = ? WHERE id = ?''',
                    values=(new_label, input_id))
    DBManager.get_instance().execute(cmd)


# Input pagination

# Next page
def pagination_get_next_page_inputs(dataset_id: str, cursor_date: str, limit: int):
    cmd = DBCommand(name=f"Get Inputs After {cursor_date} - Limit {limit}",
                    command='''SELECT * FROM input WHERE dataset_id = ? AND date_created > ? ORDER BY date_created LIMIT ?''',
                    values=(dataset_id, cursor_date, limit))
    return DBManager.get_instance().execute(cmd)


def pagination_get_prev_page_preview_inputs(dataset_id: str, cursor_date: str):
    cmd = DBCommand(name=f"Get A Single Input Before {cursor_date}",
                    command='''SELECT * FROM input WHERE dataset_id = ? AND date_created < ? LIMIT 1''',
                    values=(dataset_id, cursor_date))
    return DBManager.get_instance().execute(cmd)


# Prev page
def pagination_get_prev_page_inputs(dataset_id: str, cursor_date: str, limit: int):
    # We order descending or else it would get from the beginning, we reverse it later anyways
    cmd = DBCommand(name=f"Get Inputs Before {cursor_date} - Limit {limit}",
                    command='''SELECT * FROM input WHERE dataset_id = ? AND date_created < ? ORDER BY date_created DESC LIMIT ?''',
                    values=(dataset_id, cursor_date, limit))
    return DBManager.get_instance().execute(cmd)


def pagination_get_next_page_preview_inputs(dataset_id: str, cursor_date: str):
    cmd = DBCommand(name=f"Get A Single Input After {cursor_date}",
                    command='''SELECT * FROM input WHERE dataset_id = ? AND date_created > ? LIMIT 1''',
                    values=(dataset_id, cursor_date))
    return DBManager.get_instance().execute(cmd)
