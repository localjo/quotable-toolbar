import { h, render } from 'preact';
import './styles.css';

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
interface IToolbarProps {
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
  hashtags?: string[];
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
    this.handleTextSelection = this.handleTextSelection.bind(this);
    this.handleTextDeselection = this.handleTextDeselection.bind(this);
    this.handleTwitterIntent = this.handleTwitterIntent.bind(this);
  }
  activate() {
    const {
      el,
      settings,
      setUpBlockquotes,
      handleTextSelection,
      handleTextDeselection,
      handleTwitterIntent,
    } = this;
    const { twitter, isActive } = settings;
    setUpBlockquotes.bind(this)();
    if (isActive.textSelection) {
      el.addEventListener('mouseup', handleTextSelection);
      document.addEventListener('mousedown', handleTextDeselection);
    }
    if (twitter && !window.__twitterIntentHandler) {
      document.addEventListener('click', handleTwitterIntent, false);
      window.__twitterIntentHandler = true;
    }
  }
  deactivate() {
    const {
      el,
      settings,
      handleTextSelection,
      handleTextDeselection,
      handleTwitterIntent,
    } = this;
    const { twitter } = settings;
    el.removeEventListener('mouseup', handleTextSelection);
    document.removeEventListener('mousedown', handleTextDeselection);
    if (twitter && window.__twitterIntentHandler) {
      document.removeEventListener('click', handleTwitterIntent);
    }
  }
  setUpBlockquotes() {
    const { el, settings, Toolbar, wrapContents } = this;
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
          wrapContents(paragraph, 'span', 'quotable-text');
          render(
            <Toolbar
              text={paragraph.textContent}
              url={url}
              twitter={twitter ? twitter : null}
            />,
            paragraph,
            paragraph
          );
        });
      } else {
        wrapContents(blockquote, 'span', 'quotable-text');
        render(
          <Toolbar
            text={blockquote.textContent}
            url={url}
            twitter={twitter ? twitter : null}
          />,
          blockquote,
          blockquote
        );
      }
    });
  }
  handleTextDeselection(e: MouseEvent) {
    const { el } = this;
    const target = e.target as HTMLElement;
    const isToolbarChild = !!target.closest('#quotable-toolbar');
    if (!isToolbarChild) {
      render(null, el, el);
    }
  }
  handleTextSelection() {
    const { el, settings, getSelectedText, Toolbar } = this;
    const { twitter, url } = settings;
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
        position: 'absolute',
      };
      render(
        <Toolbar
          text={text}
          url={url}
          style={style}
          twitter={twitter ? twitter : null}
        />,
        el,
        el
      );
    }
  }
  handleTwitterIntent(e: MouseEvent) {
    let target = e.target as HTMLAnchorElement;
    while (target && target.nodeName.toLowerCase() !== 'a') {
      target = target.parentNode as HTMLAnchorElement;
    }
    const intentRegex = /twitter\.com\/intent\/(\w+)/,
      windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes',
      width = 550,
      height = 420;
    if (target && target.nodeName.toLowerCase() === 'a' && target.href) {
      const isTwitterIntent = target.href.match(intentRegex);
      if (isTwitterIntent) {
        const left = Math.round(screen.width / 2 - width / 2);
        const top =
          screen.height > height
            ? Math.round(screen.height / 2 - height / 2)
            : 0;
        window.open(
          target.href,
          'intent',
          `${windowOptions},width=${width},height=${height},left=${left},top=${top}`
        );
        e.preventDefault();
      }
    }
  }
  wrapContents(el: HTMLElement, wrapper: string, className: string) {
    const span = document.createElement(wrapper);
    span.classList.add(className);
    span.innerHTML = el.innerHTML;
    el.innerHTML = span.outerHTML;
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
  Toolbar(props: IToolbarProps) {
    const { text, style, twitter, url } = props;
    const isFloat = style && (style.top || style.left);
    const instanceStyle = {
      ...style,
      textDecoration: 'none',
      ...(isFloat
        ? {
            transform: 'translate(-50%, -100%)',
          }
        : {}),
    };
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
    return (
      <span id={`${isFloat ? 'quotable-toolbar' : ''}`} style={instanceStyle}>
        <a
          class="quotable-link"
          href={href}
          onMouseOver={
            !isFloat
              ? (e: MouseEvent) => {
                  const target = e.target as HTMLElement;
                  const parent = target.closest('blockquote, p') as HTMLElement;
                  const wrapper = parent.querySelector(
                    '.quotable-text'
                  ) as HTMLElement;
                  wrapper.style.background = 'rgba(100,100,100,0.1)';
                }
              : () => {}
          }
          onMouseOut={
            !isFloat
              ? (e: MouseEvent) => {
                  const target = e.target as HTMLElement;
                  const parent = target.closest('blockquote, p') as HTMLElement;
                  const wrapper = parent.querySelector(
                    '.quotable-text'
                  ) as HTMLElement;
                  wrapper.style.background = null;
                }
              : () => {}
          }
        >
          <div
            style={{
              display: 'inline-block',
              width: '1em',
              height: '1em',
              lineHeight: '1em',
              fill: 'currentColor',
              margin: isFloat ? '0' : '0 0.2em',
            }}
            dangerouslySetInnerHTML={{
              __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -50 50 50"><path d="M49.998-40.494a20.542 20.542 0 01-5.892 1.614 10.28 10.28 0 004.511-5.671 20.53 20.53 0 01-6.514 2.488 10.246 10.246 0 00-7.488-3.237c-5.665 0-10.258 4.589-10.258 10.249 0 .804.091 1.586.266 2.337-8.526-.429-16.085-4.509-21.144-10.709a10.19 10.19 0 00-1.389 5.152c0 3.556 1.811 6.693 4.564 8.531a10.23 10.23 0 01-4.647-1.282l-.001.128c0 4.966 3.537 9.11 8.229 10.052a10.332 10.332 0 01-4.633.175 10.27 10.27 0 009.583 7.118 20.594 20.594 0 01-12.74 4.388 20.6 20.6 0 01-2.447-.145A29.048 29.048 0 0015.723-4.7c18.868 0 29.186-15.618 29.186-29.162 0-.445-.01-.887-.03-1.326a20.827 20.827 0 005.119-5.306z"/></svg>`,
            }}
          />
        </a>
      </span>
    );
  }
}
