import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { CampingLoader } from './components/common/CampingLoader';

// 🔥 CODE SPLITTING: Lazy load pages (reduces initial bundle by ~200KB!)
import { Home } from './pages/Home'; // Keep home page eager
import { Login } from './pages/Login'; // Keep auth pages eager
import { Signup } from './pages/Signup';

// Lazy load everything else
const Search = lazy(() => import('./pages/Search').then(m => ({ default: m.Search })));
const CampgroundDetails = lazy(() => import('./pages/CampgroundDetails').then(m => ({ default: m.CampgroundDetails })));
const MyJournal = lazy(() => import('./pages/MyJournal').then(m => ({ default: m.MyJournal })));
const JournalEntryDetails = lazy(() => import('./pages/JournalEntryDetails').then(m => ({ default: m.JournalEntryDetails })));
const Feed = lazy(() => import('./pages/Feed').then(m => ({ default: m.Feed })));
const Map = lazy(() => import('./pages/Map').then(m => ({ default: m.Map })));
const UserMap = lazy(() => import('./pages/UserMap').then(m => ({ default: m.UserMap })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-sand-50">
    <CampingLoader message="Hitting the road" size="large" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/search" element={<Search />} />
              <Route path="/campground/:id" element={<CampgroundDetails />} />
            <Route
              path="/journal"
              element={
                <ProtectedRoute>
                  <MyJournal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journal-entry/:id"
              element={
                <ProtectedRoute>
                  <JournalEntryDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feed"
              element={
                <ProtectedRoute>
                  <Feed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <Map />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:username"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:username/map"
              element={
                <ProtectedRoute>
                  <UserMap />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
