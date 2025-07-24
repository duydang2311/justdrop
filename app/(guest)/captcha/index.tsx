import { useServices } from '@/lib/stores/services';
import { router } from 'expo-router';
import React from 'react';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';

export default function Index() {
  const supabase = useServices((a) => a.supabase);

  const handleMessage = (event: WebViewMessageEvent) => {
    const token = event.nativeEvent.data;
    (async () => {
      const response = await supabase.auth.signInAnonymously({
        options: {
          captchaToken: token,
        },
      });
      if (response.error == null) {
        router.replace('/(auth)');
      }
    })();
  };

  return (
    <WebView
      originWhitelist={['*']}
      onMessage={handleMessage}
      style={{ backgroundColor: 'transparent' }}
      containerStyle={{ flex: 1 }}
      source={{
        baseUrl: 'https://duyda.tech',
        html: `
                <!DOCTYPE html>
                <html style="background-color: transparent;">
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onloadTurnstileCallback" async defer></script>
                  </head>
                  <body style="display: flex; justify-content: center; align-items: center; height: 100vh;">
                     <div id="turnstile-container"></div>
                     <script>
                        function onloadTurnstileCallback() {
                          turnstile.render('#turnstile-container', {
                            sitekey: '0x4AAAAAABmTTWVAhQQkIomX',
                            callback: (token) => {
                              window.ReactNativeWebView.postMessage(token);
                            },
                          });
                        }
                     </script>
                  </body>
                </html>
            `,
      }}
    />
  );
}
