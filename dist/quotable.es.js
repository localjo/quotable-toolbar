import { render, h } from 'preact';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = "#quotable-toolbar, .quotable-link {\n  text-decoration: none;\n  height: 1em;\n}\n\n.quotable-link:hover {\n  text-decoration: none;\n}\n\n#quotable-toolbar {\n  display: block;\n  padding: 5px 10px;\n  line-height: 1.5em;\n  text-align: center;\n  text-decoration: none;\n  background: #eeeeee;\n  border: 1px solid rgba(0, 0, 0, 0.2);\n  border-radius: 5px;\n  box-sizing: content-box;\n  white-space: nowrap;\n}\n\n/* Caret */\n\n#quotable-toolbar:after, #quotable-toolbar:before {\n  top: 100%;\n  left: 50%;\n  border: solid transparent;\n  content: \" \";\n  height: 0;\n  width: 0;\n  position: absolute;\n  pointer-events: none;\n}\n\n/* Caret background */\n\n#quotable-toolbar:after {\n  border-color: rgba(238, 238, 238, 0);\n  border-top-color: #eeeeee;\n  border-width: 6px;\n  margin-left: -6px;\n}\n\n/* Caret border */\n\n#quotable-toolbar:before {\n  border-color: rgba(0, 0, 0, 0);\n  border-top-color: rgba(0, 0, 0, 0.3);\n  border-width: 7px;\n  margin-left: -7px;\n}\n\n.quotable-link {\n  display: inline-block;\n  height: 1.2em;\n  text-decoration: none !important;\n  border: 0 !important;\n  -webkit-box-shadow: none !important;\n  box-shadow: none !important;\n}\n\n#quotable-toolbar .quotable-link {\n  background: none !important;\n}";
styleInject(css_248z);

