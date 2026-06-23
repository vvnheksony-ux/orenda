import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

type Messages = Record<string, unknown>;

// Recursively merge `override` onto `base`. Used so a locale only needs to
// translate the keys it has — anything missing falls back to the English text
// instead of throwing MISSING_MESSAGE or rendering the raw key.
function deepMerge(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const key of Object.keys(override)) {
    const o = override[key];
    const b = out[key];
    if (o && typeof o === 'object' && !Array.isArray(o) && b && typeof b === 'object' && !Array.isArray(b)) {
      out[key] = deepMerge(b as Messages, o as Messages);
    } else {
      out[key] = o;
    }
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as 'en' | 'km' | 'zh')) {
    locale = routing.defaultLocale;
  }

  const en = (await import(`../../messages/en.json`)).default as Messages;
  const messages =
    locale === 'en'
      ? en
      : deepMerge(en, (await import(`../../messages/${locale}.json`)).default as Messages);

  return {
    locale,
    messages,
    // Last-resort fallback: show the key path rather than crashing.
    getMessageFallback: ({ key }) => key,
  };
});
