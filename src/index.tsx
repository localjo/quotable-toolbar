import { h, render } from 'preact';
import TwitterIcon from './twitter.svg';
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
          <TwitterIcon
            style={{
              width: '1em',
              height: '1em',
              lineHeight: '1em',
              fill: 'currentColor',
              margin: isFloat ? '0' : '0 0.2em',
            }}
          />
        </a>
      </span>
    );
  }
}
