from typing import Tuple, Any

from log.logger import log


class DBCommand:
    def __init__(self, name: str, command: str, values: Tuple[Any, ...] = ()):
        self.__name = name
        self.__command = command
        self.__values = values

    def exec_string(self):
        return self.__command

    def name(self):
        return self.__name

    def values(self):
        return self.__values

    def __str__(self):
        return self.__command
