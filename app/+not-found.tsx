import { Redirect } from 'expo-router';
import { useEffect } from 'react';

export default function NotFoundScreen() {
  useEffect(() => {
    // Log what route was attempted
    console.log('Not found screen triggered - likely from notification click');
  }, []);

  // Automatically redirect to home screen when a route is not found
  return <Redirect href="/(tabs)" />;
}
