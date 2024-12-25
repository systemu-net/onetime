export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: '2-digit', // "12"
    day: '2-digit', // "08"
    year: 'numeric', // "2024"
    hour: '2-digit', // "11"
    minute: '2-digit', // "28"
    hour12: true, // 12-hour clock with AM/PM
  });
}

export function extractDomain(url: string): string {
  try {
    const {hostname} = new URL(url);
    return hostname.replace('www.', ''); // Remove 'www.' if present
  } catch (error) {
    console.error('Invalid URL:', url);
    return '';
  }
}
