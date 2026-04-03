'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { KeyRound, RefreshCw, Search, Check, UserPlus, Lock, Unlock, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { permissionApi, type UserPermissionInfo } from '@/lib/api';
import { PERMISSION_KEYS, PERMISSION_LABELS, type PermissionKey } from '@/lib/permissions';
import { useAuth } from '@/lib/auth-context';
import { useLocale } from '@/lib/locale-context';

const roleColor: Record<string, string> = {
  system_admin: 'bg-red-100 text-red-700', org_admin: 'bg-orange-100 text-orange-700',
  clinical_lead: 'bg-purple-100 text-purple-700', radiologist: 'bg-blue-100 text-blue-700',
  annotator: 'bg-green-100 text-green-700', qa_reviewer: 'bg-indigo-100 text-indigo-700',
  data_scientist: 'bg-cyan-100 text-cyan-700', viewer: 'bg-gray-100 text-gray-700',
};
const roleLabel: Record<string, string> = {
  system_admin: 'System Admin', org_admin: 'Org Admin', clinical_lead: 'Clinical Lead',
  radiologist: 'Radiologist', annotator: 'Annotator', qa_reviewer: 'QA Reviewer',
  data_scientist: 'Data Scientist', viewer: 'Viewer',
};

function fuzzyMatch(text: string, query: string): { match: boolean; score: number } {
  const lower = text.toLowerCase(); const q = query.toLowerCase().trim();
  if (!q) return { match: false, score: 0 };
  if (lower === q) return { match: true, score: 100 };
  if (lower.startsWith(q)) return { match: true, score: 90 };
  if (lower.includes(q)) return { match: true, score: 70 };
  let qi = 0;
  for (let i = 0; i < lower.length && qi < q.length; i++) { if (lower[i] === q[qi]) qi++; }
  if (qi === q.length) return { match: true, score: 50 };
  return { match: false, score: 0 };
}

