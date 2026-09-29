/* Native Push bridge for Capacitor Android TEST.
   No-op in normal browsers/PWA. */
(() => {
  const cap = window.Capacitor;
  const push = cap?.Plugins?.PushNotifications;
  const isNative = !!(cap?.isNativePlatform?.() || push);
  if (!isNative || !push) return;
  if (window.__marketNativePushBridgeInstalled) return;
  window.__marketNativePushBridgeInstalled = true;

  const emit = (name, detail) => {
    try { window.dispatchEvent(new CustomEvent(name, { detail })); } catch (_) {}
  };

  push.addListener('registration', token => {
    const value = String(token?.value || '');
    console.log('[NativePush] registration OK', value ? value.slice(0, 18) + '…' : '');
    window.marketNativeFcmToken = value;
    emit('market:native-push-registration', { token: value });
  });

  push.addListener('registrationError', error => {
    console.error('[NativePush] registration error', error);
    emit('market:native-push-registration-error', error);
  });

  push.addListener('pushNotificationReceived', notification => {
    console.log('[NativePush] received', notification);
    emit('market:native-push-received', notification);
  });

  push.addListener('pushNotificationActionPerformed', action => {
    console.log('[NativePush] action', action);
    emit('market:native-push-action', action);
    const data = action?.notification?.data || {};
    const target = data.url || data.click_url || data.link || data.deep_link;
    if (target) {
      try {
        const u = new URL(String(target), location.href);
        if (u.origin === location.origin) location.href = u.href;
      } catch (_) {}
    }
  });

  let registerInFlight = null;
  let lastRegisterAt = 0;

  async function ensureRegistration({ force = false, requestPermission = false } = {}) {
    if (registerInFlight) return registerInFlight;
    const now = Date.now();
    if (!force && window.marketNativeFcmToken && (now - lastRegisterAt) < 60 * 60 * 1000) {
      return { ok: true, reason: 'recently_registered', token: window.marketNativeFcmToken };
    }
    registerInFlight = (async () => {
      try {
        let perm = await push.checkPermissions();
        let receive = String(perm?.receive || '');
        if ((receive === 'prompt' || receive === 'prompt-with-rationale') && requestPermission) {
          perm = await push.requestPermissions();
          receive = String(perm?.receive || '');
        }
        console.log('[NativePush] permission', receive);
        if (receive === 'denied') return { ok: false, reason: 'permission_denied' };
        if ((receive === 'prompt' || receive === 'prompt-with-rationale') && !requestPermission) {
          return { ok: false, reason: 'permission_required' };
        }
        lastRegisterAt = Date.now();
        await push.register();
        return { ok: true, reason: 'register_requested', token: window.marketNativeFcmToken || '' };
      } catch (err) {
        console.error('[NativePush] register failed', err);
        return { ok: false, reason: 'register_failed', error: err?.message || String(err) };
      }
    })().finally(() => { registerInFlight = null; });
    return registerInFlight;
  }

  window.marketNativeEnsurePushRegistration = ensureRegistration;

  // Preserve the existing first-run behavior: ask once if Android still needs
  // notification permission, then register for FCM.
  ensureRegistration({ force: true, requestPermission: true });

  // Self-heal after the app returns from background without tying anything to
  // Supabase Realtime. Permission prompts are never shown from these resume hooks.
  // Re-registration is throttled to once per hour unless explicitly forced.
  window.addEventListener('focus', () => {
    setTimeout(() => ensureRegistration({ force: false, requestPermission: false }), 150);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      setTimeout(() => ensureRegistration({ force: false, requestPermission: false }), 150);
    }
  });
})();
