import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, StyleSheet} from 'react-native';
import {Modal, Portal, Text} from 'react-native-paper';

import {colors, sharedStyle} from '../resources/constants';
import PurpleArc from '../components/Svg/PurpleArc';
import AEButtonRounded from '../components/AEButtonRounded';

type Props = {
  title?: string | undefined;
  message?: string| undefined;
  titleComponent?: JSX.Element | undefined;
  messageComponent?: JSX.Element | undefined;
  useComponents?: boolean | undefined;
  visible: boolean;
  onDismissCallback: () => void;
};

const ModalPopUpWithText: React.FC<Props> = ({title, message, titleComponent, messageComponent, useComponents, visible, onDismissCallback}) => {
  const {t} = useTranslation();
  return (
    <Portal>
      <Modal
        contentContainerStyle={styles.modalContentContainer}
        onDismiss={() => {
          onDismissCallback();
        }}
        visible={visible}>
        <View style={styles.textView}>
          <Text style={styles.titleText}>
            {useComponents ? titleComponent : t(title ?? '')}
          </Text>
          <Text style={styles.messageText}>
            {useComponents ? messageComponent : t(message ?? '')}
          </Text>
        </View>
        <PurpleArc width={'100%'} />
        <View style={styles.buttonView}>
          <AEButtonRounded
            onPress={() => {
              onDismissCallback();
            }}
          >
            <Text style={[styles.buttonText, sharedStyle.largeBoldText]}>{t('common:done')}</Text>
          </AEButtonRounded>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContentContainer: {
    backgroundColor: '#fff',
    margin: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.darkGray,
  },
  textView: {
    paddingHorizontal: 16,
    paddingVertical: 22
  },
  titleText: {
    marginBottom: 20,
    fontSize: 22,
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
  },
  messageText: {
    margin: 10,
    textAlign: 'center',
    fontSize: 15,
  },
  buttonView: {
    backgroundColor: colors.purple,
    paddingVertical: 10,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9
  },
  buttonText: {
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ModalPopUpWithText;
