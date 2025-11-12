import { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import {
  createResource,
  deleteResource,
  getResources,
  reorderResources,
  updateResource
} from '../apis/resources';
import { Resource } from '../types';

interface CreateResourcePayload {
  link?: {
    original_url: string;
    title?: string;
    description?: string;
  };
  qr_code?: {
    // QR code attributes
    [key: string]: unknown;
  };
  image?: {
    // Image attributes
    [key: string]: unknown;
  };
  resource: {
    sort_order?: number;
    color?: string;
  };
}

interface UpdateResourcePayload {
  link?: {
    original_url?: string;
    title?: string;
    description?: string;
    [key: string]: unknown;
  };
  resource: {
    sort_order?: number;
    color?: string;
  };
}

interface UseResourcesReturn {
  resources: Resource[];
  loading: boolean;
  error: string | null;
  create: (payload: CreateResourcePayload) => Promise<Resource>;
  update: (resourceId: number, payload: UpdateResourcePayload) => Promise<Resource>;
  reorder: (newOrder: Array<{ id: number; sort_order: number }>) => Promise<Resource[]>;
  remove: (resourceId: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useResources(lookupCode: string | undefined): UseResourcesReturn {
  const [cookies] = useCookies(['token']);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch resources
  const fetchResources = useCallback(async () => {
    if (!lookupCode || !cookies.token) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await getResources(cookies.token, lookupCode);
      setResources(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
      console.error('Failed to fetch resources:', err);
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [lookupCode, cookies.token]);
  
  // Create resource
  const create = useCallback(async (payload: CreateResourcePayload): Promise<Resource> => {
    if (!cookies.token || !lookupCode) {
      throw new Error('Missing authentication or page code');
    }
    
    const newResource = await createResource(cookies.token, lookupCode, payload);
    setResources(prev => [...prev, newResource]);
    return newResource;
  }, [cookies.token, lookupCode]);
  
  // Update resource
  const update = useCallback(async (resourceId: number, payload: UpdateResourcePayload): Promise<Resource> => {
    if (!cookies.token || !lookupCode) {
      throw new Error('Missing authentication or page code');
    }
    
    const updated = await updateResource(cookies.token, lookupCode, resourceId, payload);
    setResources(prev => prev.map(r => r.id === resourceId ? updated : r));
    return updated;
  }, [cookies.token, lookupCode]);
  
  // Reorder resources
  const reorder = useCallback(async (
    newOrder: Array<{ id: number; sort_order: number }>
  ): Promise<Resource[]> => {
    if (!cookies.token || !lookupCode) {
      throw new Error('Missing authentication or page code');
    }
    
    const updated = await reorderResources(cookies.token, lookupCode, newOrder);
    setResources(updated);
    return updated;
  }, [cookies.token, lookupCode]);
  
  // Delete resource
  const remove = useCallback(async (resourceId: number): Promise<void> => {
    if (!cookies.token || !lookupCode) {
      throw new Error('Missing authentication or page code');
    }
    
    await deleteResource(cookies.token, lookupCode, resourceId);
    setResources(prev => prev.filter(r => r.id !== resourceId));
  }, [cookies.token, lookupCode]);
  
  // Initial fetch
  useEffect(() => {
    fetchResources();
  }, [fetchResources]);
  
  return {
    resources,
    loading,
    error,
    create,
    update,
    reorder,
    remove,
    refetch: fetchResources
  };
}
