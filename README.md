### Running in dev environment

```sh
npm run dev
```

Then in a separate terminal

```sh
npm run start
```

### Packaging app

The boilerplate is currently configured to package & build the installer of the app for Windows using electron-builder

```sh
npm run prod
npm run build:win
```

#### Extra options

The build scripts currently build 64-bit installers. 32 bit builds are possible by changing build scripts in package.json as:

```json
// from
"scripts": {
    ...
    "build:win": "electron-builder build --win --x64"
},

// to
"scripts": {
    ...
    "build:win": "electron-builder build --win --ia32"
},
```
