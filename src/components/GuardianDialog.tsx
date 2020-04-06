import React, {useState} from 'react';
import {Text} from 'react-native';
import {Button, Dialog, Portal, RadioButton} from 'react-native-paper';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Guardian} from '../resources/constants';
import {useTranslation} from 'react-i18next';

interface Props {
  children: (showDialog: () => void, hideDialog: () => any) => any;
  onChange: (guardian: Guardian | undefined) => void;
  value: Guardian | undefined;
}

const GuardianDialog: React.FC<Props> = ({children, onChange, value}) => {
  const [guardianDialogVisible, setGuardianDialogVisible] = useState(false);
  const hideDialog = () => {
    setGuardianDialogVisible(false);
  };

  const showDialog = () => {
    setGuardianDialogVisible(true);
  };

  const onPress = (guardian: Guardian) => () => {
    onChange(guardian);
  };
  const {t} = useTranslation();

  return (
    <>
      <Portal>
        <Dialog visible={guardianDialogVisible} onDismiss={hideDialog}>
          <Dialog.Content>
            <TouchableOpacity onPress={onPress('guardian')} style={{flexDirection: 'row', alignItems: 'center'}}>
              <RadioButton.Android value="guardian" status={value === 'guardian' ? 'checked' : 'unchecked'} />
              <Text>{t('guardianTypes:guardian')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onPress('healthcareProvider')}
              style={{flexDirection: 'row', alignItems: 'center'}}>
              <RadioButton.Android value="girl" status={value === 'healthcareProvider' ? 'checked' : 'unchecked'} />
              <Text>{t('guardianTypes:healthcareProvider')}</Text>
            </TouchableOpacity>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>{t('common:skip')}</Button>
            <Button onPress={hideDialog}>{t('common:done')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      {children(showDialog, hideDialog)}
    </>
  );
};

export default GuardianDialog;
