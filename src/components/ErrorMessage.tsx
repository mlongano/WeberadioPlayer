import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = 'Impossibile caricare i contenuti. Verifica la connessione e riprova.',
  onRetry,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={[styles.icon]}>
        ⚠
      </Text>
      <Text
        variant="bodyLarge"
        style={[styles.message, { color: theme.colors.onBackground }]}
      >
        {message}
      </Text>
      {onRetry && (
        <Button
          mode="contained"
          onPress={onRetry}
          style={styles.button}
          icon="refresh"
        >
          Riprova
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    minWidth: 140,
  },
});

export default ErrorMessage;
