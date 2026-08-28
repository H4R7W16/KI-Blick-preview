/**
 * Dev-only routes. This file is dynamically imported only in development mode
 * so that none of its dependencies end up in the production bundle.
 */
import { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';

const VideoShowcasePage = lazy(() => import('./pages/VideoShowcasePage'));
const AttributeReviewPage = lazy(() => import('./pages/AttributeReviewPage'));
const DiversityGalleryPage = lazy(() => import('./pages/DiversityGalleryPage'));

export default function DevRoutes() {
  return (
    <>
      <Route path="/beispielvideo" element={<Suspense fallback={null}><VideoShowcasePage /></Suspense>} />
      <Route path="/review-attribute" element={<Suspense fallback={null}><AttributeReviewPage /></Suspense>} />
      <Route path="/diversity-gallery" element={<Suspense fallback={null}><DiversityGalleryPage /></Suspense>} />
    </>
  );
}
