import { app, Certificate, WebContents } from 'electron';
import https from 'https';
import selfsigned from 'selfsigned';
import { pki, asn1, md, util } from 'node-forge';
import express, { Request, Response, NextFunction, Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import log from 'electron-log';
import path from 'path';
import { parse } from 'url';
import { Server } from 'socket.io';

let certFingerprint = '';
let appServer: Express | undefined = undefined;
let webTLS: https.Server | undefined = undefined;

export const webAppConfig = {
	port: '8443',
	hostPort: 'localhost:8443',
	hostUrl: 'https://localhost:8443',
};

/**
 * Starts express server from **main**.
 *
 * @returns Express Server that is created.
 */
export const startServer = () => {
	return new Promise((resolve, reject) => {
		try {
			appServer = express();
			// support json encoded bodies
			appServer.use(express.json());
			appServer.use(express.urlencoded({ extended: true }));

			// In order to use a self signed certificate without throwing an error but still have security,
			// we check to make sure that only our certificate can be used; any other self-signed cert
			// shouldn't happen in our app, and will throw an error
			app.on('certificate-error', checkCertificate);

			// Security check
			appServer.use('/api', checkAPICallsNotFromExternalSource);
			appServer.use(
				helmet({
					crossOriginEmbedderPolicy: false,
					contentSecurityPolicy: false,
				}),
			);
			appServer.use(cors());

			// Test route for checking if server is running
			appServer.get('/test', (req, res) => {
				res.send('I am alive');
			});

			// Set up static web content folders
			appServer.use(
				'/login',
				express.static(path.join(__dirname, 'server'), {
					index: false,
					maxAge: '1d',
					redirect: false,
				}),
			);
			// Start secure web server
			webTLS = https.createServer(getWebOptionsOnStartup(), appServer);

			// Socket IO
			const io = new Server(webTLS);

			webTLS.listen(webAppConfig.port, () => {
				log.info('TLS server started on port ', (webTLS?.address() as object)['port']);
				resolve([appServer, io]);
			});
		} catch (error) {
			log.error('Error starting web server: ', error);
			reject(error);
		}
	});
};

/**
 * Creates self signed certificate and HTTPS server options using that certificate.
 *
 * @returns HTTPS server options.
 */
const getWebOptionsOnStartup = (): https.ServerOptions => {
	const attrs: pki.CertificateField[] = [
		{ name: 'commonName', value: app.name },
		{ name: 'countryName', value: app.getLocaleCountryCode() },
		{ name: 'organizationName', value: 'Self-Signed' },
	];
	const pems = selfsigned.generate(attrs, { days: 365 });
	const originalCert = pki.certificateFromPem(pems.cert);
	const asn1Cert = pki.certificateToAsn1(originalCert);
	const asn1Encoded = asn1.toDer(asn1Cert).getBytes();
	const fingerprintDigest = md.sha256.create().update(asn1Encoded).digest();
	certFingerprint = 'sha256/' + util.encode64(fingerprintDigest.getBytes());

	return {
		key: pems.private,
		cert: pems.cert,
		requestCert: false,
		rejectUnauthorized: false,
	};
};

/**
 * This is a hook into an HTTP received request. Since we are using localhost and a self-signed
 * certificate, we want to reject the error that this would normally generate, but only on the
 * condition that it happens with our self-signed cert. We do this check by examining the cert fingerprint.
 *
 * See  {@link https://www.electronjs.org/docs/latest/api/app#event-certificate-error `certificate-error`}.
 *
 * @param event Node event.
 * @param webContents Electron BrowserWindow WebContents.
 * @param url Url of the certificate the app fail to authenticate.
 * @param error Error emmitted.
 * @param certificate Electron Certificate.
 * @param callback Function that needs to be called with true if we want to consider
 * the certificate as trusted or false otherwise.
 */
const checkCertificate = (
	event: Event,
	webContents: WebContents,
	url: string,
	error: string,
	certificate: Certificate,
	callback: (isTrusted: boolean) => void,
) => {
	// disable the certificate signing error only if this is our certificate
	const currURL = parse(webContents.getURL());
	const domainName = currURL.hostname?.replace(/^[^.]+\./g, '');
	let isOurCert = true;
	if (certificate.fingerprint == certFingerprint || domainName == 'firebaseapp.com') {
		event.preventDefault();
		isOurCert = true;
	}
	callback(isOurCert);
};

/**
 *
 */
/**
 * Another security check. This function is in the express routing chain for /api/... calls.
 * It will check that /api calls cannot come from an external computer.
 *
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 */
const checkAPICallsNotFromExternalSource = (req: Request, res: Response, next: NextFunction) => {
	const referer = (req.headers ?? {}).host ?? '';

	if (!req.secure || !referer.match(webAppConfig.hostPort)) {
		res.status(401).send('Unauthorized');
		return;
	}
	next();
};