export default function PermissionsPage() {
  const { locale } = useLocale();
  const { user: currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState<UserPermissionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserPermissionInfo | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantEmail, setGrantEmail] = useState('');
  const [grantPermission, setGrantPermission] = useState<PermissionKey>('annotate');
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantError, setGrantError] = useState('');
  const lang = locale === 'vi' ? 'vi' : 'en';

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try { const data = await permissionApi.listUsers(); setAllUsers(data);
      if (selectedUser) { const updated = data.find((u) => u.id === selectedUser.id); if (updated) setSelectedUser(updated); }
    } catch { setAllUsers([]); }
    setLoading(false);
  }, [selectedUser]);

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const suggestions = useMemo(() => {
    if (!query.trim() && roleFilter === 'all') return [];
    let candidates = allUsers;
    if (roleFilter !== 'all') candidates = candidates.filter((u) => u.roles.includes(roleFilter));
    if (!query.trim()) return candidates.slice(0, 8);
    return candidates.map((u) => {
      const score = Math.max(fuzzyMatch(u.fullName, query).score, fuzzyMatch(u.email, query).score);
      return { user: u, match: score > 0, score };
    }).filter((r) => r.match).sort((a, b) => b.score - a.score).slice(0, 8).map((r) => r.user);
  }, [query, roleFilter, allUsers]);

  const adminDbUser = allUsers.find((u) => u.email === currentUser?.email);

  const handleToggle = async (userId: string, perm: PermissionKey, isGranted: boolean, isDefault: boolean) => {
    if (isDefault || !adminDbUser) return;
    setToggling(`${userId}-${perm}`);
    try {
      if (isGranted) await permissionApi.revoke(userId, perm);
      else await permissionApi.grant(userId, perm, adminDbUser.id);
      await fetchUsers();
    } catch {}
    setToggling(null);
  };

  const handleSelect = (u: UserPermissionInfo) => { setSelectedUser(u); setQuery(u.fullName); setShowDropdown(false); };
  const handleClear = () => { setSelectedUser(null); setQuery(''); setRoleFilter('all'); };

  const handleGrant = async () => {
    if (!grantEmail || !adminDbUser) return;
    setGrantLoading(true); setGrantError('');
    const target = allUsers.find((u) => u.email === grantEmail);
    if (!target) { setGrantError(locale === 'vi' ? 'Không tìm thấy' : 'Not found'); setGrantLoading(false); return; }
    try { await permissionApi.grant(target.id, grantPermission, adminDbUser.id); await fetchUsers(); setGrantOpen(false); setGrantEmail('');
    } catch { setGrantError(locale === 'vi' ? 'Lỗi' : 'Failed'); }
    setGrantLoading(false);
  };

  const allRoles = useMemo(() => { const set = new Set<string>(); allUsers.forEach((u) => u.roles.forEach((r) => set.add(r))); return Array.from(set).sort(); }, [allUsers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10"><KeyRound className="h-5 w-5 text-violet-600" /></div>
          <div>
            <h1 className="text-2xl font-bold">{locale === 'vi' ? 'Quản lý Quyền' : 'Permission Management'}</h1>
            <p className="text-sm text-muted-foreground">{locale === 'vi' ? 'Tìm người dùng để xem và quản lý quyền' : 'Search for a user to manage permissions'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}><RefreshCw className={`mr-1 h-3 w-3 ${loading ? 'animate-spin' : ''}`} /></Button>
          <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
            <DialogTrigger render={<Button size="sm" className="gap-1.5"><UserPlus className="h-4 w-4" />{locale === 'vi' ? 'Cấp quyền nhanh' : 'Quick Grant'}</Button>} />
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>{locale === 'vi' ? 'Cấp quyền nhanh' : 'Quick Grant'}</DialogTitle><DialogDescription>{locale === 'vi' ? 'Nhập email và chọn quyền' : 'Enter email and permission'}</DialogDescription></DialogHeader>
              <div className="space-y-4 py-4">
                <div><label className="text-sm font-medium">Email</label><Input placeholder="user@medicalpower.dev" value={grantEmail} onChange={(e) => setGrantEmail(e.target.value)} className="mt-1" /></div>
                <div><label className="text-sm font-medium">{locale === 'vi' ? 'Quyền' : 'Permission'}</label>
                  <select value={grantPermission} onChange={(e) => setGrantPermission(e.target.value as PermissionKey)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                    {PERMISSION_KEYS.map((k) => <option key={k} value={k}>{PERMISSION_LABELS[k][lang]}</option>)}
                  </select></div>
                {grantError && <p className="text-sm text-destructive">{grantError}</p>}
              </div>
              <DialogFooter><Button onClick={handleGrant} disabled={grantLoading || !grantEmail}>{grantLoading ? <RefreshCw className="mr-1 h-3 w-3 animate-spin" /> : <Check className="mr-1 h-3 w-3" />}{locale === 'vi' ? 'Cấp quyền' : 'Grant'}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-3" ref={searchRef}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
          <Input placeholder={locale === 'vi' ? 'Nhập tên hoặc email...' : 'Type a name or email...'} value={query}
            onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); if (!e.target.value) setSelectedUser(null); }}
            onFocus={() => { if (query || roleFilter !== 'all') setShowDropdown(true); }} className="pl-9 pr-9 h-11 text-base" />
          {query && <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"><X className="h-4 w-4" /></button>}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border bg-popover shadow-2xl z-[100] max-h-96 overflow-y-auto">
              <div className="px-4 py-2 border-b text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{suggestions.length} {locale === 'vi' ? 'kết quả' : 'results'}</div>
              {suggestions.map((u) => (
                <button key={u.id} type="button" onClick={() => handleSelect(u)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/60 border-b last:border-b-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary shrink-0">{u.fullName.charAt(0)}</div>
                  <div className="min-w-0 flex-1"><p className="text-sm font-medium">{u.fullName}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                  <div className="flex gap-1 shrink-0">{u.roles.map((r) => <Badge key={r} variant="secondary" className={`text-[9px] px-1.5 py-0 ${roleColor[r] || ''}`}>{roleLabel[r] || r}</Badge>)}</div>
                </button>
              ))}
            </div>
          )}
          {showDropdown && query.trim() && suggestions.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border bg-popover shadow-2xl z-[100] p-8 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-30" /><p className="text-sm text-muted-foreground">{locale === 'vi' ? 'Không tìm thấy' : 'Not found'}</p>
            </div>
          )}
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setShowDropdown(true); }} className="rounded-lg border bg-background px-3 py-2 text-sm w-44 shrink-0 h-11">
          <option value="all">{locale === 'vi' ? 'Tất cả role' : 'All roles'}</option>
          {allRoles.map((r) => <option key={r} value={r}>{roleLabel[r] || r}</option>)}
        </select>
      </div>

      {!selectedUser ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted"><Search className="h-7 w-7 opacity-30" /></div>
          <p className="text-base font-medium">{locale === 'vi' ? 'Tìm người dùng để bắt đầu' : 'Search for a user'}</p>
        </div>
      ) : (
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-600 text-lg font-bold text-white shadow-md">{selectedUser.fullName.charAt(0)}</div>
                <div>
                  <p className="text-lg font-semibold">{selectedUser.fullName}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex gap-1.5 mt-1.5">
                    {selectedUser.roles.map((r) => <Badge key={r} variant="secondary" className={`text-[10px] px-2 py-0.5 ${roleColor[r] || ''}`}>{roleLabel[r] || r}</Badge>)}
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">{selectedUser.effective.length} {locale === 'vi' ? 'quyền' : 'perms'}</Badge>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClear}><X className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid gap-0 sm:grid-cols-2">
              {PERMISSION_KEYS.map((perm, idx) => {
                const isDefault = selectedUser.defaults.includes(perm);
                const isGranted = selectedUser.granted.includes(perm);
                const isActive = isDefault || isGranted;
                const isLoading = toggling === `${selectedUser.id}-${perm}`;
                return (
                  <div key={perm} className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-accent/30 ${idx < PERMISSION_KEYS.length - 1 ? 'border-b' : ''} ${idx % 2 === 0 ? 'sm:border-r' : ''}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${isActive ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/30' : 'bg-muted text-muted-foreground'}`}>
                        {isDefault ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </div>
                      <div><p className="text-sm font-medium">{PERMISSION_LABELS[perm][lang]}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{isDefault ? (locale === 'vi' ? 'Mặc định' : 'Default') : isGranted ? (locale === 'vi' ? 'Admin đã cấp' : 'Granted') : (locale === 'vi' ? 'Chưa có' : 'Not granted')}</p>
                      </div>
                    </div>
                    <button type="button" disabled={isDefault || isLoading} onClick={() => handleToggle(selectedUser.id, perm, isGranted, isDefault)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full shrink-0 transition-all duration-200 ${isActive ? isDefault ? 'bg-gray-300 dark:bg-gray-600 cursor-default' : 'bg-violet-500 cursor-pointer hover:bg-violet-600 shadow-sm shadow-violet-500/30' : 'bg-gray-200 dark:bg-gray-700 cursor-pointer hover:bg-gray-300'} ${isLoading ? 'opacity-50' : ''}`}>
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
