import React, {useState} from 'react';
import {Modal, Text, View} from 'react-native';
import {FlatList, TouchableOpacity} from 'react-native-gesture-handler';
import {StateCode, states} from './resources/constants';
import {useTranslation} from 'react-i18next';
import {useSafeArea} from 'react-native-safe-area-context';

interface Props {
  children: (showModal: () => void) => any;
  onChange?: (code: StateCode) => void;
  value?: StateCode | undefined;
}

const Item: React.FC<{stateCode: StateCode; value?: StateCode | undefined; onPress: (code: StateCode) => void}> = ({
  stateCode,
  onPress,
}) => {
  const {t} = useTranslation();
  return (
    <TouchableOpacity
      onPress={() => {
        onPress(stateCode);
      }}>
      <Text>{t(`states:${stateCode}`)}</Text>
    </TouchableOpacity>
  );
};

const TerritorySelector: React.FC<Props> = ({children, onChange, value}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const {top} = useSafeArea();

  const showModal = () => {
    setModalVisible(true);
  };

  const onPress = (code: StateCode) => {
    onChange && onChange(code);
    setModalVisible(false);
  };

  return (
    <>
      <Modal visible={modalVisible}>
        <View style={{marginTop: top}}>
          <FlatList
            data={states}
            renderItem={({item}) => <Item value={value} onPress={onPress} stateCode={item} />}
            keyExtractor={(item) => item}
          />
        </View>
      </Modal>
      {children(showModal)}
    </>
  );
};

export default TerritorySelector;
