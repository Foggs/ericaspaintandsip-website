import { type ReactNode, useEffect, useRef } from 'react';
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useAuth } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { setAuthTokenGetter } from '@workspace/api-client-react';

import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

import { AdminLayout } from '@/components/layout/admin-layout';
import { DashboardPage } from '@/pages/dashboard';
import { EventsPage } from '@/pages/events';
import { EventFormPage } from '@/pages/event-form';
import { GalleryPage } from '@/pages/gallery';
import { PostsPage } from '@/pages/posts';
import { PostFormPage } from '@/pages/post-form';
import { SignInPage } from '@/pages/sign-in';
import { SignUpPage } from '@/pages/sign-up';

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: 'hsl(287, 65%, 45%)',
    colorForeground: 'hsl(224, 71%, 4%)',
    colorMutedForeground: 'hsl(215, 16%, 47%)',
    colorDanger: 'hsl(0, 72%, 51%)',
    colorBackground: 'hsl(0, 0%, 100%)',
    colorInput: 'hsl(220, 14%, 91%)',
    colorInputForeground: 'hsl(224, 71%, 4%)',
    colorNeutral: 'hsl(220, 14%, 91%)',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.5rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-foreground font-bold',
    headerSubtitle: 'text-muted-foreground',
    socialButtonsBlockButtonText: 'text-foreground',
    formFieldLabel: 'text-foreground',
    footerActionLink: 'text-primary hover:text-primary',
    footerActionText: 'text-muted-foreground',
    dividerText: 'text-muted-foreground',
    identityPreviewEditButton: 'text-primary',
    formFieldSuccessText: 'text-green-600',
    alertText: 'text-foreground',
    logoBox: 'mb-2',
    logoImage: 'h-10 w-auto',
    socialButtonsBlockButton: 'border border-border hover:bg-secondary',
    formButtonPrimary: 'bg-primary hover:bg-primary text-primary-foreground',
    formFieldInput: 'border-input bg-background text-foreground',
    footerAction: 'bg-transparent',
    dividerLine: 'bg-border',
    alert: 'bg-secondary',
    otpCodeFieldInput: 'border-input',
    formFieldRow: '',
    main: '',
  },
};

const queryClient = new QueryClient();

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  return (
    <>
      <Show when="signed-in">
        <AdminLayout>
          <Component />
        </AdminLayout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

/**
 * Wires Clerk's session token into every API request via the Bearer token
 * header. Called once per render cycle so the getter always returns a fresh
 * short-lived token (Clerk rotates them automatically).
 *
 * On sign-out, clears the getter so subsequent requests are unauthenticated.
 */
function ClerkAuthSync() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      setAuthTokenGetter(getToken);
    } else {
      setAuthTokenGetter(null);
    }
    return () => {
      setAuthTokenGetter(null);
    };
  }, [isSignedIn, getToken]);

  return null;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={HomeRedirect} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/dashboard"><ProtectedRoute component={DashboardPage} /></Route>
        <Route path="/events"><ProtectedRoute component={EventsPage} /></Route>
        <Route path="/events/new"><ProtectedRoute component={EventFormPage} /></Route>
        <Route path="/events/:id/edit"><ProtectedRoute component={EventFormPage} /></Route>
        <Route path="/gallery"><ProtectedRoute component={GalleryPage} /></Route>
        <Route path="/posts"><ProtectedRoute component={PostsPage} /></Route>
        <Route path="/posts/new"><ProtectedRoute component={PostFormPage} /></Route>
        <Route path="/posts/:id/edit"><ProtectedRoute component={PostFormPage} /></Route>
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
      appearance={clerkAppearance}
      localization={{ signIn: { start: { title: 'Admin Sign In', subtitle: 'Sign in to manage your studio content' } } }}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkAuthSync />
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
