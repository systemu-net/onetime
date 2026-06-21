export type User = {
    id: number;
    email: string;
    handle?: string;
    avatar_url: string | null;
    role: string;
    plan: {
        name: string;
        features: string[];
    };
    created_at: string;
    updated_at: string;
    jti: string;
};

// ─── Public @handle profile (link-in-bio) ──────────────────────────────────

export type NamedAccent =
    | 'violet' | 'mint' | 'coral' | 'peach' | 'lilac' | 'sun' | 'sky';
// A preset name OR a custom hex color (#rrggbb), chosen via the color wheel.
// The `& {}` keeps autocomplete for the named presets while allowing any string.
export type Accent = NamedAccent | (string & {});

export type LinkState = 'active' | 'paused' | 'expired' | 'draft';

export type ProfilePrivacy = {
    is_public: boolean;
    show_followers: boolean;
    allow_follow: boolean;
    allow_messages: boolean;
};

// Keyed by social platform id (see socialPlatforms.tsx). Open-ended so new
// platforms can be added without a type change.
export type ProfileSocials = Partial<Record<string, string>>;

// A curated governed link as shown on the profile / in the editor.
export type ProfileLinkRow = {
    id: number;
    link_id: number;
    title: string;
    title_override: string | null;
    slug: string;
    url: string;
    host: string | null;
    clicks: number;
    state: LinkState;
    tag: string | null;
    pinned: boolean;
    visible: boolean;
    position: number;
    spark: number[];
};

// One of the user's links not yet on the profile (the "add" picker).
export type AvailableLink = {
    link_id: number;
    title: string;
    slug: string;
    url: string;
    host: string | null;
    clicks: number;
    state: LinkState;
};

export type Profile = {
    id: number;
    handle: string;
    display_name: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    accent: Accent;
    verified: boolean;
    socials: ProfileSocials;
    social_order?: string[];
    avatar_url: string | null;
    public_url: string;
    published: boolean;
    is_owner: boolean;
    private?: false;
    created_at: string;
    updated_at: string;
    // owner-only
    privacy?: ProfilePrivacy;
    published_at?: string | null;
    following_count?: number;
    // present on the public read + (gated) owner read
    followers_count?: number | null;
    links?: ProfileLinkRow[];
};

// Placeholder payload returned by the public endpoint for a private profile.
export type PrivateProfile = {
    handle: string;
    display_name: string | null;
    accent: Accent;
    is_owner: boolean;
    private: true;
};

export type PublicProfileResponse = Profile | PrivateProfile;

export type ProfileLinksResponse = {
    links: ProfileLinkRow[];
    available_links: AvailableLink[];
};

export type HandleCheck = {
    handle: string;
    available: boolean;
    reason: string | null;
};

export type QrCode = {
    id: number;
    image_url: string;
    created_at: string;
    updated_at: string;
    link: {
        lookup_code: string;
        original_url: string;
        title: string | null;
        description: string | null;
        scans_count: number;
    };
};

export type Notification = {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
};

export type NotificationContextType = {
    notifications: Notification[];
    addNotification: (
        message: string,
        type: 'success' | 'error' | 'info' | 'warning'
    ) => void;
    removeNotification: (id: string) => void;
};

export type Click = {
    id: number;
    country: string | null;
    ip_address: string;
    referrer: string | null;
    user_agent: string;
    created_at: string;
    updated_at: string;
    // Enhanced analytics fields
    city: string | null;
    region: string | null;
    country_name: string | null;
    postal_code: string | null;
    latitude: number | null;
    longitude: number | null;
    timezone: string | null;
    device_type: string | null;
    browser: string | null;
    browser_version: string | null;
    os: string | null;
    os_version: string | null;
    is_mobile: boolean | null;
    is_tablet: boolean | null;
    is_desktop: boolean | null;
    is_bot: boolean | null;
    source: string | null;
};

export type StatsPeriod = 'day' | 'week' | 'month' | 'year';

export type StatsData = {
    name: string;
    value: number;
};

export type PeriodStats = {
    total: number;
    views: number[];
    stats: {
        referrer: StatsData[];
        browser: StatsData[];
        os: StatsData[];
        country: StatsData[];
    };
};

export type LinkStats = {
    lastDay: PeriodStats;
    lastWeek: PeriodStats;
    lastMonth: PeriodStats;
    lastYear: PeriodStats;
    updatedAt: string;
};

