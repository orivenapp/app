// ════════════════════════════════════════════════════════════════
// Oriven — Vercel Edge Middleware ile ön-yayın şifre koruması.
// GERÇEK sunucu-tarafı koruma: doğru şifre girilmeden hiçbir içerik
// gönderilmez (tarayıcı yerel giriş kutusu çıkarır).
//
//   Kullanıcı adı: oriven   ·   Parola: oriven2026
//
// ⚠️ GÜVENLİK: Repo PUBLIC ise şifreyi koda yazma — Vercel'de
//   Settings → Environment Variables'a ekle:  SITE_USER=oriven  SITE_PASS=oriven2026
//   (Kod bunları okur; env yoksa aşağıdaki varsayılana düşer.)
//
// KURULUM:
//   1. Bu dosyayı orivenapp/app reposunun KÖKÜNE koy (index.html ile aynı yere).
//   2. package.json'a "@vercel/edge" bağımlılığını ekle (yanına koyduğum dosya).
//   3. (Önerilen) Vercel'de SITE_USER / SITE_PASS env değişkenlerini ayarla.
//   4. commit + push → Vercel otomatik deploy eder → koruma aktif.
// ════════════════════════════════════════════════════════════════
import { next } from '@vercel/edge';

export const config = {
  matcher: '/:path*', // tüm yolları koru
};

const USER = process.env.SITE_USER || 'oriven';
const PASS = process.env.SITE_PASS || 'oriven2026';

export default function middleware(request) {
  const auth = request.headers.get('authorization') || '';
  const [scheme, encoded] = auth.split(' ');

  if (scheme === 'Basic' && encoded) {
    try {
      const [user, pass] = atob(encoded).split(':');
      if (user === USER && pass === PASS) {
        return next(); // doğru → içeriği sun
      }
    } catch (_) {
      // hatalı header → aşağıda 401
    }
  }

  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Oriven - pre-launch", charset="UTF-8"',
    },
  });
}
