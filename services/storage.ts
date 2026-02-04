import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ScanHistoryItem {
  id: string;
  name: string;
  address: string;
  date: string;
  timestamp: number;
  status: 'safe' | 'critical' | 'warning';
  score: number;
  type: 'contract' | 'website';
}

const STORAGE_KEY = '@cryptoshield_scan_history';

export const StorageService = {
  async saveScan(scan: Omit<ScanHistoryItem, 'id' | 'timestamp'>): Promise<void> {
    try {
      const history = await this.getHistory();
      const newScan: ScanHistoryItem = {
        ...scan,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };

      // Add to beginning of array
      history.unshift(newScan);

      // Keep only last 50 scans
      const limitedHistory = history.slice(0, 50);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving scan:', error);
    }
  },

  async getHistory(): Promise<ScanHistoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  },

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  },

  async getScanById(id: string): Promise<ScanHistoryItem | null> {
    try {
      const history = await this.getHistory();
      return history.find(item => item.id === id) || null;
    } catch (error) {
      console.error('Error getting scan by id:', error);
      return null;
    }
  },
};
