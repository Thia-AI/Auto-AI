import json

from log.logger import log


def dataset_from_row(row):
    return {
        'id': row['id'],
        'name': row['name'],
        'type': row['type'],
        'date_created': row['date_created'],
        'date_last_accessed': row['date_last_accessed'],
        'misc_data': row['misc_data'],
        'labels': row['labels'],
    }


def job_from_row(row):
    extra_data = row['extra_data']
    if extra_data is not None:
        try:
            extra_data_obj = json.loads(extra_data)
        except json.decoder.JSONDecodeError:
            log(f"Error decoding extra data for job ID: {row['id']}")
            extra_data_obj = {}
    else:
        extra_data_obj = None

    return {
        'id': row['id'],
        'job_name': row['job_name'],
        'has_started': bool(row['has_started']),
        'has_finished': bool(row['has_finished']),
        'has_cancelled': bool(row['has_cancelled']),
        'status': row['status'],
        'date_started': row['date_started'],
        'date_finished': row['date_finished'],
        'progress': row['progress'],
        'progress_max': row['progress_max'],
        'extra_data': extra_data_obj
    }


def model_from_row(row):
    extra_data = row['extra_data']

    if extra_data is not None:
        try:
            extra_data_obj = json.loads(extra_data)
        except json.decoder.JSONDecodeError:
            log(f"Error decoding extra data for MODEL ID: {row['id']}")
            extra_data_obj = {}
    else:
        extra_data_obj = None

    return {
        'id': row['id'],
        'model_name': row['model_name'],
        'model_type': row['model_type'],
        'model_type_extra': row['model_type_extra'],
        'date_created': row['date_created'],
        'date_last_accessed': row['date_last_accessed'],
        'model_status': row['model_status'],
        'latest_train_job_id': row['latest_train_job_id'],
        'extra_data': extra_data_obj
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