var Quotable = /** @class */ (function () {
    function Quotable(settings) {
        var defaultSettings = {
            twitter: {},
            url: window.location.href,
            isActive: {
                blockquotes: true,
                textSelection: true,
            },
        };
        this.settings = __assign(__assign({}, defaultSettings), settings);
        this.el = document.querySelector(settings.selector);
        this.handleTextSelection = this.handleTextSelection.bind(this);
        this.handleTextDeselection = this.handleTextDeselection.bind(this);
        this.handleTwitterIntent = this.handleTwitterIntent.bind(this);
    }
    Quotable.prototype.activate = function () {
        var _a = this, el = _a.el, settings = _a.settings, setUpBlockquotes = _a.setUpBlockquotes, handleTextSelection = _a.handleTextSelection, handleTextDeselection = _a.handleTextDeselection, handleTwitterIntent = _a.handleTwitterIntent;
        var twitter = settings.twitter, isActive = settings.isActive, selector = settings.selector;
        setUpBlockquotes.bind(this)();
        if (isActive.textSelection) {
            var elPosition = window.getComputedStyle(el).position;
            var validPositions = ['relative', 'fixed', 'absolute'];
            if (!validPositions.includes(elPosition)) {
                console.warn("Forcing element '" + selector + "' to position: relative. The Quotable container element should have position set to one of: [" + validPositions.join(',') + "] with CSS to avoid this warning.");
                el.style.position = 'relative';
            }
            el.addEventListener('mouseup', handleTextSelection);
            document.addEventListener('mousedown', handleTextDeselection);
        }
        if (twitter && !window.__twitterIntentHandler) {
            document.addEventListener('click', handleTwitterIntent, false);
            window.__twitterIntentHandler = true;
        }
    };
    Quotable.prototype.deactivate = function () {
        var _a = this, el = _a.el, settings = _a.settings, handleTextSelection = _a.handleTextSelection, handleTextDeselection = _a.handleTextDeselection, handleTwitterIntent = _a.handleTwitterIntent;
        var twitter = settings.twitter;
        el.removeEventListener('mouseup', handleTextSelection);
        document.removeEventListener('mousedown', handleTextDeselection);
        if (twitter && window.__twitterIntentHandler) {
            document.removeEventListener('click', handleTwitterIntent);
        }
    };
    Quotable.prototype.setUpBlockquotes = function () {
        var _a = this, el = _a.el, settings = _a.settings, Toolbar = _a.Toolbar, wrapContents = _a.wrapContents;
        var twitter = settings.twitter, url = settings.url, isActive = settings.isActive;
        var isBqActive = isActive.blockquotes;
        var blockquotes = isBqActive
            ? Array.from(el.querySelectorAll('blockquote'))
            : [];
        if (!isBqActive && isActive.include && isActive.include.length > 0) {
            isActive.include.forEach(function (include) {
                var included = Array.from(el.querySelectorAll(include));
                blockquotes.push.apply(blockquotes, included);
            });
        }
        if (isActive.exclude && isActive.exclude.length > 0) {
            blockquotes = blockquotes.filter(function (blockquote) {
                return !isActive.exclude
                    .map(function (exclude) { return blockquote.matches(exclude); })
                    .some(function (match) { return !!match; });
            });
        }
        blockquotes.forEach(function (blockquote) {
            var paragraphs = blockquote.querySelectorAll('p');
            if (paragraphs.length > 0) {
                paragraphs.forEach(function (paragraph) {
                    wrapContents(paragraph, 'span', 'quotable-text');
                    render(h(Toolbar, { text: paragraph.textContent, url: url, twitter: twitter ? twitter : null }), paragraph, paragraph);
                });
            }
            else {
                wrapContents(blockquote, 'span', 'quotable-text');
                render(h(Toolbar, { text: blockquote.textContent, url: url, twitter: twitter ? twitter : null }), blockquote, blockquote);
            }
        });
    };
    Quotable.prototype.handleTextDeselection = function (e) {
        var el = this.el;
        var target = e.target;
        var isToolbarChild = !!target.closest('#quotable-toolbar');
        if (!isToolbarChild) {
            render(null, el, el);
        }
    };
    Quotable.prototype.handleTextSelection = function () {
        var _a = this, el = _a.el, settings = _a.settings, getSelectedText = _a.getSelectedText, Toolbar = _a.Toolbar;
        var twitter = settings.twitter, url = settings.url;
        var selection = getSelectedText();
        if (selection && selection.text !== '') {
            var text = selection.text, top_1 = selection.top, left = selection.left, right = selection.right;
            var rect = el.getBoundingClientRect();
            var style = {
                top: top_1 - rect.top - 10,
                left: (left + right) / 2 - rect.left,
                position: 'absolute',
            };
            render(h(Toolbar, { text: text, url: url, style: style, twitter: twitter ? twitter : null }), el, el);
        }
    };
    Quotable.prototype.handleTwitterIntent = function (e) {
        var target = e.target;
        while (target && target.nodeName.toLowerCase() !== 'a') {
            target = target.parentNode;
        }
        var intentRegex = /twitter\.com\/intent\/(\w+)/, windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes', width = 550, height = 420;
        if (target && target.nodeName.toLowerCase() === 'a' && target.href) {
            var isTwitterIntent = target.href.match(intentRegex);
            if (isTwitterIntent) {
                var left = Math.round(screen.width / 2 - width / 2);
                var top_2 = screen.height > height
                    ? Math.round(screen.height / 2 - height / 2)
                    : 0;
                window.open(target.href, 'intent', windowOptions + ",width=" + width + ",height=" + height + ",left=" + left + ",top=" + top_2);
                e.preventDefault();
            }
        }
    };
    Quotable.prototype.wrapContents = function (el, wrapper, className) {
        var span = document.createElement(wrapper);
        span.classList.add(className);
        span.innerHTML = el.innerHTML;
        el.innerHTML = span.outerHTML;
    };
    Quotable.prototype.getSelectedText = function () {
        var range, textSelection;
        if (window.getSelection) {
            range = window.getSelection();
            if (range.rangeCount > 0) {
                textSelection = range.getRangeAt(0).getBoundingClientRect();
                return {
                    top: textSelection.top,
                    left: textSelection.left,
                    right: textSelection.right,
                    text: range.toString(),
                };
            }
        }
        range = document.selection.createRange();
        return range.text;
    };
    Quotable.prototype.Toolbar = function (props) {
        var text = props.text, style = props.style, twitter = props.twitter, url = props.url;
        var isFloat = style && (style.top || style.left);
        var instanceStyle = __assign(__assign(__assign({}, style), { textDecoration: 'none' }), (isFloat
            ? {
                transform: 'translate(-50%, -100%)',
            }
            : {}));
        var href = '';
        if (twitter) {
            var hashtags = twitter.hashtags, related = twitter.related, via = twitter.via;
            var params_1 = __assign(__assign(__assign({ text: text,
                url: url }, (related ? { related: related } : {})), (via ? { via: via } : {})), (hashtags && hashtags.length
                ? { hashtags: hashtags.join(',') }
                : {}));
            var query = Object.keys(params_1)
                .map(function (c) { return encodeURIComponent(c) + "=" + encodeURIComponent(params_1[c]); })
                .join('&');
            href = "http://twitter.com/intent/tweet?" + query;
        }
        return (h("span", { id: "" + (isFloat ? 'quotable-toolbar' : ''), style: instanceStyle },
            h("a", { class: "quotable-link", href: href, onMouseOver: !isFloat
                    ? function (e) {
                        var target = e.target;
                        var parent = target.closest('blockquote, p');
                        var wrapper = parent.querySelector('.quotable-text');
                        wrapper.style.background = 'rgba(100,100,100,0.1)';
                    }
                    : function () { }, onMouseOut: !isFloat
                    ? function (e) {
                        var target = e.target;
                        var parent = target.closest('blockquote, p');
                        var wrapper = parent.querySelector('.quotable-text');
                        wrapper.style.background = null;
                    }
                    : function () { } },
                h("div", { style: {
                        display: 'inline-block',
                        width: '1em',
                        height: '1em',
                        lineHeight: '1em',
                        fill: 'currentColor',
                        margin: isFloat ? '0' : '0 0.2em',
                        paddingTop: isFloat ? '0' : '0.1em',
                    }, dangerouslySetInnerHTML: {
                        __html: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 -50 50 50\"><path d=\"M49.998-40.494a20.542 20.542 0 01-5.892 1.614 10.28 10.28 0 004.511-5.671 20.53 20.53 0 01-6.514 2.488 10.246 10.246 0 00-7.488-3.237c-5.665 0-10.258 4.589-10.258 10.249 0 .804.091 1.586.266 2.337-8.526-.429-16.085-4.509-21.144-10.709a10.19 10.19 0 00-1.389 5.152c0 3.556 1.811 6.693 4.564 8.531a10.23 10.23 0 01-4.647-1.282l-.001.128c0 4.966 3.537 9.11 8.229 10.052a10.332 10.332 0 01-4.633.175 10.27 10.27 0 009.583 7.118 20.594 20.594 0 01-12.74 4.388 20.6 20.6 0 01-2.447-.145A29.048 29.048 0 0015.723-4.7c18.868 0 29.186-15.618 29.186-29.162 0-.445-.01-.887-.03-1.326a20.827 20.827 0 005.119-5.306z\"/></svg>",
                    } }))));
    };
    return Quotable;
}());

export default Quotable;
