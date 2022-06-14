def log(data, log_it=True) -> None:
    if log_it:
        print(data, flush=True)


def log_sio(data, log_it=True) -> None:
    if log_it:
        print('[SERVER-SIO]', data, flush=True)
