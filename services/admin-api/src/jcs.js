'use strict';

function canonicalize(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    const items = value.map((item) => canonicalize(item));
    return `[${items.join(',')}]`;
  }

  const keys = Object.keys(value).sort();
  const items = keys.map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`);
  return `{${items.join(',')}}`;
}

module.exports = {
  canonicalize,
};
