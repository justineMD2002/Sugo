import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddressAutocompleteProps {
  placeholder: string;
  onAddressSelect: (address: string, details?: any) => void;
  value?: string;
  editable?: boolean;
}

interface Prediction {
  description: string;
  place_id: string;
  placeId?: string; // New API uses placeId instead of place_id
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  placeholder,
  onAddressSelect,
  value = '',
  editable = true,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  console.log('this is an api key: ' + apiKey)

  useEffect(() => {
    if (!apiKey) {
      console.warn(
        'Google Maps API key is not configured. Please add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file'
      );
    }
  }, [apiKey]);

  useEffect(() => {
    // Update input value when prop changes
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  const fetchPredictions = async (text: string) => {
    if (!text || text.length < 3 || !apiKey) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    setIsLoading(true);

    try {
      // Using the new Places API (New)
      const response = await fetch(
        'https://places.googleapis.com/v1/places:autocomplete',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
          },
          body: JSON.stringify({
            input: text,
            languageCode: 'en',
            includedRegionCodes: ['PH'], // Philippines
          }),
        }
      );

      const data = await response.json();

      if (data.suggestions && data.suggestions.length > 0) {
        // Transform new API response to match our interface
        const transformedPredictions = data.suggestions.map((suggestion: any) => ({
          description: suggestion.placePrediction?.text?.text || '',
          place_id: suggestion.placePrediction?.placeId || '',
          placeId: suggestion.placePrediction?.placeId || '',
        }));
        setPredictions(transformedPredictions);
        setShowPredictions(true);
      } else {
        setPredictions([]);
        setShowPredictions(false);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setPredictions([]);
      setShowPredictions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debouncing
    (timeoutRef as any).current = setTimeout(() => {
      fetchPredictions(text);
    }, 400);
  };

  const handleSelectPrediction = (prediction: Prediction) => {
    setInputValue(prediction.description);
    onAddressSelect(prediction.description, { place_id: prediction.place_id });
    setPredictions([]);
    setShowPredictions(false);
    Keyboard.dismiss();
  };

  const handleClearInput = () => {
    setInputValue('');
    onAddressSelect('');
    setPredictions([]);
    setShowPredictions(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={inputValue}
          onChangeText={handleInputChange}
          editable={editable}
          onFocus={() => {
            if (predictions.length > 0) {
              setShowPredictions(true);
            }
          }}
        />
        {inputValue.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearInput}
          >
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
        {isLoading && (
          <ActivityIndicator
            size="small"
            color="#dc2626"
            style={styles.loadingIndicator}
          />
        )}
      </View>

      {showPredictions && predictions.length > 0 && (
        <View style={styles.predictionsContainer}>
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.predictionItem}
                onPress={() => handleSelectPrediction(item)}
              >
                <Ionicons
                  name="location-outline"
                  size={18}
                  color="#6b7280"
                  style={styles.predictionIcon}
                />
                <Text style={styles.predictionText} numberOfLines={2}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            style={styles.predictionsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  textInput: {
    height: 56,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 44,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111827',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 18,
    padding: 4,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 44,
    top: 18,
  },
  predictionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 240,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  predictionsList: {
    flex: 1,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#fff',
  },
  predictionIcon: {
    marginRight: 10,
  },
  predictionText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
});

export default AddressAutocomplete;
