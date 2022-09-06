import React from 'react';

// Turn off eslint since this is not our source code.
/* eslint-disable */

function createDetectElementResize(nonce, hostWindow) {
	// Check `document` and `window` in case of server-side rendering
	var _window;
	if (typeof hostWindow !== 'undefined') {
		_window = hostWindow;
	} else if (typeof window !== 'undefined') {
		_window = window;
	} else if (typeof self !== 'undefined') {
		_window = self;
	}

	var attachEvent = typeof _window.document !== 'undefined' && _window.document.attachEvent;

	if (!attachEvent) {
		var requestFrame = (function () {
			var raf =
				_window.requestAnimationFrame ||
				_window.mozRequestAnimationFrame ||
				_window.webkitRequestAnimationFrame ||
				function (fn) {
					return _window.setTimeout(fn, 20);
				};
			return function (fn) {
				return raf(fn);
			};
		})();

		var cancelFrame = (function () {
			var cancel =
				_window.cancelAnimationFrame ||
				_window.mozCancelAnimationFrame ||
				_window.webkitCancelAnimationFrame ||
				_window.clearTimeout;
			return function (id) {
				return cancel(id);
			};
		})();

		var resetTriggers = function (element) {
			var triggers = element.__resizeTriggers__,
				expand = triggers.firstElementChild,
				contract = triggers.lastElementChild,
				expandChild = expand.firstElementChild;
			contract.scrollLeft = contract.scrollWidth;
			contract.scrollTop = contract.scrollHeight;
			expandChild.style.width = expand.offsetWidth + 1 + 'px';
			expandChild.style.height = expand.offsetHeight + 1 + 'px';
			expand.scrollLeft = expand.scrollWidth;
			expand.scrollTop = expand.scrollHeight;
		};

		var checkTriggers = function (element) {
			return (
				element.offsetWidth != element.__resizeLast__.width ||
				element.offsetHeight != element.__resizeLast__.height
			);
		};

		var scrollListener = function (e) {
			// Don't measure (which forces) reflow for scrolls that happen inside of children!
			if (
				e.target.className &&
				typeof e.target.className.indexOf === 'function' &&
				e.target.className.indexOf('contract-trigger') < 0 &&
				e.target.className.indexOf('expand-trigger') < 0
			) {
				return;
			}
			// eslint-disable-next-line @typescript-eslint/no-this-alias
			var element = this;
			resetTriggers(this);
			if (this.__resizeRAF__) {
				cancelFrame(this.__resizeRAF__);
			}
			this.__resizeRAF__ = requestFrame(function () {
				if (checkTriggers(element)) {
					element.__resizeLast__.width = element.offsetWidth;
					element.__resizeLast__.height = element.offsetHeight;
					element.__resizeListeners__.forEach(function (fn) {
						fn.call(element, e);
					});
				}
			});
		};

		/* Detect CSS Animations support to detect element display/re-attach */
		var animation = false,
			keyframeprefix = '',
			animationstartevent = 'animationstart',
			domPrefixes = 'Webkit Moz O ms'.split(' '),
			startEvents =
				'webkitAnimationStart animationstart oAnimationStart MSAnimationStart'.split(' '),
			pfx = '';
		{
			var elm = _window.document.createElement('fakeelement');
			if (elm.style.animationName !== undefined) {
				animation = true;
			}

			if (animation === false) {
				for (var i = 0; i < domPrefixes.length; i++) {
					if (elm.style[domPrefixes[i] + 'AnimationName'] !== undefined) {
						pfx = domPrefixes[i];
						keyframeprefix = '-' + pfx.toLowerCase() + '-';
						animationstartevent = startEvents[i];
						animation = true;
						break;
					}
				}
			}
		}

		var animationName = 'resizeanim';
		var animationKeyframes =
			'@' +
			keyframeprefix +
			'keyframes ' +
			animationName +
			' { from { opacity: 0; } to { opacity: 0; } } ';
		var animationStyle = keyframeprefix + 'animation: 1ms ' + animationName + '; ';
	}

	var createStyles = function (doc) {
		if (!doc.getElementById('detectElementResize')) {
			//opacity:0 works around a chrome bug https://code.google.com/p/chromium/issues/detail?id=286360
			var css =
					(animationKeyframes ? animationKeyframes : '') +
					'.resize-triggers { ' +
					(animationStyle ? animationStyle : '') +
					'visibility: hidden; opacity: 0; } ' +
					'.resize-triggers, .resize-triggers > div, .contract-trigger:before { content: " "; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; z-index: -1; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }',
				head = doc.head || doc.getElementsByTagName('head')[0],
				style = doc.createElement('style');

			style.id = 'detectElementResize';
			style.type = 'text/css';

			if (nonce != null) {
				style.setAttribute('nonce', nonce);
			}

			if (style.styleSheet) {
				style.styleSheet.cssText = css;
			} else {
				style.appendChild(doc.createTextNode(css));
			}

			head.appendChild(style);
		}
	};

	var addResizeListener = function (element, fn) {
		if (attachEvent) {
			element.attachEvent('onresize', fn);
		} else {
			if (!element.__resizeTriggers__) {
				var doc = element.ownerDocument;
				var elementStyle = _window.getComputedStyle(element);
				if (elementStyle && elementStyle.position == 'static') {
					element.style.position = 'relative';
				}
				createStyles(doc);
				element.__resizeLast__ = {};
				element.__resizeListeners__ = [];
				(element.__resizeTriggers__ = doc.createElement('div')).className =
					'resize-triggers';
				var expandTrigger = doc.createElement('div');
				expandTrigger.className = 'expand-trigger';
				expandTrigger.appendChild(doc.createElement('div'));
				var contractTrigger = doc.createElement('div');
				contractTrigger.className = 'contract-trigger';
				element.__resizeTriggers__.appendChild(expandTrigger);
				element.__resizeTriggers__.appendChild(contractTrigger);
				element.appendChild(element.__resizeTriggers__);
				resetTriggers(element);
				element.addEventListener('scroll', scrollListener, true);

				/* Listen for a css animation to detect element display/re-attach */
				if (animationstartevent) {
					element.__resizeTriggers__.__animationListener__ = function animationListener(
						e,
					) {
						if (e.animationName == animationName) {
							resetTriggers(element);
						}
					};
					element.__resizeTriggers__.addEventListener(
						animationstartevent,
						element.__resizeTriggers__.__animationListener__,
					);
				}
			}
			element.__resizeListeners__.push(fn);
		}
	};

	var removeResizeListener = function (element, fn) {
		if (attachEvent) {
			element.detachEvent('onresize', fn);
		} else {
			element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
			if (!element.__resizeListeners__.length) {
				element.removeEventListener('scroll', scrollListener, true);
				if (element.__resizeTriggers__.__animationListener__) {
					element.__resizeTriggers__.removeEventListener(
						animationstartevent,
						element.__resizeTriggers__.__animationListener__,
					);
					element.__resizeTriggers__.__animationListener__ = null;
				}
				try {
					element.__resizeTriggers__ = !element.removeChild(element.__resizeTriggers__);
				} catch (e) {
					// Preact compat; see developit/preact-compat/issues/228
				}
			}
		}
	};

	return {
		addResizeListener,
		removeResizeListener,
	};
}

