import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Button,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

export default function Tela2() {
  const [itens, setItens] = useState([]);
  const [arrematantes, setArrematantes] = useState([]);
  const [lances, setLances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [valor, setValor] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArrematante, setSelectedArrematante] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [recarregar, setRecarregar] = useState(false);

  const ConfirmaDialogo = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Campo vazio</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  };

  useEffect(() => {
    fetch('https://leilao-rest-api.herokuapp.com/itemdeleilao')
      .then((resp) => resp.json())
      .then((json) => { console.log(1, json); return setItens(json) })
      .then(() => fetch('https://leilao-rest-api.herokuapp.com/participante'))
      .then((resp) => resp.json())
      .then((json) => { console.log(2, json); return setArrematantes(json) })
      .then(() => fetch('https://leilao-rest-api.herokuapp.com/lance'))
      .then((resp) => resp.json())
      .then((json) => { console.log(3, json); setLances(json) })
      .catch((error) => console.error(1, error))
      .finally(() => setLoading(false));
  }, [recarregar]);

  const loadArrematanteNomes = async () => {
    const nomes = await Promise.all(
      arrematantes.map(async (arrematanteId) => {
        const response = await fetch(`https://leilao-rest-api.herokuapp.com/participante/${arrematanteId}`);
        const data = await response.json();
        return { id: arrematanteId, nome: data.nome };
      })
    );
    return nomes;
  };

  const enviar = () => {
    postLance();
  };

  const postLance = () => {
    if (selectedArrematante === '' || valor === '' || selectedItem === '') {
      setModalVisible(true);
    } else {
      const lanceObj = {
        valor: parseFloat(valor),
        arrematante: {
          id: selectedArrematante,
        },
      };
      fetch('https://leilao-rest-api.herokuapp.com/itemdeleilao/' + selectedItem, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lanceObj),
      })
        .then((response) => response.text())
        .then((resp) => console.log('lance ', resp))
        .then(() => {
          setSelectedArrematante('');
          setValor('');
          // Recarregar a lista de lances após o cadastro
          fetch('https://leilao-rest-api.herokuapp.com/lance')
            .then((resp) => resp.json())
            .then((json) => setLances(json))
            .catch((error) => console.error(error));
        })
        .catch((error) => console.error(error))
    }
  }

  const reload = () => {
    setRecarregar(!recarregar);
    setSelectedArrematante('')
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <View style={{ flex: 1 }}>
          <ConfirmaDialogo />
          <Pressable onPress={() => reload()} style={({ pressed }) => [
            {
              backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white',
            },
            styles.wrapperCustom, { width: 36 }
          ]}>
            <Ionicons name="reload" size={24} color="black" />
          </Pressable>
          <Picker
            selectedValue={selectedArrematante}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedArrematante(arrematantes[itemIndex - 1].id)
            }>
            <Picker.Item label={selectedArrematante === '' ? "Selecione um arrematante" : arrematantes.find((item) => item.id == selectedArrematante).nome} value="" />
            {arrematantes.map((arrematante) => (
              <Picker.Item
                key={arrematante.id}
                label={arrematante.nome}
              />
            ))}
          </Picker>
          <Picker
            selectedValue={selectedItem}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedItem(itens[itemIndex - 1].id)
            }>
            <Picker.Item label={selectedItem === '' ? "Selecione um item de leilão" : itens.find((item) => item.id == selectedItem).nome} value="" />
            {itens.map((item) => (
              <Picker.Item
                key={item.id}
                label={item.nome}
              />
            ))}
          </Picker>
          <TextInput
            style={styles.input}
            onChangeText={setValor}
            value={valor}
            placeholder="Valor"
          />
          <View style={styles.button}>
            <Button title="Enviar" onPress={() => enviar()} />
          </View>
          <FlatList
            data={itens}
            style={{ margin: 12 }}
            renderItem={({ item }) => {
              return (
                <View style={styles.item}>
                  <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                    <Text style={styles.valor}>{item.nome}</Text>
                    <Text style={styles.nomeArrematante}>{item.valorMinimo}</Text>
                    <Picker
                      selectedValue="teste"
                      onValueChange={(itemValue, itemIndex) =>
                        console.log(itemValue)}
                    >
                      {/* {item.lancesRecebidos.length === 0
                        ? <Picker.item label="sem lances" value="sem lances" />
                        : item.lancesRecebidos.map((item) => (
                          <Picker.Item
                            label={item.arrematante.nome}
                            value={item.arrematante.nome}
                          />
                        ))} */}
                    </Picker>
                  </View>
                </View>
              );
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f0d071',
    padding: 8,
  },
  valor: {
    fontSize: 16,
    marginRight: 8,
  },
  nomeArrematante: {
    fontSize: 16,
    flex: 1,
  },
  item: {
    marginVertical: 8,
    flexDirection: 'row',
    borderBottomWidth: 0.2,
    justifyContent: 'space-between',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 0.5,
    padding: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 10,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    marginHorizontal: 12,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  wrapperCustom: {
    borderRadius: 8,
    padding: 6,
  },
});
