import React from 'react';
import {Dimensions, TouchableOpacity, View} from 'react-native';
import Text from '../../components/Text';
import {SkillType} from '../../resources/constants';
import {useTranslation} from 'react-i18next';

export type Section = SkillType | 'actEarly';

interface ItemProps {
  section: Section;
  setSection: React.Dispatch<React.SetStateAction<Section | undefined>>;
  selectedSection: Section | undefined;
  progress: string | undefined;
}

const SectionItem: React.FC<ItemProps> = ({section, setSection, selectedSection, progress}) => {
  const {t} = useTranslation('milestoneChecklist');
  const textColor = selectedSection === section ? 'white' : 'black';
  return (
    <TouchableOpacity
      onPress={() => {
        setSection(section);
      }}
      style={{flex: 1}}>
      <View
        style={{
          width: Dimensions.get('screen').width / 5,
          alignItems: 'center',
        }}>
        <View
          style={{
            backgroundColor: selectedSection === section ? 'gray' : 'white',
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
        />
        <View
          style={{
            width: '90%',
            aspectRatio: 1,
            borderWidth: 1,
            borderRadius: 100,
            marginVertical: 10,
            backgroundColor: 'white',
          }}
        />
        <Text
          style={{
            color: textColor,
            textAlign: 'center',
            fontSize: 10,
            textTransform: 'uppercase',
          }}>
          {t(`section-${section}`)}
        </Text>
        <Text
          style={{
            fontSize: 10,
            color: textColor,
          }}>
          {progress}
        </Text>
        <Text
          style={{
            fontSize: 10,
            color: textColor,
          }}>
          {t('answered')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default SectionItem;
