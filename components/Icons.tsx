type IconProps = React.SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="1em" height="1em" {...props}>
            {children}
        </svg>
    );
}

export const PawIcon = (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="1em" height="1em" {...props}>
        <ellipse cx="12" cy="16.5" rx="5" ry="4.2" />
        <circle cx="5.5" cy="10.5" r="2.2" />
        <circle cx="9.2" cy="6.5" r="2.2" />
        <circle cx="14.8" cy="6.5" r="2.2" />
        <circle cx="18.5" cy="10.5" r="2.2" />
    </svg>
);

export const HeartIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />
    </Icon>
);

export const PhoneIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
    </Icon>
);

export const ChatIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </Icon>
);

export const MailIcon = (props: IconProps) => (
    <Icon {...props}>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </Icon>
);

export const PinIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </Icon>
);

export const ClockIcon = (props: IconProps) => (
    <Icon {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
    </Icon>
);

export const ArrowRightIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M5 12h14M12 5l7 7-7 7" />
    </Icon>
);

export const ArrowLeftIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M19 12H5M12 19l-7-7 7-7" />
    </Icon>
);

export const CheckIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M20 6 9 17l-5-5" />
    </Icon>
);

export const XIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M18 6 6 18M6 6l12 12" />
    </Icon>
);

export const MenuIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M4 6h16M4 12h16M4 18h16" />
    </Icon>
);

export const InstagramIcon = (props: IconProps) => (
    <Icon {...props}>
        <rect width="20" height="20" x="2" y="2" rx="5" />
        <path d="M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4ZM17.5 6.5h.01" />
    </Icon>
);

export const FacebookIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z" />
    </Icon>
);

export const UploadIcon = (props: IconProps) => (
    <Icon {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </Icon>
);
