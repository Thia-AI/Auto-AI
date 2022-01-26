def dataset_from_row(row):
    return {
        'id': row['id'],
        'name': row['name'],
        'type': row['type'],
        'date_created': row['date_created'],
        'date_last_accessed': row['date_last_accessed'],
        'misc_data': row['misc_data'],
        'labels': row['labels']
    }


def job_from_row(row):
    return {
        'id': row['id'],
        'job_name': row['job_name'],
        'has_started': bool(row['has_started']),
        'has_finished': bool(row['has_finished']),
        'status': row['status'],
        'date_started': row['date_started'],
        'date_finished': row['date_finished'],
        'progress': row['progress'],
        'progress_max': row['progress_max']
    }


def model_from_row(row):
    return {
        'id': row['id'],
        'model_name': row['model_name'],
        'model_type': row['model_type'],
        'model_type_extra': row['model_type_extra'],
        'date_created': row['date_created'],
        'date_last_accessed': row['date_last_accessed'],
        'model_status': row['model_status']
    }


def input_from_row(row):
    return {
        'id': row['id'],
        'dataset_id': row['dataset_id'],
        'file_name': row['file_name'],
        'label': row['label'],
        'date_created': row['date_created']
    }


def label_from_row(row):
    return {
        'id': row['id'],
        'dataset_id': row['dataset_id'],
        'value': row['value'],
        'input_count': row['input_count'],
        'color': row['color']
    }
