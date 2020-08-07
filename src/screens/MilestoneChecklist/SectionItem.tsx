import _ from 'lodash';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Dimensions, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';

import {Section, colors, sharedStyle} from '../../resources/constants';
import {trackChecklistSectionSelect} from '../../utils/analytics';

interface ItemProps {
  section: Section;
  onSectionSet?: (section: Section) => void;
  selectedSection?: Section | undefined;
  progress?: {total: number; answered: number} | undefined;
}

const SectionItem: React.FC<ItemProps> = ({section, onSectionSet, selectedSection, progress}) => {
  const {t} = useTranslation('milestoneChecklist');
  const toGo = progress?.total && progress?.total && progress.total - progress.answered;

  const opacity = !selectedSection || (section === selectedSection && 1) ? 1 : 0.5;

  return (
    <TouchableOpacity
      disabled={!onSectionSet}
      onPress={() => {
        onSectionSet?.(section);
        trackChecklistSectionSelect(section);
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
            {t('togo', {count: toGo})}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default SectionItem;
