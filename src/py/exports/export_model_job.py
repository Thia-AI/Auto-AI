from overrides import overrides
from pathlib import Path
import shutil
import time
import os

from job.base_job import BaseJob
from log.logger import log
from db.commands.model_commands import get_model
from db.row_accessors import model_from_row
import config.config as c
from config.constants import ModelExportType, ModelExportStatus
from db.commands.export_commands import update_export_status


class ExportModelJob(BaseJob):
    def __init__(self, args: [str, str, str, Path]):
        # args: [model_id, export_type, export_id, save_dir]
        super().__init__(args, job_name='Export Model Job', initial_status='Loading model', progress_max=1)

    @overrides
    def run(self):
        import tensorflow as tf
        super().run()
        model_id, export_type, export_id, save_dir = self.arg
        save_dir: Path = save_dir
        rows = get_model(model_id)
        model = {}
        for row in rows:
            model = model_from_row(row)
        saved_model_path: Path = c.MODEL_DIR / model['model_name'] / c.MODEL_TRAINING_CHECKPOINT_DIR_NAME / c.MODEL_TRAINING_CHECKPOINT_NAME
        if export_type == ModelExportType.SAVED_MODEL.value:
            # Model is already in a saved model format, copy the directory
            shutil.copytree(saved_model_path, save_dir)
        elif export_type == ModelExportType.LITE.value:
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
        update_export_status(export_id, ModelExportStatus.EXPORTED.value)
        super().clean_up_job()
