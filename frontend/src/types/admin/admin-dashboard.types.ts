export interface AdminDashboardTotals {
  users: number;
  creators: number;
  tracks: number;
  albums: number;
  podcasts: number;
  audiobooks: number;
}

export interface AdminDashboardMonthlyPoint {
  month: string;
  tracks: number;
  albums: number;
  podcasts: number;
  audiobooks: number;
}
