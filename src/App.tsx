import { useState } from "react";
import { Page, User, Location } from "./types";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProposePage } from "./pages/ProposePage";
import { AboutPage } from "./pages/AboutPage";
import { LegalPage } from "./pages/LegalPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LocationDetail } from "./components/LocationDetail";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [user, setUser] = useState<User | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setSelectedLocation(null);
    window.scrollTo(0, 0);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentPage("home");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("home");
  };

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleCloseLocation = () => {
    setSelectedLocation(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <HomePage 
            onSelectLocation={handleSelectLocation} 
            onNavigate={handleNavigate}
          />
        );
      case "login":
        return <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />;
      case "register":
        return <RegisterPage onNavigate={handleNavigate} onLogin={handleLogin} />;
      case "propose":
        return <ProposePage onNavigate={handleNavigate} user={user} />;
      case "about":
        return <AboutPage onNavigate={handleNavigate} />;
      case "legal":
        return <LegalPage onNavigate={handleNavigate} />;
      case "dashboard":
        return <DashboardPage onNavigate={handleNavigate} user={user} />;
      default:
        return <HomePage onSelectLocation={handleSelectLocation} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header 
        onNavigate={handleNavigate} 
        user={user} 
        onLogout={handleLogout}
      />
      
      <main className="flex-1">
        {renderPage()}
      </main>

      {selectedLocation && (
        <LocationDetail 
          location={selectedLocation} 
          onClose={handleCloseLocation} 
        />
      )}

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}