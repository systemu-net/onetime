export type User = {
    id: number;
    email: string;
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
        social: {
            fb?: string;
            tiktok?: string;
            ig?: string;
            linkedin?: string;
        };
    };
};
