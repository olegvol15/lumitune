export interface AdminMoodUsage {
  tracks: number;
  total: number;
}

export interface AdminMood {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  usage: AdminMoodUsage;
}

export interface BackendMood {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendMoodWithUsage {
  mood: BackendMood;
  usage: AdminMoodUsage;
}

export interface AdminMoodsResponse {
  success: boolean;
  moods: BackendMoodWithUsage[];
}

export interface MoodsResponse {
  success: boolean;
  moods: BackendMood[];
}

export interface AdminMoodResponse {
  success: boolean;
  mood: BackendMood;
}
