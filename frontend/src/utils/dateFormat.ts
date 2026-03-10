// Date formatting utilities

export function formatDistanceToNow(date: Date | string, options: { addSuffix?: boolean } = {}): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    const years = Math.floor(interval);
    const suffix = options.addSuffix ? ' ago' : '';
    return `${years} year${years !== 1 ? 's' : ''}${suffix}`;
  }

  interval = seconds / 2592000;
  if (interval > 1) {
    const months = Math.floor(interval);
    const suffix = options.addSuffix ? ' ago' : '';
    return `${months} month${months !== 1 ? 's' : ''}${suffix}`;
  }

  interval = seconds / 86400;
  if (interval > 1) {
    const days = Math.floor(interval);
    const suffix = options.addSuffix ? ' ago' : '';
    return `${days} day${days !== 1 ? 's' : ''}${suffix}`;
  }

  interval = seconds / 3600;
  if (interval > 1) {
    const hours = Math.floor(interval);
    const suffix = options.addSuffix ? ' ago' : '';
    return `${hours} hour${hours !== 1 ? 's' : ''}${suffix}`;
  }

  interval = seconds / 60;
  if (interval > 1) {
    const minutes = Math.floor(interval);
    const suffix = options.addSuffix ? ' ago' : '';
    return `${minutes} minute${minutes !== 1 ? 's' : ''}${suffix}`;
  }

  const suffix = options.addSuffix ? ' ago' : '';
  return `${Math.floor(seconds)} second${Math.floor(seconds) !== 1 ? 's' : ''}${suffix}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(d)} ${formatTime(d)}`;
}
