export const FEATURES_ROUTE = "/features";
export const RESOURCES_ROUTE = "/resources";
export const ABOUT_ROUTE = "/about";
// "/contact" would be 7 alphanumeric chars and collide with the short-code
// lookup route in Rails (constraint: { lookup_code: /[a-zA-Z0-9]{7}/ }).
// Renamed to /contact_us so it doesn't trip the resolver.
export const CONTACT_ROUTE = "/contact_us";
export const REGISTER_ROUTE = "/register";
export const LOGIN_ROUTE = "/login";
export const DASHBOARD_ROUTE = "/";
export const LOGOUT_ROUTE = "/logout";
export const LANDING_ROUTE = "/branding";
export const HOME_ROUTE = "/home";
export const LINKS_ROUTE = "/links";
export const QR_ROUTE = "/qr";
export const CREATE_QR_ROUTE = "/qr/create";
export const CREATE_PAGES_ROUTE = "/pages/create";
export const PROFILE_ROUTE = "/settings/profile";
export const PAGES_ROUTE = "/pages";
export const ANALYTICS_ROUTE = "/analytics";
export const PLANS_ROUTE = "/plans";
export const SETTINGS_ROUTE = "/settings";
export const STATS_ROUTE = "/stats";

export const GOVERNANCE_ROUTE = "/governance";
export const CAMPAIGNS_ROUTE = "/governance/campaigns";

// Legal routes
export const TERMS_ROUTE = "/terms";
export const PRIVACY_ROUTE = "/privacy_policy";
// "/cookies" would be 7 alphanumeric chars and collide with the short-code
// lookup route in Rails. Renamed to /cookie_policy to match the existing
// /privacy_policy and /user_policy pattern.
export const COOKIES_ROUTE = "/cookie_policy";
export const USER_POLICY_ROUTE = "/user_policy";
