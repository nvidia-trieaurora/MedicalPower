'use client';

import { Globe, Bell, User, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/lib/locale-context';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export function Header() {
  const { locale, toggleLocale, t } = useLocale();
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div />

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLocale}
          className="gap-1.5 text-xs font-medium"
        >
          <Globe className="h-4 w-4" />
          {locale === 'vi' ? 'VI' : 'EN'}
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-[10px] flex items-center justify-center">
            3
          </Badge>
        </Button>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted outline-none">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">{getInitials(user.fullName)}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{user.fullName}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                {user.email}
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                {user.role}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                {t('common.nav.settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('common.nav.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button variant="outline" size="sm" className="gap-1.5">
              <LogIn className="h-3.5 w-3.5" />
              {t('auth.login.submit')}
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
