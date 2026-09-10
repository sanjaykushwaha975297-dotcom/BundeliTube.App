import React, { useState } from 'react';
import { MessageSquarePlus, Check, X, Send } from 'lucide-react';
import { Language, translations } from '../../locales/i18n';
import { getFirestoreSafe, setDoc, doc, cleanFirestoreData, serverTimestamp } from '../../lib/firebase';
import { UserAccount, Channel } from '../../types';

interface StudioFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentUser?: UserAccount | null;
  channel?: Channel | null;
}

export const StudioFeedbackModal: React.FC<StudioFeedbackModalProps> = ({
  isOpen,
  onClose,
  language,
  currentUser,
  channel
}) => {
  const t = translations[language];
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const feedbackId = `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();
    const senderName = currentUser?.name || channel?.name || 'बुंदेली क्रिएटर';
    const senderId = currentUser?.id || channel?.id || 'creator';

    const payload = cleanFirestoreData({
      id: feedbackId,
      text: feedback.trim(),
      message: feedback.trim(),
      sms: feedback.trim(),
      content: feedback.trim(),
      userId: senderId,
      senderId: senderId,
      senderName: senderName,
      senderRole: 'creator',
      channelId: channel?.id || '',
      channelName: channel?.name || '',
      userEmail: currentUser?.email || '',
      category: 'studio_feedback',
      status: 'unread',
      createdAt: nowIso,
      timestamp: nowIso,
      serverTimestamp: serverTimestamp()
    });

    try {
      const db = getFirestoreSafe();
      if (db) {
        // 1. Save to feedback
        await setDoc(doc(db, 'feedback', feedbackId), payload).catch(() => {});
        // 2. Save to studio_feedback
        await setDoc(doc(db, 'studio_feedback', feedbackId), payload).catch(() => {});
        // 3. Save to messages
        await setDoc(doc(db, 'messages', feedbackId), payload).catch(() => {});
        // 4. Save to sms
        await setDoc(doc(db, 'sms', feedbackId), payload).catch(() => {});
        // 5. Save to support_messages
        await setDoc(doc(db, 'support_messages', feedbackId), payload).catch(() => {});
      }
    } catch (err) {
      console.warn('Feedback save error:', err);
    } finally {
      setIsSubmitting(false);
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedback('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-slate-100">
              {language === 'hi' ? 'बुंदेली स्टूडियो फीडबैक भेजें' : 'Send Studio Feedback'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-center space-y-2">
            <Check className="w-8 h-8 mx-auto text-emerald-400" />
            <h4 className="font-bold text-sm">
              {language === 'hi' ? 'धन्यवाद! आपकी प्रतिक्रिया हमें प्राप्त हो गई है।' : 'Thank you for your feedback!'}
            </h4>
            <p className="text-xs text-emerald-200/80">
              {language === 'hi' ? 'बुंदेलीट्यूब को बेहतर बनाने में आपका सहयोग अमूल्य है।' : 'Your feedback helps improve BundeliTube Studio.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-400">
              {language === 'hi'
                ? 'बताएं कि हम क्रिएटर स्टूडियो को और अधिक उपयोगी कैसे बना सकते हैं:'
                : 'Describe your issue or share ideas for improving the Creator Studio:'}
            </p>
            <textarea
              rows={5}
              placeholder={language === 'hi' ? 'अपनी राय या सुझाव यहाँ लिखें...' : 'Enter your feedback here...'}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed"
              required
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                {language === 'hi' ? 'भेजें (Submit)' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
