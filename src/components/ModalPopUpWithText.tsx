import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {Modal, Portal, Text} from 'react-native-paper';

import {colors, sharedStyle} from '../resources/constants';

type Props = {
  title: string;
  message: string;
  visible: boolean;
  onDismissCallback: () => void;
};

const ModalPopUpWithText: React.FC<Props> = ({title, message, visible, onDismissCallback}) => {
  const {t} = useTranslation();
  return (
    <Portal>
      <Modal
        contentContainerStyle={styles.modalContentContainer}
        onDismiss={() => {
          onDismissCallback();
        }}
        visible={visible}>
        <Text style={styles.titleText}>{t(title)}</Text>
        <Text style={styles.messageText}>{t(message)}</Text>
        <TouchableOpacity
          accessibilityRole={'button'}
          onPress={() => {
            onDismissCallback();
          }}>
          <Text style={[styles.buttonText, sharedStyle.largeBoldText]}>{t('common:done')}</Text>
        </TouchableOpacity>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContentContainer: {
    backgroundColor: '#fff',
    margin: 32,
    paddingHorizontal: 16,
    paddingVertical: 22,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.darkGray,
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
  buttonText: {
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ModalPopUpWithText;
