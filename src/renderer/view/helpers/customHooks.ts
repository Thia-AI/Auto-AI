import { useEffect, useState } from 'react';
import NoImage from '_utils/images/placeholder-dark2.jpg';

type ProgressiveImageOptions = {
	/**
	 * Whether the image is ready to be loaded (for example if we don't yet have the `src` since that is also being retrieved by another hook).
	 */
	readyToLoad: boolean;
};

const defaultProgressiveImageOptions: ProgressiveImageOptions = { readyToLoad: true };

/**
 * Hook used for lazy loading an image.
 *
 * @param src Location of image (can be local file with file:// preceeding the local file or an HTTP retrievable file).
 * @param options Options for lazy loading.
 * @returns Whether the image has been loaded and its `src`.
 */
export const useProgressiveImage = (src: string, options?: ProgressiveImageOptions): [boolean, string] => {
	const [sourceLoaded, setSourceLoaded] = useState('');
	const [imageLoaded, setImageLoaded] = useState(false);

	const { readyToLoad }: Required<ProgressiveImageOptions> = { ...defaultProgressiveImageOptions, ...options };
	useEffect(() => {
		let img: HTMLImageElement | null = null;
		if (readyToLoad) {
			img = new Image();
			img.src = src;
			img.onload = () => {
				setSourceLoaded(src);
				setImageLoaded(true);
			};
			img.onerror = () => {
				setSourceLoaded(NoImage);
				setImageLoaded(true);
			};
		}

		return () => {
			img = null;
		};
	}, [src, readyToLoad]);

	return [imageLoaded, sourceLoaded];
};
