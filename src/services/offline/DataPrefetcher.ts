
import { supabase } from '@/integrations/supabase/client';
import { smartSyncManager } from './SmartSyncManager';

class DataPrefetcher {
  async prefetchCriticalData(tables: string[]): Promise<void> {
    if (!navigator.onLine) return;

    for (const table of tables) {
      try {
        // Only prefetch known tables
        const validTables = ['feedback', 'mental_health_alerts', 'class_schedules'];
        
        if (!validTables.includes(table)) {
          console.warn(`Skipping prefetch for unknown table: ${table}`);
          continue;
        }

        let data: any[] = [];

        // Type-safe prefetching
        switch (table) {
          case 'feedback':
            const { data: feedbackData, error: feedbackError } = await supabase
              .from('feedback')
              .select('*')
              .limit(100);
            
            if (feedbackError) throw feedbackError;
            data = feedbackData || [];
            break;

          case 'mental_health_alerts':
            const { data: alertsData, error: alertsError } = await supabase
              .from('mental_health_alerts')
              .select('*')
              .limit(100);
            
            if (alertsError) throw alertsError;
            data = alertsData || [];
            break;

          case 'class_schedules':
            const { data: schedulesData, error: schedulesError } = await supabase
              .from('class_schedules')
              .select('*')
              .limit(100);
            
            if (schedulesError) throw schedulesError;
            data = schedulesData || [];
            break;

          default:
            console.warn(`No prefetch handler for table: ${table}`);
            continue;
        }

        if (data) {
          await smartSyncManager.smartCacheData(table, data, 'high');
          console.log(`📦 Prefetched critical data for: ${table}`);
        }
      } catch (error) {
        console.error(`Prefetch failed for table ${table}:`, error);
      }
    }
  }
}

export const dataPrefetcher = new DataPrefetcher();
