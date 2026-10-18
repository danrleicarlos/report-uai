import type * as React from 'react';
type Tone = 'red' | 'ink' | 'paper';
export interface ButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> { variant?: 'primary' | 'outline' | 'ink' | 'pill'; icon?: 'arrow' | 'whatsapp' | 'none'; href?: string; children?: React.ReactNode }
export declare function Button(props: ButtonProps): React.ReactElement;
export interface KickerProps { children?: React.ReactNode; tone?: 'red' | 'muted'; rule?: boolean }
export declare function Kicker(props: KickerProps): React.ReactElement | null;
export interface HeadlineProps { children?: React.ReactNode | React.ReactNode[]; accent?: string; size?: 'xl' | 'l' | 'm'; accentStyle?: 'underline' | 'italic' | 'strike' | 'plain'; breakBeforeAccent?: boolean; as?: string }
export declare function Headline(props: HeadlineProps): React.ReactElement;
export interface RuleProps { className?: string }
export declare function Rule(props: RuleProps): React.ReactElement;
export interface AnnotationProps { children?: React.ReactNode; variant?: 'hand' | 'marker'; tone?: 'red' | 'ink'; rotate?: number }
export declare function Annotation(props: AnnotationProps): React.ReactElement;
export interface ScribbleProps { kind?: 'crown' | 'x' | 'tally' | 'arrow' | 'strike' | 'splat' | 'cup'; tone?: Tone; size?: number; rotate?: number }
export declare function Scribble(props: ScribbleProps): React.ReactElement;
export interface StatBlockProps { value: React.ReactNode; suffix?: string; label?: string; note?: string }
export declare function StatBlock(props: StatBlockProps): React.ReactElement;
export interface LinkCardProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> { index?: string; tag?: string; title: string; sub?: string; variant?: 'default' | 'primary'; whatsapp?: boolean }
export declare function LinkCard(props: LinkCardProps): React.ReactElement;
export interface TapeProps { items?: string[]; tilt?: number; animated?: boolean }
export declare function Tape(props: TapeProps): React.ReactElement;
export interface InstagramPostProps { variant?: 'cover' | 'list' | 'statement' | 'stat' | 'cta'; format?: 'feed' | 'story'; kicker?: string; title?: string | string[]; accent?: string; body?: string; items?: string[]; value?: string; suffix?: string; note?: string; image?: string; alt?: string; action?: string; page?: string; handle?: string; scale?: number }
export declare function InstagramPost(props: InstagramPostProps): React.ReactElement;
export interface LinkedInPostProps { variant?: 'insight' | 'quote'; kicker?: string; title?: string | string[]; accent?: string; value?: string; suffix?: string; label?: string; note?: string; body?: string; role?: string; page?: string; handle?: string; scale?: number }
export declare function LinkedInPost(props: LinkedInPostProps): React.ReactElement;
export interface SlideProps { variant?: 'title' | 'section' | 'content' | 'data' | 'statement'; kicker?: string; title?: string | string[]; accent?: string; body?: string; items?: string[]; stats?: { value: string; label: string }[]; number?: string; image?: string; alt?: string; page?: string; handle?: string; scale?: number }
export declare function Slide(props: SlideProps): React.ReactElement;
declare global { interface Window { DC: { Button: typeof Button; Kicker: typeof Kicker; Headline: typeof Headline; Rule: typeof Rule; Annotation: typeof Annotation; Scribble: typeof Scribble; StatBlock: typeof StatBlock; LinkCard: typeof LinkCard; Tape: typeof Tape; InstagramPost: typeof InstagramPost; LinkedInPost: typeof LinkedInPost; Slide: typeof Slide } } }
