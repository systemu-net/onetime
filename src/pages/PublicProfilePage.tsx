/**
 * PublicProfilePage — the thin.ly/@handle route.
 *
 * Fetches the by-handle profile (passing the auth token when present so the API
 * resolves `is_owner`). Renders the public profile, a private placeholder, or a
 * not-found state. Owner-mode editing is layered on next (task #11); for now the
 * owner sees their public page like any visitor.
 */
import MainLayout from '@/components/layouts/MainLayout';
import ProfileEditor from '@/components/profile/ProfileEditor';
import PublicProfile, { PrivateProfileCard } from '@/components/profile/PublicProfile';
import '@/components/profile/profile.css';
import { getPublicProfile, isPrivateProfile } from '@/apis/profile';
import { DASHBOARD_ROUTE, REGISTER_ROUTE } from '@/routes';
import type { PublicProfileResponse } from '@/types';
import { getCachedUser } from '@/utils/userCache';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom';
import HomePage from './HomePage';

type LoadState =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'error' }
  | { status: 'ready'; data: PublicProfileResponse };

export default function PublicProfilePage() {
  const { handle: rawHandle = '' } = useParams();
  const [searchParams] = useSearchParams();
  const asVisitor = searchParams.get('view') === 'public';
  const [cookies] = useCookies(['token']);
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  // This route matches any single root segment; only "@handle" is a profile.
  // Anything else preserves the app's catch-all (marketing home) behaviour.
  const isProfilePath = rawHandle.startsWith('@');
  const handle = rawHandle.replace(/^@/, '');

  // Fast-path: if the cached current user already owns this handle, we render
  // the editor (in the app shell) immediately — no public fetch, and no flash
  // of the public/marketing chrome before swapping to the editor.
  const cachedUser = cookies.token ? getCachedUser() : null;
  const cachedOwner = !!cachedUser?.handle && cachedUser.handle.toLowerCase() === handle.toLowerCase();
  const ownerEditor = cachedOwner && !asVisitor;

  useEffect(() => {
    // Skip the public fetch when we'll render the editor anyway.
    if (!isProfilePath || ownerEditor) return;
    let active = true;
    setState({ status: 'loading' });
    getPublicProfile(handle, cookies.token)
      .then((data) => active && setState({ status: 'ready', data }))
      .catch((err: unknown) => {
        if (!active) return;
        setState({ status: err instanceof Error && err.message === 'not_found' ? 'not_found' : 'error' });
      });
    return () => {
      active = false;
    };
  }, [handle, isProfilePath, ownerEditor, cookies.token]);

  const loggedIn = Boolean(cookies.token);

  // Non-"@" root segment → keep the marketing-home catch-all behaviour.
  if (!isProfilePath) return <HomePage />;

  // Resolve ownership either from cache (instant) or from the fetched payload
  // (covers a stale/empty cache — e.g. a fresh login).
  const fetchedOwner = state.status === 'ready' && state.data.is_owner === true;

  // Owner → the editor (in-app), unless they explicitly chose "view as visitor".
  if ((cachedOwner || fetchedOwner) && !asVisitor) {
    return (
      <MainLayout>
        <ProfileEditor />
      </MainLayout>
    );
  }

  // Seamless brand splash while the profile loads (Instagram-style centered mark).
  if (state.status === 'loading') {
    return (
      <div className="tlp tlp-splash">
        <div className="tlp-splash-mark">
          thin<span>.ly</span>
        </div>
        <div className="tlp-splash-tag">// governed · verified · safe</div>
      </div>
    );
  }

  return (
    <div className="tlp tlp-page">
      <header className="tlp-topbar">
        <RouterLink to={DASHBOARD_ROUTE} className="tlp-wordmark">
          thin<span>.ly</span>
        </RouterLink>
        <div className="tlp-topbar-actions">
          {asVisitor && (cachedOwner || fetchedOwner) ? (
            <RouterLink to={`/@${handle}`} className="tlp-link-muted">
              ← Back to editor
            </RouterLink>
          ) : loggedIn ? (
            <RouterLink to={DASHBOARD_ROUTE} className="tlp-link-muted">
              Dashboard
            </RouterLink>
          ) : (
            <RouterLink to={REGISTER_ROUTE} className="tlp-btn tlp-btn--accent">
              Create your thin.ly
            </RouterLink>
          )}
        </div>
      </header>

      <main className="tlp-body">
        {state.status === 'not_found' && (
          <div className="tlp-notfound">
            <div className="tlp-notfound-handle">@{handle}</div>
            <p style={{ color: 'var(--ink-3)' }}>This profile hasn’t been created yet.</p>
            <RouterLink to={REGISTER_ROUTE} className="tlp-btn tlp-btn--accent">
              Claim your handle
            </RouterLink>
          </div>
        )}

        {state.status === 'error' && (
          <div className="tlp-empty">Couldn’t load this profile. Please try again.</div>
        )}

        {state.status === 'ready' &&
          (isPrivateProfile(state.data) ? (
            <PrivateProfileCard name={state.data.display_name} />
          ) : (
            <PublicProfile profile={state.data} />
          ))}
      </main>

      <footer className="tlp-footer">
        <div className="tlp-footer-min">
          <RouterLink to={DASHBOARD_ROUTE} className="tlp-wordmark">
            thin<span>.ly</span>
          </RouterLink>
          <span className="tlp-footer-tag">// governed links · verified safe</span>
          <RouterLink to={REGISTER_ROUTE} className="tlp-link-muted">
            Create your own&nbsp;→
          </RouterLink>
        </div>
      </footer>
    </div>
  );
}
