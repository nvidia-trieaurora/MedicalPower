'use client';

import { useState, useEffect, useCallback } from 'react';
import { permissionApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { DEFAULT_ROLE_PERMISSIONS, type PermissionKey } from '@/lib/permissions';

export function usePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!user) { setPermissions([]); setLoading(false); return; }
    const roleDefaults = DEFAULT_ROLE_PERMISSIONS[user.role] || [];
    try {
      const data = await permissionApi.getUserPermissions(user.id);
      if (data.effective && data.effective.length > 0) setPermissions(data.effective);
      else setPermissions(roleDefaults);
    } catch {
      setPermissions(roleDefaults);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  const hasPermission = useCallback(
    (key: PermissionKey | string): boolean => permissions.includes(key),
    [permissions]
  );

  return { permissions, loading, hasPermission, refresh: fetchPermissions };
}
