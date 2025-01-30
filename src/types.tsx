
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
export type Link = {
    created_at: string;
    lookup_code: string;
    original_url: string;
    updated_at: string;
};

export type PageLink = {
    id: string,
    label: string,
    color: string,
    link: string,
}

export type Page = {
    id: number;
    url: string;
    created_at: string;
    updated_at: string;
    links: PageLink[];
    configuration: {
        button: "rounded-full" | "rounded" | "rounded-sm" | "rounded-lg" | "squared"
        textColor: string;
        background: string;
        fontFamily: string;
        social: {
            fb?: string;
            tiktok?: string;
            ig?: string;
            linkedin?: string;
        }
    }
};