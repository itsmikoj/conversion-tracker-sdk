import React, { useEffect } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { 
  useConversionTracker, 
  useEventTracker, 
  EventType,
  getMetaConfigFromExpo  // ✨ Helper automático
} from '@your-org/conversion-tracker-sdk';

export default function App() {
  // ✨ Auto-carga las keys desde app.json
  const metaConfig = getMetaConfigFromExpo();

  const { 
    isInitialized, 
    track, 
    trackPurchase, 
    setUserId, 
    requestTracking,
    getStats 
  } = useConversionTracker({
    providers: {
      meta: {
        enabled: true,
        ...metaConfig,  // ✨ Aquí se cargan appId y clientToken automáticamente
        
        // Solo agrega lo opcional si lo necesitas:
        // pixelId: 'YOUR_PIXEL_ID',
        // accessToken: 'YOUR_ACCESS_TOKEN',
        // enableConversionsAPI: true,
      },
    },
    debug: __DEV__,
  });

  const {
    trackAddToCart,
    trackViewContent,
    trackLogin,
  } = useEventTracker();

  useEffect(() => {
    if (isInitialized) {
      initializeApp();
    }
  }, [isInitialized]);

  const initializeApp = async () => {
    // Request tracking permission (iOS)
    const status = await requestTracking();
    console.log('Tracking status:', status);

    // Track app open
    await track(EventType.VIEW_CONTENT, {
      contentType: 'app_open',
      contentId: 'home',
    });
  };

  const handleLogin = async () => {
    await trackLogin('email');
    await setUserId('user-123');
  };

  const handleAddToCart = async () => {
    await trackAddToCart('product-abc', 29.99, 'USD');
  };

  const handlePurchase = async () => {
    await trackPurchase(
      'order-123',
      99.99,
      'USD',
      [
        { id: 'product-abc', quantity: 1, price: 29.99 },
        { id: 'product-xyz', quantity: 2, price: 35.00 },
      ]
    );
  };

  const handleViewProduct = async () => {
    await trackViewContent('product-abc', 'product');
  };

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text>Initializing tracker...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conversion Tracker Demo</Text>
      <Text style={styles.subtitle}>Auto-Config Enabled ✨</Text>
      
      <Button title="Login" onPress={handleLogin} />
      <Button title="View Product" onPress={handleViewProduct} />
      <Button title="Add to Cart" onPress={handleAddToCart} />
      <Button title="Purchase" onPress={handlePurchase} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
});
