import React from 'react';
import {Dimensions, TouchableOpacity, View} from 'react-native';
import {colors, sharedStyle, SkillType} from '../../resources/constants';
import {useTranslation} from 'react-i18next';
import {Text} from 'react-native-paper';
import _ from 'lodash';

export type Section = SkillType | 'actEarly';

interface ItemProps {
  section: Section;
  setSection?: React.Dispatch<React.SetStateAction<Section>>;
  selectedSection?: Section | undefined;
  progress: {total: number; answered: number} | undefined;
}

const SectionItem: React.FC<ItemProps> = ({section, setSection, selectedSection, progress}) => {
  const {t} = useTranslation('milestoneChecklist');
  const toGo = progress?.total && progress?.total && progress.total - progress.answered;

  const opacity = !selectedSection || (section === selectedSection && 1) ? 1 : 0.5;

  return (
    <TouchableOpacity
      disabled={!setSection}
      onPress={() => {
        setSection && setSection(section);
      }}
      style={{flex: 1, paddingBottom: 5}}>
      <View
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        opacity={opacity}
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
        <Text
          style={{
            color: 'black',
            textAlign: 'center',
            fontSize: 13,
            textTransform: 'lowercase',
            fontFamily: 'Avenir-Heavy',
          }}>
          {t(`section-${section}`)}
        </Text>
        {!!toGo && (
          <Text
            style={{
              fontSize: 11,
              color: 'black',
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
