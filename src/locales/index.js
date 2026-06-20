const en = require('./en');
const ru = require('./ru');
const uz = require('./uz');

const locales = {
  en,
  ru,
  uz,
};

function t(lang, key, params = {}) {
  const dictionary = locales[lang] || locales['en'];
  let text = dictionary[key] || locales['en'][key] || key;

  for (const [k, v] of Object.entries(params)) {
    text = text.replace(new RegExp(`{${k}}`, 'g'), v);
  }

  return text;
}

module.exports = { t, locales };
