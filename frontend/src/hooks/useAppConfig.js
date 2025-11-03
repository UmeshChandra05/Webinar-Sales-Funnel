import { useEffect, useState } from 'react';
import apiClient from '../utils/api';
import { updateDynamicConfig } from '../utils/constants';

/**
 * Hook to fetch and manage dynamic configuration from backend
 * This hook should be called once at the App level
 */
export const useAppConfig = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        console.log('🔄 Fetching admin configuration...');
        const response = await apiClient.getAdminConfig();
        
        if (response.success && response.config) {
          console.log('✅ Configuration fetched:', response.config);
          
          // Update the dynamic configuration
          updateDynamicConfig(response.config);
          
          setConfig(response.config);
          setError(null);
        } else {
          console.warn('⚠️ Configuration fetch returned no data, using defaults');
        }
      } catch (err) {
        console.error('❌ Failed to fetch configuration:', err);
        setError(err.message);
        // Continue with default values - non-critical error
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, isLoading, error };
};
