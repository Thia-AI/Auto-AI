# -*- mode: python ; coding: utf-8 -*-

import sys ; sys.setrecursionlimit(sys.getrecursionlimit() * 5)
import os

spec_root = os.path.abspath(SPECPATH)

block_cipher = None

def extra_datas(mydir):
    def rec_glob(p, files):
        import os
        import glob
        for d in glob.glob(p):
            if os.path.isfile(d):
                files.append(d)
            rec_glob("%s/*" % d, files)
    files = []
    rec_glob("%s/*" % mydir, files)
    extra_datas = []
    for f in files:
        extra_datas.append((f, f, 'DATA'))

    return extra_datas

def get_binaries(mydir):
    def rec_glob(p, files):
        import os
        import glob
        for d in glob.glob(p):
            if os.path.isfile(d):
                files.append(d)
            rec_glob("%s/*" % d, files)
    files = []
    rec_glob("%s/*" % mydir, files)
    binaries = []
    for f in files:
        binaries.append((f, f, 'BINARY'))
    return binaries

from PyInstaller.utils.hooks import collect_all
all_datas = []
all_binaries = []
all_hiddenimports = []
packages = [
        'tensorflow',
        'tensorflow_core',
        'tensorflow_estimator'
    ]
print('Collecting TensorFlow Packages...')
for package in packages:
    datas, binaries, hiddenimports = collect_all(package)
    all_datas.extend(datas)
    all_binaries.extend(binaries)
    all_hiddenimports.extend(hiddenimports)

print(f'Num Datas: {len(all_datas)}')
print(f'Num Binaries: {len(all_binaries)}')
print(f'Num Hidden Imports: {len(all_hiddenimports)}')
print(all_binaries)

a = Analysis(['src\\py\\main.py'],
             pathex=[spec_root],
             binaries=all_binaries,
             datas=all_datas,
             hiddenimports=all_hiddenimports + ['engineio.async_drivers.gevent'],
             hookspath=[],
             runtime_hooks=[],
             excludes=['torch', 'matplotlib'],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher,
             noarchive=False)

a.datas += extra_datas('CUDA')
a.binaries += get_binaries('external_dependencies\\vips')
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          [],
          exclude_binaries=True,
          name='engine',
          debug=False,
          bootloader_ignore_signals=False,
          strip=False,
          upx=True,
          console=True )
coll = COLLECT(exe,
               a.binaries,
               a.zipfiles,
               a.datas,
               strip=False,
               upx=True,
               upx_exclude=[],
               name='engine')
