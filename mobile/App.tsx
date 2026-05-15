import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

/** Замените на URL вашего сайта после деплоя (https://...) */
const SITE_URL = 'https://example.com';

export default function App() {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Next Pizza</Text>
        <Text style={styles.sub}>Мобильная оболочка: открывается ваш веб-сайт. Для Google Play позже добавьте иконки, splash и подпишите сборку (EAS Build).</Text>
      </View>
      <WebView source={{ uri: SITE_URL }} style={styles.web} startInLoadingState />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e5e5' },
  title: { fontSize: 20, fontWeight: '800' },
  sub: { marginTop: 6, fontSize: 12, color: '#555' },
  web: { flex: 1 },
});
