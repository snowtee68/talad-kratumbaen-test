TEST PATCH — Capacitor Native Push bridge

Upload these 2 files to the ROOT of the TEST website repository:
1) index.html
2) native-push-bridge.js

What this patch does:
- Runs only inside Capacitor/native Android; normal Chrome/PWA remains unchanged.
- Registers listeners BEFORE app.js loads.
- Requests/checks notification permission and calls PushNotifications.register().
- Captures registration, foreground receive, and notification-tap events.
- Logs [NativePush] messages in Chrome remote DevTools.

What this patch does NOT do yet:
- It does not change Supabase/database/SQL.
- It does not change production.
- It does not yet save the FCM token to the server.
- It does not yet replace the existing Web Push backend.

After deploy:
1) Force-close and reopen Android TEST app.
2) Remote inspect the WebView Console.
3) Confirm: [NativePush] permission granted and [NativePush] registration OK.
4) Send Firebase test message again. In foreground Console should show [NativePush] received.
