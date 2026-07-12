import { json } from '../_lib/http.js';

const MAX_QUERIES = 3;

export async function onRequestPost({ request, env }) {
  if (!env.NAVER_CLIENT_ID || !env.NAVER_CLIENT_SECRET) {
    return json({ products: [], source: 'fallback' });
  }

  const body = await request.json().catch(() => ({}));
  const queries = Array.isArray(body.queries)
    ? body.queries.map(cleanQuery).filter(Boolean).slice(0, MAX_QUERIES)
    : [];
  if (!queries.length) return json({ products: [], source: 'fallback' });

  const products = await Promise.all(queries.map((query) => searchProduct(query, env)));
  return json({ products, source: 'naver-shopping' });
}

export function onRequestGet() {
  return json({ error: '허용되지 않은 요청 방식입니다.' }, 405);
}

async function searchProduct(query, env) {
  try {
    const url = new URL('https://openapi.naver.com/v1/search/shop.json');
    url.searchParams.set('query', query);
    url.searchParams.set('display', '5');
    url.searchParams.set('sort', 'sim');
    url.searchParams.set('exclude', 'used:rental:cbshop');

    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': env.NAVER_CLIENT_SECRET,
      },
    });
    if (!response.ok) {
      console.error('Naver Shopping search failed', response.status);
      return null;
    }

    const data = await response.json();
    const item = data.items?.find((candidate) => isFashionProduct(candidate)) || data.items?.[0];
    return item ? normalizeProduct(item, query) : null;
  } catch (error) {
    console.error('Product search failed', error instanceof Error ? error.message : error);
    return null;
  }
}

function normalizeProduct(item, query) {
  return {
    query,
    title: stripTags(item.title),
    image: safeUrl(item.image),
    link: safeUrl(item.link),
    price: Number(item.lprice) || null,
    mallName: cleanText(item.mallName, 40),
  };
}

function isFashionProduct(item) {
  return /패션|의류|신발|잡화|스포츠/.test(`${item.category1 || ''} ${item.category2 || ''}`);
}

function cleanQuery(value) {
  return cleanText(value, 60);
}

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.replace(/[\r\n<>]+/g, ' ').trim().slice(0, maxLength) : '';
}

function stripTags(value) {
  return cleanText(value?.replace(/<[^>]*>/g, ''), 120);
}

function safeUrl(value) {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    url.protocol = 'https:';
    return url.toString();
  } catch {
    return '';
  }
}
