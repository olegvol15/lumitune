export const formatNotificationTimeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const language = document.documentElement.lang === 'en' ? 'en' : 'uk';
  if (mins < 60) return language === 'en' ? `${mins} min ago` : `${mins} хв тому`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return language === 'en' ? `${hours} hr ago` : `${hours} год тому`;
  const days = Math.floor(hours / 24);
  return language === 'en' ? `${days} d ago` : `${days} дн тому`;
};
