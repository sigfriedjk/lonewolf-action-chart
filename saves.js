/* Current-book saves and optional immutable checkpoints. No dependencies or build step. */
(function (root) {
  'use strict';
  const C = typeof module !== 'undefined' && module.exports ? require('./campaign.js') : root.LWCampaign;
  const STORAGE_KEY = 'lone-wolf-action-chart-current-v1';
  const FORMAT = 'lone-wolf-book-save';
  const MAX_URL_LENGTH = 8192, MAX_BOOK_BYTES = 1000000, MAX_FILE_BYTES = 8000000, MAX_CHECKPOINTS = 200;
  const clone = value => JSON.parse(JSON.stringify(value));
  function checkpoint(chart, label, now = Date.now()) {
    if (typeof label !== 'string' || !label.trim() || label.length > 80) throw new Error('Choose a checkpoint name of 1–80 characters.');
    return {id: `${now}-${Math.random().toString(36).slice(2)}`, label: label.trim(), createdAt: new Date(now).toISOString(), chart: C.validateCharacter(chart)};
  }
  function validateRecord(input) {
    if (!input || input.format !== FORMAT || input.version !== 1 || !Array.isArray(input.checkpoints) || input.checkpoints.length > MAX_CHECKPOINTS) throw new Error('Invalid book save or checkpoint archive.');
    const current = C.validateCharacter(input.current), ids = new Set();
    const checkpoints = input.checkpoints.map(entry => {
      if (!entry || typeof entry.id !== 'string' || !/^[a-zA-Z0-9-]{1,100}$/.test(entry.id) || ids.has(entry.id) || typeof entry.label !== 'string' || !entry.label.trim() || entry.label.length > 80 || !(entry.createdAt === null || typeof entry.createdAt === 'string' && Number.isFinite(Date.parse(entry.createdAt)))) throw new Error('Invalid checkpoint.');
      ids.add(entry.id);
      return {id: entry.id, label: entry.label, createdAt: entry.createdAt, chart: C.validateCharacter(entry.chart)};
    });
    return {format: FORMAT, version: 1, current, checkpoints};
  }
  function record(current, checkpoints = []) {
    return {format: FORMAT, version: 1, current: clone(current), checkpoints: clone(checkpoints)};
  }
  function importRecord(input) {
    if (input?.format === FORMAT) return validateRecord(input);
    const campaign = C.validateSave(input);
    return record(campaign.books[campaign.activeBook], Object.entries(campaign.books).map(([book, chart]) => ({id: `legacy-book-${book}`, label: `Imported Book ${book}`, createdAt: null, chart})));
  }
  function campaign(current, checkpoints = []) {
    const books = {};
    for (const entry of checkpoints) books[entry.chart.book] = clone(entry.chart);
    books[current.book] = clone(current);
    const version = Object.values(books).some(s => s.book >= 13) ? 4 : Object.values(books).some(s => s.book >= 6) ? 3 : 2;
    return {version, activeBook: current.book, books};
  }
  function append(checkpoints, entry) {
    if (checkpoints.length >= MAX_CHECKPOINTS) throw new Error('Your checkpoint archive is full. Export it, then remove a checkpoint before adding another.');
    const next = [...checkpoints, entry];
    if (new TextEncoder().encode(JSON.stringify(next)).length > MAX_FILE_BYTES - MAX_BOOK_BYTES - 1024) throw new Error('Your checkpoint archive is too large. Export it, then remove some checkpoints before adding another.');
    return next;
  }
  function base64url(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function unbase64url(text) {
    if (!/^[A-Za-z0-9_-]+$/.test(text) || text.length % 4 === 1) throw new Error('Invalid save link.');
    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - text.length % 4) % 4));
    const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
    if (base64url(bytes) !== text) throw new Error('Invalid save link.');
    return bytes;
  }
  async function readBounded(stream) {
    const reader = stream.getReader(), chunks = [];
    let size = 0;
    try {
      while (true) {
        const {value, done} = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BOOK_BYTES) throw new Error('Save link expands to too much data.');
        chunks.push(value);
      }
    } catch (error) { await reader.cancel().catch(() => {}); throw error; }
    finally { reader.releaseLock(); }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return bytes;
  }
  async function encode(chart) {
    const bytes = new TextEncoder().encode(JSON.stringify(C.validateCharacter(chart)));
    if (bytes.length > MAX_BOOK_BYTES) throw new Error('This chart is too large for a save link. Export a save file instead.');
    let payload = `1.json.${base64url(bytes)}`;
    if (typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined') {
      const compressed = await readBounded(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip')));
      const gzip = `1.gz.${base64url(compressed)}`;
      if (gzip.length < payload.length) payload = gzip;
    }
    return payload;
  }
  async function decode(token) {
    if (typeof token !== 'string' || token.length > MAX_URL_LENGTH) throw new Error('Save link is too large. Import a save file instead.');
    const match = /^1\.(gz|json)\.([A-Za-z0-9_-]+)$/.exec(token);
    if (!match) throw new Error('Invalid or unsupported save link.');
    let bytes = unbase64url(match[2]);
    if (match[1] === 'gz') {
      if (typeof DecompressionStream === 'undefined') throw new Error('This browser cannot open compressed save links. Use a current browser or import a save file.');
      bytes = await readBounded(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')));
    }
    const input = JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(bytes));
    return C.validateCharacter(input);
  }
  async function createLink(chart, href) {
    const url = new URL(href);
    url.searchParams.set('state', await encode(chart));
    if (url.href.length > MAX_URL_LENGTH) throw new Error('This chart is too large for a reliable save link. Export a save file instead.');
    return url.href;
  }
  const saves = {STORAGE_KEY, FORMAT, MAX_URL_LENGTH, MAX_BOOK_BYTES, MAX_FILE_BYTES, MAX_CHECKPOINTS, checkpoint, record, validateRecord, importRecord, campaign, append, encode, decode, createLink};
  if (typeof module !== 'undefined' && module.exports) module.exports = saves;
  else root.LWSaves = saves;
})(typeof window !== 'undefined' ? window : globalThis);
