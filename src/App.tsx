import React, { useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { AuthProvider } from './context/AuthContext';
import { ClientConfigProvider } from './context/ClientConfigContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { CataloguePage } from './pages/CataloguePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { CraftsmanshipPage } from './pages/CraftsmanshipPage';
import { InspirationPage } from './pages/InspirationPage';
import { ContactPage } from './pages/ContactPage';
import { EmptyState } from './components/common/EmptyState';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminProductList } from './pages/admin/AdminProductList';
import { AdminProductEditor } from './pages/admin/AdminProductEditor';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminCollections } from './pages/admin/AdminCollections';
import { AdminShowroomMedia } from './pages/admin/AdminShowroomMedia';
import { AdminHeroFrames } from './pages/admin/AdminHeroFrames';
import { AdminSiteSettings } from './pages/admin/AdminSiteSettings';
import { AdminStorageAudit } from './pages/admin/AdminStorageAudit';
import { AdminEnquiries } from './pages/admin/AdminEnquiries';
import { AdminLogin } from './pages/admin/AdminLogin';
import { CinematicHeroProvider } from './context/CinematicHeroContext';
import { CinematicShowroomBackground } from './components/layout/CinematicShowroomBackground';

export const App: React.FC = () => {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');

  // Scroll to top automatically when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Scroll-responsive glass reveals for public floating panels (handles async page loads)
  useEffect(() => {
    if (isAdminRoute) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.querySelectorAll('.scroll-reveal').forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );

    const observeNewElements = () => {
      const elements = document.querySelectorAll('.scroll-reveal:not([data-reveal-observed="true"])');
      elements.forEach((el) => {
        el.setAttribute('data-reveal-observed', 'true');
        observer.observe(el);
      });
    };

    observeNewElements();

    const mutationObserver = new MutationObserver(() => {
      observeNewElements();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [location, isAdminRoute]);

  return (
    <ClientConfigProvider>
      <AuthProvider>
        <CinematicHeroProvider>
          {!isAdminRoute && <Header />}
          {!isAdminRoute && <CinematicShowroomBackground />}
          <main className={!isAdminRoute ? 'showroom-public-main' : ''}>
            <Switch>
          {/* Public Website Routes */}
          <Route path="/" component={HomePage} />
          <Route path="/catalogue" component={CataloguePage} />
          <Route path="/product/:slug" component={ProductDetailPage} />
          <Route path="/collections" component={CollectionsPage} />
          <Route path="/craftsmanship" component={CraftsmanshipPage} />
          <Route path="/inspiration" component={InspirationPage} />
          <Route path="/contact" component={ContactPage} />

          {/* Admin Routes */}
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin">
            <AdminLayout>
              <AdminOverview />
            </AdminLayout>
          </Route>
          <Route path="/admin/products">
            <AdminLayout>
              <AdminProductList />
            </AdminLayout>
          </Route>
          <Route path="/admin/products/new">
            <AdminLayout>
              <AdminProductEditor />
            </AdminLayout>
          </Route>
          <Route path="/admin/products/:id">
            <AdminLayout>
              <AdminProductEditor />
            </AdminLayout>
          </Route>
          <Route path="/admin/categories">
            <AdminLayout>
              <AdminCategories />
            </AdminLayout>
          </Route>
          <Route path="/admin/collections">
            <AdminLayout>
              <AdminCollections />
            </AdminLayout>
          </Route>
          <Route path="/admin/media">
            <AdminLayout>
              <AdminShowroomMedia />
            </AdminLayout>
          </Route>
          <Route path="/admin/hero-frames">
            <AdminLayout>
              <AdminHeroFrames />
            </AdminLayout>
          </Route>
          <Route path="/admin/settings">
            <AdminLayout>
              <AdminSiteSettings />
            </AdminLayout>
          </Route>
          <Route path="/admin/storage-audit">
            <AdminLayout>
              <AdminStorageAudit />
            </AdminLayout>
          </Route>
          <Route path="/admin/enquiries">
            <AdminLayout>
              <AdminEnquiries />
            </AdminLayout>
          </Route>

          {/* 404 Fallback Route */}
          <Route>
            <div style={{ padding: 'var(--space-24) 0' }}>
              <div className="container">
                <EmptyState
                  type="generic"
                  title="Page Outside Atelier Registry"
                  description="The architectural page or reference you requested does not exist."
                  actionLabel="Return to Showroom Overview"
                  actionHref="/"
                />
              </div>
            </div>
          </Route>
        </Switch>
      </main>
      {!isAdminRoute && <Footer />}
        </CinematicHeroProvider>
      </AuthProvider>
    </ClientConfigProvider>
  );
};