export default class AutoSizer extends React.Component {
	static defaultProps = {
		onResize: () => {},
		disableHeight: false,
		disableWidth: false,
		style: {},
	};

	state = {
		height: this.props.defaultHeight || 0,
		width: this.props.defaultWidth || 0,
	};

	_parentNode;
	_autoSizer;
	_window; // uses any instead of Window because Flow doesn't have window type
	_detectElementResize;

	componentDidMount() {
		const { nonce } = this.props;
		if (
			this._autoSizer &&
			this._autoSizer.parentNode &&
			this._autoSizer.parentNode.ownerDocument &&
			this._autoSizer.parentNode.ownerDocument.defaultView &&
			this._autoSizer.parentNode instanceof
				this._autoSizer.parentNode.ownerDocument.defaultView.HTMLElement
		) {
			// Delay access of parentNode until mount.
			// This handles edge-cases where the component has already been unmounted before its ref has been set,
			// As well as libraries like react-lite which have a slightly different lifecycle.
			this._parentNode = this._autoSizer.parentNode;
			this._window = this._autoSizer.parentNode.ownerDocument.defaultView;

			// Defer requiring resize handler in order to support server-side rendering.
			// See issue #41
			this._detectElementResize = createDetectElementResize(nonce, this._window);
			this._detectElementResize.addResizeListener(this._parentNode, this._onResize);

			this._onResize();
		}
	}

	componentWillUnmount() {
		if (this._detectElementResize && this._parentNode) {
			this._detectElementResize.removeResizeListener(this._parentNode, this._onResize);
		}
	}

	render() {
		const { children, className, disableHeight, disableWidth, style } = this.props;
		const { height, width } = this.state;

		// Outer div should not force width/height since that may prevent containers from shrinking.
		// Inner component should overflow and use calculated width/height.
		// See issue #68 for more information.
		const outerStyle = { overflow: 'visible' };
		const childParams = {};

		if (!disableHeight) {
			outerStyle.height = 0;
			childParams.height = height;
		}

		if (!disableWidth) {
			outerStyle.width = 0;
			childParams.width = width;
		}

		/**
		 * TODO: Avoid rendering children before the initial measurements have been collected.
		 * At best this would just be wasting cycles.
		 * Add this check into version 10 though as it could break too many ref callbacks in version 9.
		 * Note that if default width/height props were provided this would still work with SSR.
    if (
      height !== 0 &&
      width !== 0
    ) {
      child = children({ height, width })
    }
		 */

		return (
			<div
				className={className}
				ref={this._setRef}
				style={{
					...outerStyle,
					...style,
				}}>
				{children(childParams)}
			</div>
		);
	}

	_onResize = () => {
		const { disableHeight, disableWidth, onResize } = this.props;

		if (this._parentNode) {
			// Guard against AutoSizer component being removed from the DOM immediately after being added.
			// This can result in invalid style values which can result in NaN values if we don't handle them.
			// See issue #150 for more context.

			const height = this._parentNode.offsetHeight || 0;
			const width = this._parentNode.offsetWidth || 0;

			const win = this._window || window;
			const style = win.getComputedStyle(this._parentNode) || {};
			const paddingLeft = parseInt(style.paddingLeft, 10) || 0;
			const paddingRight = parseInt(style.paddingRight, 10) || 0;
			const paddingTop = parseInt(style.paddingTop, 10) || 0;
			const paddingBottom = parseInt(style.paddingBottom, 10) || 0;

			const newHeight = height - paddingTop - paddingBottom;
			const newWidth = width - paddingLeft - paddingRight;

			if (
				(!disableHeight && this.state.height !== newHeight) ||
				(!disableWidth && this.state.width !== newWidth)
			) {
				this.setState({
					height: height - paddingTop - paddingBottom,
					width: width - paddingLeft - paddingRight,
				});

				onResize({ height, width });
			}
		}
	};

	_setRef = (autoSizer) => {
		this._autoSizer = autoSizer;
	};
}

/* eslint-enable */
