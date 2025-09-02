export const API = process.env.NEXT_PUBLIC_API_BASE!;

export const post = (path: string, body: any) =>
  fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => r.json());

export const get = (path: string) =>
  fetch(`${API}${path}`, {
    method: 'GET',
    headers: { 'content-type': 'application/json' },
  }).then((r) => r.json());

export const del = (path: string) =>
  fetch(`${API}${path}`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
  }).then((r) => r.json());
