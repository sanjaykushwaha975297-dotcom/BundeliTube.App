import { RemoteAppConfig, Video } from '../types';

/**
 * Checks if the active viewer is the owner/creator of the video.
 * Self-views must NEVER count towards monetization, ad impressions, or inflated metrics.
 */
export function isSelfViewFraud(
  currentUserId?: string | null,
  video?: { 
    creatorId?: string; 
    creatorUid?: string; 
    ownerUid?: string; 
    channelId?: string;
  } | null,
  currentUserChannelId?: string | null
): boolean {
  if (!currentUserId || !video) return false;

  const vidCreator = (video.creatorId || video.creatorUid || video.ownerUid || '').trim();
  const vidChannel = (video.channelId || '').trim();
  const myId = currentUserId.trim();
  const myChannelId = (currentUserChannelId || '').trim();

  // 1. Direct UID comparison
  if (vidCreator && myId === vidCreator) return true;

  // 2. Channel ID matches viewer ID or prefixed ID
  if (vidChannel && (myId === vidChannel || `chan-${myId}` === vidChannel)) return true;

  // 3. Viewer's own channel ID matches video's channel
  if (myChannelId && vidChannel && myChannelId === vidChannel) return true;

  return false;
}

/**
 * Checks if client-side wallet crediting is allowed.
 * Security mandate: Defaults to FALSE. Client apps must never directly increment creator wallets.
 * Monetization is strictly credited via Admin Panel batch distribution.
 */
export function canCreditWalletFromClient(config?: Partial<RemoteAppConfig> | null): boolean {
  // If Firestore specifies disableAutoWalletCredit = true or monetizationMode = 'admin_batch_distribution',
  // or by default security policy, block client-side wallet modification.
  if (!config) return false;

  if (config.disableAutoWalletCredit === true) return false;
  if (config.monetizationMode === 'admin_batch_distribution') return false;

  // Enforce admin-only batch distribution by default
  return false;
}

/**
 * Validates if an ad impression or view metric can be recorded.
 * Blocks self-views from manipulating view or ad counts.
 */
export function canRecordMonetizationMetrics(params: {
  currentUserId?: string | null;
  video?: { creatorId?: string; creatorUid?: string; ownerUid?: string; channelId?: string } | null;
  currentUserChannelId?: string | null;
}): boolean {
  const { currentUserId, video, currentUserChannelId } = params;

  // If user is watching their own video, block ad impression and monetization counting
  if (isSelfViewFraud(currentUserId, video, currentUserChannelId)) {
    console.warn('[AntiFraud] Self-view detected for creator video. Ad impression & monetization reward blocked.');
    return false;
  }

  return true;
}
