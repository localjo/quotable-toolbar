import { h } from 'preact';
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
export default class Quotable {
    settings: IQuotableSettings;
    el: HTMLElement;
    constructor(settings: IQuotableSettings);
    activate(): void;
    deactivate(): void;
    setUpBlockquotes(): void;
    handleTextDeselection(e: MouseEvent): void;
    handleTextSelection(): void;
    handleTwitterIntent(e: MouseEvent): void;
    wrapContents(el: HTMLElement, wrapper: string, className: string): void;
    getSelectedText(): any;
    Toolbar(props: IToolbarProps): h.JSX.Element;
}
export {};
