import * as Location from 'expo-location';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, ALUNO_ID } from '../firebase/config';


export default function NewCallScreen() {
  // ==============================
  // ESTADOS
  // ==============================

  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  

  // Endereço da localização
  const [address, setAddress] = useState<string | null>(null);

  // Controla o carregamento da localização
  const [loadingLocation, setLoadingLocation] = useState(false);

  // ==============================
  // TIRAR FOTO COM A CÂMERA
  // ==============================

  async function handleTakePhoto() {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permissão negada',
        'Precisamos da câmera para o chamado.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  // ==============================
  // ESCOLHER FOTO DA GALERIA
  // ==============================

  async function handlePickFromGallery() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permissão negada',
        'Precisamos acessar suas fotos.'
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  // ==============================
  // PEGAR LOCALIZAÇÃO
  // ==============================

  async function handleGetLocation() {
    try {
      setLoadingLocation(true);

      // 1. Pede permissão para localização
      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permissão negada',
          'Precisamos da localização para registrar o chamado.'
        );
        return;
      }

      // 2. Verifica se o GPS está ligado
      const gpsAtivo =
        await Location.hasServicesEnabledAsync();

      if (!gpsAtivo) {
        Alert.alert(
          'GPS desligado',
          'Ative a localização do aparelho e tente novamente.'
        );
        return;
      }

      // 3. Obtém a localização atual
      const position =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      const { latitude, longitude } = position.coords;

      // 4. Converte latitude/longitude em endereço
      const [local] =
        await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

      // 5. Monta o endereço
      if (local) {
        const enderecoFormatado = [
          local.street,
          local.streetNumber,
          local.district,
          local.city,
          local.region,
        ]
          .filter(Boolean)
          .join(', ');

        if (enderecoFormatado) {
          setAddress(enderecoFormatado);
        } else {
          setAddress(
            `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          );
        }
      } else {
        setAddress(
          `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        );
      }
    } catch (error) {
      console.error(
        'Erro ao obter localização:',
        error
      );

      Alert.alert(
        'Erro',
        'Não foi possível obter a localização. Tente novamente.'
      );
    } finally {
      setLoadingLocation(false);
    }
  }

  async function handleCreateCall() {
  setSaving(true);
 
  try {
    await addDoc(collection(db, 'alunos', ALUNO_ID, 'chamados'), {
      description,
      photoUri,
      address,
      status: 'aberto',
      criadoEm: serverTimestamp(),
    });
 
    Alert.alert('Sucesso', 'Chamado registrado!');
    setDescription('');
    setPhotoUri(null);
    setAddress(null);
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível salvar o chamado. Tente novamente.');
  } finally {
    setSaving(false);
  }
}



  // ==============================
  // TELA
  // ==============================

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>
        Novo Chamado
      </Text>

      {/* DESCRIÇÃO */}

      <Text style={styles.label}>
        Descrição do problema
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ex.: Notebook não liga..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* FOTO */}

      <Text style={styles.label}>
        Foto do equipamento
      </Text>

      {photoUri ? (
        <View>
          <Image
            source={{ uri: photoUri }}
            style={styles.photo}
          />

          <TouchableOpacity
            onPress={() => setPhotoUri(null)}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>
              Remover foto
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Nenhuma foto anexada
          </Text>
        </View>
      )}

      {/* BOTÕES DE FOTO */}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.cameraButton,
          ]}
          onPress={handleTakePhoto}
        >
          <Text style={styles.buttonText}>
            Câmera
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.galleryButton,
          ]}
          onPress={handlePickFromGallery}
        >
          <TouchableOpacity
          style={[styles.button, styles.confirmButton, (!description || saving) && styles.disabledButton]}
          disabled={!description || saving}
          onPress={handleCreateCall}
        >
          <Text style={styles.buttonText}>{saving ? 'Salvando...' : 'Criar Chamado'}</Text>
           </TouchableOpacity>

          <Text style={styles.buttonText}>
            Galeria
          </Text>
        </TouchableOpacity>
      </View>

      {/* LOCALIZAÇÃO */}

      <Text style={styles.label}>
        Localização do chamado
      </Text>

      {loadingLocation ? (
        <Text style={styles.placeholderText}>
          Buscando localização...
        </Text>
      ) : address ? (
        <Text style={styles.addressText}>
          {address}
        </Text>
      ) : (
        <Text style={styles.placeholderText}>
          Nenhuma localização registrada
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          styles.locationButton,
        ]}
        onPress={handleGetLocation}
        disabled={loadingLocation}
      >
        <Text style={styles.buttonText}>
          {loadingLocation
            ? 'Buscando...'
            : 'Registrar localização'}
        </Text>
      </TouchableOpacity>

      {/* CRIAR CHAMADO */}

      <TouchableOpacity
        style={[
          styles.button,
          styles.confirmButton,
          !description && styles.disabledButton,
        ]}
        disabled={!description}
        onPress={() =>
          Alert.alert(
            'Sucesso',
            'Chamado registrado localmente!'
          )
        }
      >
        <Text style={styles.buttonText}>
          Criar Chamado
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ==============================
// ESTILOS
// ==============================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  placeholder: {
    height: 160,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderText: {
    color: '#999',
  },

  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },

  removeButton: {
    marginTop: 8,
    alignItems: 'center',
  },

  removeButtonText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },

  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },

  button: {
    flex: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },

  cameraButton: {
    backgroundColor: '#1565c0',
  },

  galleryButton: {
    backgroundColor: '#6a1b9a',
  },

  locationButton: {
    backgroundColor: '#00695c',
    marginTop: 8,
    marginBottom: 16,
  },

  confirmButton: {
    backgroundColor: '#2e7d32',
    marginTop: 20,
  },

  disabledButton: {
    backgroundColor: '#a5d6a7',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  addressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
});