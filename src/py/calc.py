from sys import argv

def add(a: str, b: str) -> int:
    return int(a) + int(b)
    
    

if __name__ == '__main__':
    args = argv[1:]
    print(str(add(args[0], args[1])))
