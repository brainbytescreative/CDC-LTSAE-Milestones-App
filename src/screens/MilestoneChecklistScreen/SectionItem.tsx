import React from 'react';
import {Dimensions, TouchableOpacity, View} from 'react-native';
import {colors, sharedStyle, SkillType} from '../../resources/constants';
import {useTranslation} from 'react-i18next';
import {Text} from 'react-native-paper';
import _ from 'lodash';

export type Section = SkillType | 'actEarly';

interface ItemProps {
  section: Section;
  setSection: React.Dispatch<React.SetStateAction<Section | undefined>>;
  selectedSection: Section | undefined;
  progress: {total: number; answered: number} | undefined;
}

const SectionItem: React.FC<ItemProps> = ({section, setSection, selectedSection, progress}) => {
  const {t} = useTranslation('milestoneChecklist');
  const textColor = selectedSection === section ? 'white' : 'black';
  const toGo = progress?.total && progress?.total && progress.total - progress.answered;
  return (
    <TouchableOpacity
      onPress={() => {
        setSection(section);
      }}
      style={{flex: 1}}>
      <View
        style={[
          {
            backgroundColor: _.get(colors.sections, section),
            minWidth: Dimensions.get('screen').width / 5,
            alignItems: 'center',
            justifyContent: 'center',
            height: 75,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            paddingHorizontal: 5,
          },
          sharedStyle.shadow,
        ]}>
        {/*<View*/}
        {/*  style={{*/}
        {/*    backgroundColor: selectedSection === section ? 'gray' : 'white',*/}
        {/*    position: 'absolute',*/}
        {/*    width: '100%',*/}
        {/*    height: '100%',*/}
        {/*  }}*/}
        {/*/>*/}
        {/*<View*/}
        {/*  style={{*/}
        {/*    width: '90%',*/}
        {/*    aspectRatio: 1,*/}
        {/*    borderWidth: 1,*/}
        {/*    borderRadius: 100,*/}
        {/*    marginVertical: 10,*/}
        {/*    backgroundColor: 'white',*/}
        {/*  }}*/}
        {/*/>*/}
        <Text
          numberOfLines={1}
          style={{
            color: textColor,
            textAlign: 'center',
            fontSize: 13,
            textTransform: 'lowercase',
            fontFamily: 'Avenir-Heavy',
          }}>
          {t(`section-${section}`)}
        </Text>
        {toGo && (
          <Text
            style={{
              fontSize: 11,
              color: textColor,
              fontFamily: 'Avenir-Light',
            }}>
            {`${toGo} to go`}
          </Text>
        )}
        {/*<Text*/}
        {/*  style={{*/}
        {/*    fontSize: 10,*/}
        {/*    color: textColor,*/}
        {/*  }}>*/}
        {/*  {t('answered')}*/}
        {/*</Text>*/}
      </View>
    </TouchableOpacity>
  );
};

export default SectionItem;
