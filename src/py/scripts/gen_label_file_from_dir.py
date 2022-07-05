import argparse
import os
from pathlib import Path
import json


def main(directory: str):
    dir_path = Path(directory)
    if not dir_path.is_dir():
        raise Exception("Directory is not a valid directory")
    labels = {}
    for label_dir_path in dir_path.iterdir():
        if label_dir_path.is_dir():
            label = label_dir_path.stem
            for image_path in label_dir_path.iterdir():
                labels[image_path.stem] = label
    with open('labels.json', 'w', encoding='utf-8') as f:
        json.dump(labels, f, indent=4)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate JSON labels file from images in a directory')
    parser.add_argument('directory', help='Directory of images')
    args = parser.parse_args()
    main(args.directory)
