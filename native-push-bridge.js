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

  (async () => {
    try {
      let perm = await push.checkPermissions();
      if (perm?.receive === 'prompt' || perm?.receive === 'prompt-with-rationale') {
        perm = await push.requestPermissions();
      }
      console.log('[NativePush] permission', perm?.receive);
      if (perm?.receive === 'granted') await push.register();
      else console.warn('[NativePush] notification permission not granted');
    } catch (err) {
      console.error('[NativePush] init failed', err);
    }
  })();
})();
