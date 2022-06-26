from overrides import overrides
from pathlib import Path
import shutil
import time
import os
from datetime import datetime

from job.base_job import BaseJob
from log.logger import log
from db.commands.model_commands import get_model
from db.row_accessors import model_from_row
import config.config as c
from config.constants import ICModelExportType, ICModelExportStatus
from decorators.verify_action import update_backend_action_completed
from db.commands.export_commands import update_export_status


class ExportModelJob(BaseJob):
    def __init__(self, args: [str, str, str, Path, datetime, str, str, str]):
        # args: [model_id, export_type, export_id, save_dir, export_date, request_path, request_method, authorization_header]
        super().__init__(args, job_name='Export Model Job', initial_status='Loading model', progress_max=1)

    @overrides
    def run(self):
        import tensorflow as tf
        super().run()
        model_id, export_type, export_id, save_dir, export_date, request_path, request_method, authorization_header = self.arg
        save_dir: Path = save_dir
        rows = get_model(model_id)
        model = {}
        for row in rows:
            model = model_from_row(row)
        saved_model_path: Path = c.MODEL_DIR / model['model_name'] / c.MODEL_TRAINING_CHECKPOINT_DIR_NAME / c.MODEL_TRAINING_CHECKPOINT_NAME
        if export_type == ICModelExportType.SAVED_MODEL.value:
            # Model is already in a saved model format, copy the directory
            shutil.copytree(saved_model_path, save_dir)
        elif export_type == ICModelExportType.LITE.value:
            try:
                converter = tf.lite.TFLiteConverter.from_saved_model(str(saved_model_path.absolute()))
                # Float 16 quantization
                converter.optimizations = [tf.lite.Optimize.DEFAULT]
                converter.target_spec.supported_types = [tf.float16]

                tflite_model = converter.convert()
                save_dir = save_dir.absolute()
                os.makedirs(save_dir, exist_ok=True)
                with open(save_dir / 'model.tflite', 'wb') as f:
                    f.write(tflite_model)
            except Exception as e:
                log('Error:', e)
        update_export_status(export_id, ICModelExportStatus.EXPORTED.value)
        update_backend_action_completed({
            'path': request_path,
            'method': request_method,
            'save_dir': save_dir,
            'export_type': export_type,
            'export_id': export_id,
            'date_exported': export_date.astimezone().isoformat()
        }, auth_header=authorization_header)
        super().clean_up_job()
