'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/lib/supabase/database';
import useSWR from 'swr';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Navigation data
const navMain = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: 'solar:home-bold-duotone',
  },
];

const navTools = [
  // Free Tools
  {
    title: 'Image Resizer',
    url: '/image-resizer',
    icon: 'solar:minimize-square-3-line-duotone',
    isPro: false,
  },
  {
    title: 'Image Cropper',
    url: '/image-cropper',
    icon: 'solar:crop-bold-duotone',
    isPro: false,
  },
  {
    title: 'Image Compressor',
    url: '/image-compressor',
    icon: 'solar:minimize-square-2-line-duotone',
    isPro: false,
  },
  {
    title: 'Image Converter',
    url: '/image-converter',
    icon: 'solar:refresh-bold-duotone',
    isPro: false,
  },
  {
    title: 'Social Media Resizer',
    url: '/social-media-resizer',
    icon: 'solar:camera-bold-duotone',
    isPro: false,
  },
  {
    title: 'Social Presets',
    url: '/social-presets',
    icon: 'solar:smartphone-bold-duotone',
    isPro: false,
  },
  // Pro Tools
  {
    title: 'Background Removal',
    url: '/background-removal',
    icon: 'solar:magic-stick-bold-duotone',
    isPro: true,
  },
  {
    title: 'Image Watermark',
    url: '/image-watermark',
    icon: 'solar:waterdrops-bold-duotone',
    isPro: true,
  },
  {
    title: 'Image Editor',
    url: '/image-editor',
    icon: 'solar:palette-bold-duotone',
    isPro: true,
  },
  {
    title: 'Advanced Crop',
    url: '/advanced-crop',
    icon: 'solar:crop-minimalistic-bold-duotone',
    isPro: true,
  },
  {
    title: 'Filters & Effects',
    url: '/filters',
    icon: 'solar:magic-stick-3-bold-duotone',
    isPro: true,
  },
  {
    title: 'Text Overlay',
    url: '/text-overlay',
    icon: 'solar:text-bold-duotone',
    isPro: true,
  },
  {
    title: 'Color Picker',
    url: '/color-picker',
    icon: 'solar:palette-bold-duotone',
    isPro: true,
  },
  {
    title: 'Meme Generator',
    url: '/meme-generator',
    icon: 'solar:emoji-funny-bold-duotone',
    isPro: true,
  },
];

const navBatch = [
  {
    title: 'Batch Processor',
    url: '/batch-processor',
    icon: 'solar:layers-bold-duotone',
    isPro: true,
  },
  {
    title: 'Project Manager',
    url: '/project-manager',
    icon: 'solar:folder-open-bold-duotone',
    isPro: true,
  },
  {
    title: 'ZIP Download',
    url: '/zip-download',
    icon: 'solar:download-bold-duotone',
    isPro: true,
  },
];

const navSettings = [
  {
    title: 'General',
    url: '/dashboard/general',
    icon: 'solar:settings-bold-duotone',
  },
  {
    title: 'Activity',
    url: '/dashboard/activity',
    icon: 'solar:chart-bold-duotone',
  },
  {
    title: 'Security',
    url: '/dashboard/security',
    icon: 'solar:shield-bold-duotone',
  },
];

function NavMain({ items }: { items: typeof navMain }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === item.url}
                tooltip={item.title}
              >
                <Link href={item.url}>
                  <Icon icon={item.icon} className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function NavTools({ items }: { items: typeof navTools }) {
  const pathname = usePathname();
  const { data: userData } = useSWR<User>('/api/user', fetcher);
  const isPro = userData?.subscription_status === 'active' || userData?.subscription_status === 'trialing';

  const freeTools = items.filter(item => !item.isPro);
  const proTools = items.filter(item => item.isPro);

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Free Tools</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {freeTools.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.url}
                  tooltip={item.title}
                >
                  <Link href={item.url}>
                    <Icon icon={item.icon} className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      
      <SidebarGroup>
        <SidebarGroupLabel>Pro Tools</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {proTools.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.url}
                  tooltip={item.title}
                  className={!isPro ? 'opacity-60' : ''}
                >
                  <Link href={item.url}>
                    <Icon icon={item.icon} className="h-4 w-4" />
                    <span>{item.title}</span>
                    <Icon icon="solar:crown-bold-duotone" className="ml-auto h-3 w-3 text-blue-600" />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

function NavBatch({ items }: { items: typeof navBatch }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Batch Tools</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === item.url}
                tooltip={item.title}
              >
                <Link href={item.url}>
                  <Icon icon={item.icon} className="h-4 w-4" />
                  <span>{item.title}</span>
                  <Icon icon="solar:crown-bold-duotone" className="ml-auto h-3 w-3 text-blue-600" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function NavSettings({ items }: { items: typeof navSettings }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Settings</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === item.url}
                tooltip={item.title}
              >
                <Link href={item.url}>
                  <Icon icon={item.icon} className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function NavUser() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!user) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src="" alt={user.name || ''} />
                <AvatarFallback className="rounded-lg">
                  {user.email
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name || user.email}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
        </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
            side="right"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src="" alt={user.name || ''} />
                  <AvatarFallback className="rounded-lg">
                    {user.email
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name || user.email}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
      </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function AppSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <img src="/icon.png" alt="ResizeSuite" className="h-6 w-6" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">ResizeSuite</span>
                  <span className="truncate text-xs">Professional Image Tools</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavTools items={navTools} />
        <NavBatch items={navBatch} />
        <NavSettings items={navSettings} />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Manage Plan">
                  <Link href="/pricing">
                    <Icon icon="solar:card-bold-duotone" className="h-4 w-4" />
                    <span>Subscription</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

function SiteHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}