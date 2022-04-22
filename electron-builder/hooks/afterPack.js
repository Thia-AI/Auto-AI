const { AfterPackContext } = require('electron-builder');
const { join } = require('path');
const asarmor = require('asarmor');
/**
 * Electron-builder afterPack. Runs after app is packaged but before
 * package is put into distributable format and signed
 *
 * 1. Modifies asar file to pretect it from extraction
 * @param {AfterPackContext} context
 */
exports.default = async (context) => {
	try {
		// asararmor
		const asarPath = join(context.packager.getResourcesDir(context.appOutDir), 'app.asar');
		console.log(`Applying asarmor patches to ${asarPath}`);
		const archive = await asarmor.open(asarPath);
		archive.patch(); // apply default patches
		await archive.write(asarPath);
	} catch (err) {
		console.error(err);
	}
};
