import { Video, Channel, ChannelSubmission, VideoSubmission, ShortItem } from '../types';
import { updateChannelLogoGlobally } from './firebase';

/**
 * Normalizes strings for robust channel name matching
 */
function normalizeName(name?: string): string {
  if (!name) return '';
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Evaluates whether an avatar URL is a customized/uploaded image
 * (base64 DataURL, Firebase Storage, uploaded blob, or non-default photo)
 */
function getAvatarPriority(url?: string): number {
  if (!url) return 0;
  if (url.startsWith('data:image/') || url.startsWith('blob:')) return 100; // Directly uploaded custom file
  if (url.includes('firebasestorage') || url.includes('storage.googleapis.com')) return 90; // Stored upload
  if (url.includes('unsplash.com/photo-') && !url.includes('1535713875002-d1d0cf377fde')) return 60; // Distinct photo
  if (url.includes('1535713875002-d1d0cf377fde')) return 10; // Generic placeholder
  return 40;
}

/**
 * Harmonizes all videos so that every video belonging to the same channel
 * always displays the exact same, authoritative channel avatar.
 *
 * It checks:
 * 1. Active channel avatar (highest priority for current user)
 * 2. Channel submissions registry
 * 3. Scanned videos: if any video for a channel has a custom/newer logo,
 *    all videos under that channel name inherit that newest logo!
 */
export function harmonizeVideoAvatars(
  videosList: Video[],
  activeChannel?: Channel | null,
  submissions?: ChannelSubmission[] | null
): { harmonizedVideos: Video[]; hasChanges: boolean } {
  if (!videosList || videosList.length === 0) {
    return { harmonizedVideos: videosList, hasChanges: false };
  }

  // 1. Authoritative registry
  const authoritativeAvatars = new Map<string, { url: string; priority: number }>();

  // A) Register active channel if available
  if (activeChannel?.avatar) {
    const activeUrl = activeChannel.avatar;
    const activePriority = 200; // Highest precedence
    if (activeChannel.id) {
      authoritativeAvatars.set(`id:${activeChannel.id.toLowerCase()}`, { url: activeUrl, priority: activePriority });
    }
    if (activeChannel.ownerUid) {
      authoritativeAvatars.set(`uid:${activeChannel.ownerUid.toLowerCase()}`, { url: activeUrl, priority: activePriority });
    }
    if (activeChannel.name) {
      authoritativeAvatars.set(`name:${normalizeName(activeChannel.name)}`, { url: activeUrl, priority: activePriority });
    }
  }

  // B) Register channel submissions
  if (submissions && submissions.length > 0) {
    submissions.forEach(sub => {
      const subAvatar = sub.channelAvatar || sub.channelLogoUrl || sub.avatarUrl;
      if (subAvatar) {
        const priority = 150;
        if (sub.id) {
          authoritativeAvatars.set(`id:${sub.id.toLowerCase()}`, { url: subAvatar, priority });
        }
        if (sub.ownerUid) {
          authoritativeAvatars.set(`uid:${sub.ownerUid.toLowerCase()}`, { url: subAvatar, priority });
        }
        if (sub.channelName) {
          authoritativeAvatars.set(`name:${normalizeName(sub.channelName)}`, { url: subAvatar, priority });
        }
      }
    });
  }

  // C) Scan video list to find the latest / highest-priority avatar for each channel name
  videosList.forEach(v => {
    const normName = normalizeName(v.channelName || v.artist);
    if (!normName || !v.channelAvatar) return;

    const existingAuth = authoritativeAvatars.get(`name:${normName}`);
    const vPriority = getAvatarPriority(v.channelAvatar);

    if (!existingAuth || vPriority > existingAuth.priority) {
      authoritativeAvatars.set(`name:${normName}`, { url: v.channelAvatar, priority: vPriority });
    }
    if (v.channelId) {
      const existingId = authoritativeAvatars.get(`id:${v.channelId.toLowerCase()}`);
      if (!existingId || vPriority > existingId.priority) {
        authoritativeAvatars.set(`id:${v.channelId.toLowerCase()}`, { url: v.channelAvatar, priority: vPriority });
      }
    }
  });

  // 2. Propagate to every video
  let hasChanges = false;
  const harmonizedVideos = videosList.map(v => {
    const normName = normalizeName(v.channelName || v.artist);
    const idKey = v.channelId ? `id:${v.channelId.toLowerCase()}` : '';
    const creatorId = (v as any).creatorUid || (v as any).creatorId;
    const uidKey = creatorId ? `uid:${String(creatorId).toLowerCase()}` : '';

    const targetAvatar =
      (idKey && authoritativeAvatars.get(idKey)?.url) ||
      (uidKey && authoritativeAvatars.get(uidKey)?.url) ||
      (normName && authoritativeAvatars.get(`name:${normName}`)?.url);

    if (targetAvatar && v.channelAvatar !== targetAvatar) {
      hasChanges = true;
      return {
        ...v,
        channelAvatar: targetAvatar
      };
    }
    return v;
  });

  return { harmonizedVideos, hasChanges };
}

/**
 * Propagate a new channel logo across local state (videos, submissions, shorts) and Firebase
 */
export async function propagateChannelLogoAcrossState(params: {
  newLogoUrl: string;
  channelId: string;
  ownerUid?: string;
  channelName?: string;
  videos: Video[];
  setVideos: React.Dispatch<React.SetStateAction<Video[]>>;
  videoSubmissions?: VideoSubmission[];
  setVideoSubmissions?: React.Dispatch<React.SetStateAction<VideoSubmission[]>>;
  channelSubmissions?: ChannelSubmission[];
  setChannelSubmissions?: React.Dispatch<React.SetStateAction<ChannelSubmission[]>>;
  shorts?: ShortItem[];
  setShorts?: React.Dispatch<React.SetStateAction<ShortItem[]>>;
  saveJson: (key: string, data: any) => any;
}) {
  const {
    newLogoUrl,
    channelId,
    ownerUid = '',
    channelName = '',
    videos,
    setVideos,
    videoSubmissions,
    setVideoSubmissions,
    channelSubmissions,
    setChannelSubmissions,
    shorts,
    setShorts,
    saveJson
  } = params;

  if (!newLogoUrl) return;
  const targetName = normalizeName(channelName);
  const targetId = channelId ? channelId.toLowerCase() : '';
  const targetUid = ownerUid ? ownerUid.toLowerCase() : '';

  const isVideoMatch = (v: { channelId?: string; creatorUid?: string; channelName?: string; artist?: string }) => {
    if (targetId && v.channelId && v.channelId.toLowerCase() === targetId) return true;
    if (targetUid && v.creatorUid && v.creatorUid.toLowerCase() === targetUid) return true;
    if (targetUid && (v as any).creatorId && String((v as any).creatorId).toLowerCase() === targetUid) return true;
    if (targetName) {
      const vChan = normalizeName(v.channelName);
      const vArt = normalizeName(v.artist);
      if (vChan === targetName || vArt === targetName) return true;
    }
    return false;
  };

  // 1. Update videos
  let videosChanged = false;
  const nextVideos = videos.map(v => {
    if (isVideoMatch(v) && v.channelAvatar !== newLogoUrl) {
      videosChanged = true;
      return { ...v, channelAvatar: newLogoUrl };
    }
    return v;
  });
  if (videosChanged) {
    setVideos(nextVideos);
    saveJson('bt_videos', nextVideos);
  }

  // 2. Update video submissions
  if (videoSubmissions && setVideoSubmissions) {
    let subChanged = false;
    const nextSubs = videoSubmissions.map(s => {
      if (isVideoMatch(s) && s.channelAvatar !== newLogoUrl) {
        subChanged = true;
        return { ...s, channelAvatar: newLogoUrl };
      }
      return s;
    });
    if (subChanged) {
      setVideoSubmissions(nextSubs);
      saveJson('bt_video_submissions', nextSubs);
    }
  }

  // 3. Update channel submissions
  if (channelSubmissions && setChannelSubmissions) {
    let chanSubChanged = false;
    const nextChanSubs = channelSubmissions.map(cs => {
      const isMatch =
        (targetId && cs.id && cs.id.toLowerCase() === targetId) ||
        (targetUid && cs.ownerUid && cs.ownerUid.toLowerCase() === targetUid) ||
        (targetName && normalizeName(cs.channelName) === targetName);
      if (isMatch) {
        chanSubChanged = true;
        return {
          ...cs,
          channelAvatar: newLogoUrl,
          channelLogoUrl: newLogoUrl,
          avatarUrl: newLogoUrl
        };
      }
      return cs;
    });
    if (chanSubChanged) {
      setChannelSubmissions(nextChanSubs);
      saveJson('bt_channel_submissions', nextChanSubs);
    }
  }

  // 4. Update shorts
  if (shorts && setShorts) {
    setShorts(prevShorts =>
      prevShorts.map(sh => {
        const isMatch =
          (targetId && (sh as any).channelId && (sh as any).channelId.toLowerCase() === targetId) ||
          (targetName && normalizeName(sh.channelName) === targetName);
        if (isMatch && (sh as any).channelAvatar !== newLogoUrl) {
          return { ...sh, channelAvatar: newLogoUrl };
        }
        return sh;
      })
    );
  }

  // 5. Global sync to Firestore collections
  try {
    await updateChannelLogoGlobally(channelId, ownerUid, newLogoUrl, channelName);
  } catch (e) {
    console.warn('Error during propagateChannelLogoAcrossState to Firestore:', e);
  }
}