// Enhanced Analytics Types
export type CityStats = {
    city: string;
    region: string;
    country: string;
    clicks: number;
};

export type CountryStats = {
    country: string;
    clicks: number;
};

export type BrowserStats = {
    browser: string;
    clicks: number;
};

export type OSStats = {
    os: string;
    clicks: number;
};

export type DailyClickStats = {
    date: string;
    clicks: number;
};

export type RecentClick = {
    id: number;
    city: string | null;
    region: string | null;
    country: string | null;
    device_type: string | null;
    browser: string | null;
    os: string | null;
    is_bot: boolean;
    source: string | null;
    created_at: string;
};

export type LinkAnalytics = {
    date_range: {
        start_date: string;
        end_date: string;
    };
    summary: {
        total_clicks: number;
        human_clicks: number;
        bot_clicks: number;
        qr_scans: number;
        direct_clicks: number;
    };
    devices: {
        mobile: number;
        desktop: number;
        tablet: number;
    };
    top_cities: CityStats[];
    countries: CountryStats[];
    browsers: BrowserStats[];
    operating_systems: OSStats[];
    daily_clicks: DailyClickStats[];
    recent_clicks: RecentClick[];
    referrer_sources: { source: string; clicks: number }[];
};

export type Link = {
    created_at: string;
    lookup_code: string;
    original_url: string;
    updated_at: string;
    title?: string | null;
    description?: string | null;
    clicks?: Click[]; // Returned when fetching individual link
    clicks_count?: number; // Returned when fetching list of links
    is_safe: boolean; // Safety status from threat detection
};

export type PageLink = {
    id: string;
    label: string;
    color: string;
    link: string;
    description?: string; // Used as alt/title text in rendered links
};

// Resource types for the new Resources API
export type ResourceLink = {
    id: number;
    lookup_code: string;
    original_url: string;
    title?: string | null;
    description?: string | null;
    clicks_count?: number;
    created_at: string;
    updated_at: string;
};

export type Resource = {
    id: number;
    sort_order: number;
    color?: string | null;
    linkable_type: 'Link' | 'QrCode' | 'Image';
    linkable: ResourceLink; // Can be expanded to include QrCode and Image types later
};

export type PortfolioWork = { title: string; category?: string; year?: string; image?: string; url?: string };
export type PortfolioCapability = { title: string; description?: string };
export type PortfolioContent = {
    monogram?: string;
    eyebrow?: string;
    firstName?: string;
    lastName?: string;
    tagline?: string;
    location?: string;
    timezone?: string;
    coordinates?: string;
    availability?: string;
    statement?: string;
    about?: string[];
    services?: string[];
    work?: PortfolioWork[];
    capabilities?: PortfolioCapability[];
    email?: string;
    social?: Page['content']['social'];
};

export type Page = {
    id?: number;
    lookup_code: string;
    published_lookup_code: string | null;
    title: string;
    description?: string;
    created_at: string;
    updated_at: string;
    published_at?: string | null;
    published_url?: string | null;
    status?: 'DRAFT' | 'PUBLISHED';  // Backend only has these two statuses
    has_published_version?: boolean | null;
    has_draft_version?: boolean;
    published_version?: {
        lookup_code: string;
        published_at: string;
        published_url: string;
    };
    links: PageLink[];
    content: {
        button:
        | 'rounded-full'
        | 'rounded'
        | 'rounded-sm'
        | 'rounded-lg'
        | 'squared';
        buttonColor: string;
        textColor: string;
        background: string;
        backgroundType: string; // 'color' | 'gradient';
        backgroundColor?: string; // For solid color background
        gradientStart?: string; // For gradient: starting color
        gradientEnd?: string; // For gradient: ending color
        gradientDirection?:
        | 'to right'
        | 'to bottom'
        | 'to top right'
        | 'to bottom left'; // Gradient direction
        fontFamily: string;
        profileImage?: string; // Profile/avatar image URL or base64
        backgroundImage?: string; // Full-bleed background image URL (when backgroundType === 'image')
        social: {
            fb?: string;
            tiktok?: string;
            ig?: string;
            linkedin?: string;
            x?: string;
        };
        // Which template renders this page. Defaults to the link-in-bio card.
        template?: 'links' | 'portfolio';
        accent?: string; // Portfolio accent (hex)
        portfolio?: PortfolioContent;
    };
};
