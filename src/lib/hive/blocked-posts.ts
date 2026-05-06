const BLOCKED_PERMLINKS = new Set([
  'emergncia-riddim-20260429',
]);

export function isBlockedPermlink(permlink?: string | null) {
  return BLOCKED_PERMLINKS.has(permlink || '');
}
