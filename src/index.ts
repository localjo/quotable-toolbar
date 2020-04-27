interface IQuotableSettings {
  selector: string;
  twitter?: ITwitterOptions;
  url: string;
  isActive?: {
    blockquotes?: boolean;
    textSelection?: boolean;
    include?: string[];
    exclude?: string[];
  };
}
interface IQuotableLinkOptions {
  text: string;
  url: string;
  twitter?: ITwitterOptions;
  style?: {
    top: number;
    left: number;
  };
}
interface ITwitterOptions {
  via?: string;
  related?: string;
  hashtags?: [];
}
interface IStringDictionary {
  [key: string]: string;
}

export default class Quotable {
  settings: IQuotableSettings;
  el: HTMLElement;
  constructor(settings: IQuotableSettings) {
    const defaultSettings = {
      twitter: {},
      url: window.location.href,
      isActive: {
        blockquotes: true,
        textSelection: true,
      },
    };
    this.settings = { ...defaultSettings, ...settings };
    this.el = document.querySelector(settings.selector);
  }
  activate() {
    const {
      settings,
      setUpBlockquotes,
      setUpTextSelection,
      handleTwitterIntent,
    } = this;
    const { twitter, isActive } = settings;
    if (twitter) handleTwitterIntent();
    setUpBlockquotes.bind(this)();
    if (isActive.textSelection) {
      setUpTextSelection.bind(this)();
    }
  }
  setUpBlockquotes() {
    const { el, makeLink, addLink, settings } = this;
    const { twitter, url, isActive } = settings;
    const { blockquotes: isBqActive } = isActive;
    let blockquotes: HTMLElement[] = isBqActive
      ? Array.from(el.querySelectorAll<HTMLElement>('blockquote'))
      : [];
    if (!isBqActive && isActive.include && isActive.include.length > 0) {
      isActive.include.forEach((include: string) => {
        const included: HTMLElement[] = Array.from(
          el.querySelectorAll<HTMLElement>(include)
        );
        blockquotes.push(...included);
      });
    }
    if (isActive.exclude && isActive.exclude.length > 0) {
      blockquotes = blockquotes.filter((blockquote) => {
        return !isActive.exclude
          .map((exclude) => blockquote.matches(exclude))
          .some((match) => !!match);
      });
    }
    blockquotes.forEach((blockquote) => {
      const paragraphs = blockquote.querySelectorAll('p');
      if (paragraphs.length > 0) {
        paragraphs.forEach((paragraph) => {
          const link = makeLink({
            text: paragraph.textContent,
            url,
            ...(twitter ? { twitter } : {}),
          });
          addLink(link, paragraph);
        });
      } else {
        const link = makeLink({
          text: blockquote.textContent,
          url,
          ...(twitter ? { twitter } : {}),
        });
        addLink(link, blockquote);
      }
    });
  }
  setUpTextSelection() {
    const { el, settings, makeLink, addLink, getSelectedText } = this;
    const { twitter, url } = settings;
    el.addEventListener('mouseup', () => {
      const selection = getSelectedText();
      if (selection && selection.text !== '') {
        const { text, top, left, right } = selection;
        const scrollTop =
          window.scrollY ||
          window.scrollTop ||
          document.getElementsByTagName('html')[0].scrollTop;
        const style = {
          top: top + scrollTop - 10,
          left: left + (right - left) / 2,
        };
        const link = makeLink({
          text,
          url,
          ...(twitter ? { twitter } : {}),
          style,
        });
        addLink(link, el);
      }
    });
    document.body.addEventListener('mousedown', (e: MouseEvent) => {
      const { classList } = e.target as HTMLElement;
      if (!classList.contains('quotable-link')) {
        const existingLinks = document.querySelectorAll(
          '.quotable-link-floating'
        );
        if (existingLinks.length > 0) {
          existingLinks.forEach((link) => link.remove());
        }
      }
    });
  }
  handleTwitterIntent() {
    if (window.__twitterIntentHandler) return;
    var intentRegex = /twitter\.com\/intent\/(\w+)/,
      windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes',
      width = 550,
      height = 420,
      winHeight = screen.height,
      winWidth = screen.width;
    function handleIntent(e: any) {
      e = e || window.event;
      var target = e.target || e.srcElement,
        m,
        left,
        top;

      while (target && target.nodeName.toLowerCase() !== 'a') {
        target = target.parentNode;
      }

      if (target && target.nodeName.toLowerCase() === 'a' && target.href) {
        m = target.href.match(intentRegex);
        if (m) {
          left = Math.round(winWidth / 2 - width / 2);
          top = 0;

          if (winHeight > height) {
            top = Math.round(winHeight / 2 - height / 2);
          }

          window.open(
            target.href,
            'intent',
            windowOptions +
              ',width=' +
              width +
              ',height=' +
              height +
              ',left=' +
              left +
              ',top=' +
              top
          );
          e.returnValue = false;
          e.preventDefault && e.preventDefault();
        }
      }
    }
    if (document.addEventListener) {
      document.addEventListener('click', handleIntent, false);
    } else if (document.attachEvent) {
      document.attachEvent('onclick', handleIntent);
    }
    window.__twitterIntentHandler = true;
  }
  getSelectedText(): any {
    let range, textSelection;
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
  }
  makeLink(options: IQuotableLinkOptions): string {
    const { text, twitter, style, url } = options;
    let href = '';
    if (twitter) {
      const { hashtags, related, via } = twitter;
      const params: IStringDictionary = {
        text,
        url,
        ...(related ? { related } : {}),
        ...(via ? { via } : {}),
        ...(hashtags && hashtags.length
          ? { hashtags: hashtags.join(',') }
          : {}),
      };
      const query = Object.keys(params)
        .map((c) => `${encodeURIComponent(c)}=${encodeURIComponent(params[c])}`)
        .join('&');
      href = `http://twitter.com/intent/tweet?${query}`;
    }
    const isFloating = style && (style.top || style.left);
    return `
<a href="${href}"
  ${
    isFloating
      ? `style="top: ${style.top}px; left: ${style.left}px; position: absolute"`
      : `onmouseover="event.target.parentNode.style.background = 'rgba(100,100,100,0.1)'"
         onmouseout="event.target.parentNode.style.background = null"`
  }
  class="quotable-link${isFloating ? ' quotable-link-floating' : ''}"
>
  tweet
</a>`;
  }
  addLink(link: string, target: HTMLElement) {
    target.insertAdjacentHTML('beforeend', link);
  }
}
