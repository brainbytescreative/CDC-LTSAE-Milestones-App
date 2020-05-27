import React, {useState} from 'react';
import {Text, TouchableOpacity} from 'react-native';
import {Button, Dialog, Portal, RadioButton} from 'react-native-paper';
import {SkillType} from '../resources/constants';
import {useTranslation} from 'react-i18next';

interface Props {
  children?: (showDialog: () => void, hideDialog: () => void) => any;
  onChange: (skillType: SkillType | undefined) => void;
  value: SkillType | undefined;
}

const SkillTypeDialog: React.FC<Props> = ({children, onChange, value}) => {
  const [guardianDialogVisible, setGuardianDialogVisible] = useState(false);
  const hideDialog = () => {
    setGuardianDialogVisible(false);
  };

  const showDialog = () => {
    setGuardianDialogVisible(true);
  };

  const onPress = (skillType: SkillType) => () => {
    onChange(skillType);
  };
  const {t} = useTranslation();

  return (
    <>
      <Portal>
        <Dialog visible={guardianDialogVisible} onDismiss={hideDialog}>
          <Dialog.Content>
            {['All', 'Liked', 'Remind me'].map((item) => (
              <TouchableOpacity onPress={onPress(item)} style={{flexDirection: 'row', alignItems: 'center'}}>
                <RadioButton.Android value="guardian" status={value === item ? 'checked' : 'unchecked'} />
                <Text>{t(`skillTypes:${item}`)}</Text>
              </TouchableOpacity>
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>{t('common:done')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      {children && children(showDialog, hideDialog)}
    </>
  );
};

export default SkillTypeDialog;
