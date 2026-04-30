const BLOCKED_PERMLINKS = new Set([
  'emergncia-riddim-20260429',
  'teste-sobre-mim-20250628t033616300z',
]);

export function isBlockedPermlink(permlink?: string | null) {
  return BLOCKED_PERMLINKS.has(permlink || '');
}
