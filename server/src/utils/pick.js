// Picks only the named keys off an object, dropping everything else. Used to
// whitelist which fields a client-supplied req.body may update, so a PUT
// request can't overwrite fields it has no business touching.
export function pick(obj, keys) {
  const out = {};
  for (const key of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) out[key] = obj[key];
  }
  return out;
}
