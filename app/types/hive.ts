export interface HivePost {
  author: string;
  permlink: string;
  title: string;
  body: string;
  category: string;
  created: string;
  last_update: string;
  url: string;
  src: string;
  blurData: string;
  width: number;
  height: number;
  extension: string;
  takenAt: string;
  takenAtNaive: string;
  takenAtNaiveFormatted: string;
  updatedAt: string;
  createdAt: string;
  aspectRatio: number;
  json_metadata: string;
  priority: boolean;
  tags: Array<{ tag: string; count: number }>;
  cameraKey: string;
  camera: { make: string; model: string };
  simulation: { name: string };
}

export interface HiveMedia {
  ipfsHash?: string;
  url?: string;
  title?: string;
  width?: number;
  height?: number;
  author?: string;
  permlink?: string;
  type?: 'video' | 'photo';
}


export interface Discussion {
  id: number;
  author: string;
  permlink: string;
  category: string;
  parent_author: string;
  parent_permlink: string;
  title: string;
  body: string;
  json_metadata: string;
  created: string;
  last_update: string;
  depth: number;
  children: number;
  net_rshares: string;
  abs_rshares: string;
  vote_rshares: number;
  children_abs_rshares: string;
  cashout_time: string;
  max_cashout_time: string;
  total_vote_weight: number;
  reward_weight: number;
  total_payout_value: string;
  curator_payout_value: string;
  author_rewards: number;
  net_votes: number;
  root_author: string;
  root_permlink: string;
  url: string;
  root_title: string;
  pending_payout_value: string;
  total_pending_payout_value: string;
  active_votes: Array<{
    voter: string;
    weight: number;
    rshares: number;
    percent: number;
    reputation: number;
    time: string;
  }>;
  author_reputation: number;
  promoted: string;
  percent_hbd: number;
  allow_replies: boolean;
  allow_votes: boolean;
  allow_curation_rewards: boolean;
  beneficiaries: Array<{
    account: string;
    weight: number;
  }>;
}