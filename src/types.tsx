export type QrCode = {
    id: number;
    image_url: string;
    link_id: number;
    created_at: string;
    updated_at: string;
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

export type Link = {
    created_at: string;
    lookup_code: string;
    original_url: string;
    updated_at: string;
    clicks: Click[];
};

export type PageLink = {
    id: string;
    label: string;
    color: string;
    link: string;
};
export type Page = {
    lookup_code: string;
    published_lookup_code: string | null;
    title: string;
    description?: string;
    created_at: string;
    updated_at: string;
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
        social: {
            fb?: string;
            tiktok?: string;
            ig?: string;
            linkedin?: string;
        };
    };
};
