export function setLanguage(lang) {
  const map = { en: 'en', ja: 'ja', vi: 'vi' };
  const target = map[lang] || 'en';
  const value = `/auto/${target}`;
  // Set for current host
  setCookie('googtrans', value);
  // Set for base domain if possible (e.g., example.com)
  try {
    const host = window.location.hostname;
    if (host && host.includes('.')) {
      setCookie('googtrans', value, `.${host.split(':')[0]}`);
    }
  } catch (_) {}
  window.location.reload();
}

export function getCurrentLanguage() {
  const match = document.cookie.match(/(?:^|; )googtrans=([^;]+)/);
  if (!match) return 'en';
  const val = decodeURIComponent(match[1]);
  const parts = val.split('/');
  return parts[2] || 'en';
}

function setCookie(name, value, domain) {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  let cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/`;
  if (domain) cookie += `;domain=${domain}`;
  document.cookie = cookie;
}


