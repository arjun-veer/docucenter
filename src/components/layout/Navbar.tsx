
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut, Bell, Settings } from 'lucide-react';
import { useAuth } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4 px-6 md:px-8',
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 text-2xl font-semibold tracking-tight animate-fade-in"
          >
            <div className="rounded-md bg-primary p-1 text-primary-foreground">
              <span className="sr-only">Competitive Exam Hub</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-6 w-6"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
            </div>
            <span className="hidden sm:inline">CompExamHub</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              <Link 
                to="/" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === "/" ? "text-primary" : "text-muted-foreground"
                )}
              >
                Home
              </Link>
              <Link 
                to="/exams" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname.includes("/exams") ? "text-primary" : "text-muted-foreground"
                )}
              >
                Exams
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/dashboard" 
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname.includes("/dashboard") ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  Dashboard
                </Link>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <Link 
                  to="/notifications" 
                  className="p-2 relative hover:bg-muted rounded-full transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </Link>
              )}
            
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-2 transition-all hover:bg-secondary"
                    >
                      <span className="font-medium">{currentUser?.name || 'User'}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => logout()}
                      className="flex items-center gap-2 cursor-pointer text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/auth">Log in</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/auth?mode=signup">Sign up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-4 py-4 mt-4 bg-white rounded-lg shadow-lg animate-slide-down">
            <div className="flex flex-col gap-4">
              <Link 
                to="/" 
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  location.pathname === "/" 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground hover:bg-muted"
                )}
              >
                Home
              </Link>
              <Link 
                to="/exams" 
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  location.pathname.includes("/exams") 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground hover:bg-muted"
                )}
              >
                Exams
              </Link>
              {isAuthenticated && (
                <>
                  <Link 
                    to="/dashboard" 
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                      location.pathname.includes("/dashboard") 
                        ? "bg-primary/10 text-primary" 
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/notifications" 
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                      location.pathname.includes("/notifications") 
                        ? "bg-primary/10 text-primary" 
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    Notifications
                  </Link>
                  <Link 
                    to="/profile" 
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                      location.pathname.includes("/profile") 
                        ? "bg-primary/10 text-primary" 
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                      location.pathname.includes("/settings") 
                        ? "bg-primary/10 text-primary" 
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    Settings
                  </Link>
                </>
              )}
              
              <div className="border-t pt-4 mt-2">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 font-medium">
                      {currentUser?.name || 'User'}
                    </div>
                    <button
                      onClick={() => logout()}
                      className="w-full px-4 py-2 mt-2 text-sm font-medium text-left text-destructive rounded-md hover:bg-destructive/10"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" asChild>
                      <Link to="/auth">Log in</Link>
                    </Button>
                    <Button asChild>
                      <Link to="/auth?mode=signup">Sign up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
