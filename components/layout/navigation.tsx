'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, LogOut, User } from 'lucide-react';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { profile, loading, signOut: authSignOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    if (isSigningOut) {
      console.log('Sign out already in progress, ignoring click');
      return;
    }
    
    try {
      setIsSigningOut(true);
      console.log('Sign out clicked - starting sign out process');
      await authSignOut();
      console.log('Sign out successful - redirecting to home');
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Still redirect even if there's an error
      router.push('/');
    } finally {
      setIsSigningOut(false);
    }
  }

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="hidden md:flex items-center space-x-4">
        <Link href="/sign-in">
          <Button variant="ghost" size="sm" className="text-gray-700 hover:text-blue-600 rounded-full px-6 py-2 font-medium transition-all duration-200 hover:bg-blue-50">
            Sign In
          </Button>
        </Link>
        <Link href="/sign-up">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-base font-semibold rounded-[5px] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
            Get Started Free
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9 border-2 border-blue-200 shadow-md">
          <AvatarImage src={profile.avatar_url || ''} alt={profile.name || profile.email} />
          <AvatarFallback className="!bg-gradient-to-br !from-blue-500 !to-blue-600 !text-white font-semibold">
            {profile.name 
              ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase()
              : profile.email.split('@')[0].slice(0, 2).toUpperCase()
            }
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/pricing" className="flex w-full items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Pricing</span>
          </Link>
        </DropdownMenuItem>
        {/* Admin access - check if user is admin */}
        {profile && (profile as any).is_admin && (
          <DropdownMenuItem className="cursor-pointer">
            <Link href="/admin" className="flex w-full items-center">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Admin Panel</span>
            </Link>
          </DropdownMenuItem>
        )}
        <div className="px-2 py-1.5">
          <button
            className={`flex w-full items-center px-2 py-1.5 text-sm rounded-md cursor-pointer ${
              isSigningOut 
                ? 'text-gray-400 bg-gray-50 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Sign out button clicked');
              handleSignOut();
            }}
            disabled={isSigningOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { profile, loading } = useAuth();

  const navigationItems = [
    { name: 'Features', href: '#free-tools' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
  ];

  const toolsMenuItems = [
    { name: 'Social Media Resizer', href: '/social-media-resizer', icon: 'solar:layers-bold-duotone' },
    { name: 'Image Resizer', href: '/image-resizer', icon: 'solar:resize-bold-duotone' },
    { name: 'Image Cropper', href: '/image-cropper', icon: 'solar:crop-bold-duotone' },
    { name: 'Image Compressor', href: '/image-compressor', icon: 'solar:minimize-square-2-line-duotone' },
    { name: 'Image Converter', href: '/image-converter', icon: 'solar:refresh-bold-duotone' },
    { name: 'Background Removal', href: '/background-removal', icon: 'solar:magic-stick-bold-duotone' },
    { name: 'Social Presets', href: '/social-presets', icon: 'solar:layers-bold-duotone' },
    { name: 'Watermark Tool', href: '/image-watermark', icon: 'solar:shield-bold-duotone' },
    { name: 'Batch Processor', href: '/batch-processor', icon: 'solar:folder-bold-duotone' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="ResizeSuite" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer flex items-center gap-1">
                Tools
                <Icon icon="solar:alt-arrow-down-bold-duotone" className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {toolsMenuItems.map((tool, index) => (
                  <div key={tool.name}>
                    <DropdownMenuItem asChild>
                      <Link href={tool.href} className="flex items-center gap-3 p-3">
                        <Icon icon={tool.icon} className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">{tool.name}</span>
                      </Link>
                    </DropdownMenuItem>
                    {index === 3 && <DropdownMenuSeparator />}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="flex items-center space-x-4">
                <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
              </div>
            ) : (
              <UserMenu />
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              <Icon 
                icon={isMenuOpen ? "solar:close-circle-bold-duotone" : "solar:hamburger-menu-bold-duotone"} 
                className="h-6 w-6 text-gray-700" 
              />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 px-4 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Tools Section */}
              <div className="px-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tools</div>
                <div className="grid grid-cols-2 gap-2">
                  {toolsMenuItems.map((tool) => (
                    <Link
                      key={tool.name}
                      href={tool.href}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon icon={tool.icon} className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">{tool.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-gray-200">
                {!profile ? (
                  <>
                    <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start rounded-full px-6 py-2 font-medium">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up" onClick={() => setIsMenuOpen(false)}>
                      <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-base font-semibold rounded-[5px] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                        Get Started Free
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start rounded-full px-6 py-2 font-medium">
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/pricing" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start rounded-full px-6 py-2 font-medium">
                        Pricing
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
