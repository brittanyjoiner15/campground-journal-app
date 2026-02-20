import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Search } from './pages/Search';
import { CampgroundDetails } from './pages/CampgroundDetails';
import { MyJournal } from './pages/MyJournal';
import { JournalEntryDetails } from './pages/JournalEntryDetails';
import { Feed } from './pages/Feed';
import { Profile } from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
              path="/profile/:username"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
