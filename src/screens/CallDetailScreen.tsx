import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, ALUNO_ID } from '../firebase/config';

type Chamado = {
  description: string;
  photoUri?: string | null;
  address?: string | null;
  status: string;
};

export default function CallDetailScreen({ route }: any) {
  const { chamadoId } = route.params;
  const [chamado, setChamado] = useState<Chamado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarChamado() {
      // TODO: buscar o documento em alunos/{ALUNO_ID}/chamados/{chamadoId}
      // usando doc(db, ...) + getDoc(...). Se o documento existir
      // (confira snapshot.exists()), guarde os dados com setChamado.
      // Trate o erro com try/catch, como nas telas anteriores.
    }
    carregarChamado();
  }, [chamadoId]);

  async function mudarStatus(novoStatus: string) {
    // TODO: usar updateDoc(doc(db, ...), { status: novoStatus })
    // para atualizar só o campo "status", e depois atualizar
    // o estado local (setChamado) para a tela refletir a mudança
    // sem precisar buscar tudo de novo do servidor.
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // TODO: construir a interface — exibir os dados de "chamado"
  // e os botões de ação, condicionados ao status atual.
  return <View style={styles.screen} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
