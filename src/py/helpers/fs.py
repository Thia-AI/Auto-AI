import shutil
from os import PathLike, chmod, remove


def delete_directory_backup(action, name, exc):
    """shutil.rmtree backup onerror function that removes a directory the slower way"""
    chmod(name, stat.S_IWRITE)
    remove(name)


def rmtree(path: bytes | str | PathLike[str]):
    shutil.rmtree(path, ignore_errors=False, onerror=delete_directory_backup)
