import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import Layout from '../components/Layout';
import ChildSelectorModal from '../components/ChildSelectorModal';
import Text from '../components/Text';
import {FlatList, TouchableOpacity, View} from 'react-native';
import {Button, Title} from 'react-native-paper';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import SkillTypeDialog from '../components/SkillTypeDialog';
import {LanguageType, SkillType, skillTypes} from '../resources/constants';
import tipsAndActivities from '../resources/tipsAndActivities';
import i18next from 'i18next';

function Item({title}: any) {
  return (
    <View style={{borderWidth: 1, padding: 20, paddingBottom: 40, marginHorizontal: 20, marginVertical: 30}}>
      <Text style={{position: 'absolute', top: -15, backgroundColor: 'gray', color: 'white', left: 20, padding: 5}}>
        COGNITIVE
      </Text>
      <Text>{title}</Text>
      <View style={{position: 'absolute', bottom: -30, right: 10, flexDirection: 'row', zIndex: 1000}}>
        <TouchableOpacity
          style={{
            marginRight: 20,
            borderWidth: 1,
            backgroundColor: 'white',
            padding: 10,
            borderRadius: 60,
            width: 60,
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            marginRight: 20,
            borderWidth: 1,
            backgroundColor: 'white',
            padding: 10,
            borderRadius: 60,
            width: 60,
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{fontSize: 9, textAlign: 'center'}}>Remind me</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const TipsAndActivitiesScreen: React.FC<{}> = () => {
  const {t} = useTranslation('tipsAndActivities');

  const [skillType, setSkillType] = useState<SkillType>('cognitive');

  const onPressNextSection = () => {
    const currentSection = skillTypes.indexOf(skillType);
    if (currentSection < skillTypes.length - 1) {
      setSkillType(skillTypes[currentSection + 1]);
    } else {
      setSkillType(skillTypes[0]);
    }
  };

  const tips = tipsAndActivities
    .filter((value) => value.age === '2-hint')
    .map((value) => value[i18next.language as LanguageType]);

  return (
    <Layout style={{backgroundColor: 'white'}}>
      <ChildSelectorModal />
      <Text style={{textAlign: 'center', fontSize: 22, marginTop: 20, fontFamily: 'Montserrat-Bold'}}>
        {t('title')}
      </Text>
      <Text style={{textAlign: 'center', fontSize: 15, marginTop: 20, marginHorizontal: 50}}>{t('subtitle')}</Text>

      <SkillTypeDialog
        onChange={(value) => {
          value && setSkillType(value);
        }}
        value={skillType}>
        {(showDialog) => (
          <View style={{alignItems: 'center', marginVertical: 20}}>
            <Button onPress={showDialog} style={{width: 160}} mode={'contained'}>
              {t(`skillTypes:${skillType}`)} <EvilIcons size={20} name={'chevron-down'} />
            </Button>
          </View>
        )}
      </SkillTypeDialog>
      <FlatList
        data={tips}
        ListFooterComponent={() => (
          <View style={{alignItems: 'center', marginVertical: 30}}>
            <Button onPress={onPressNextSection} style={{width: 200}} mode={'contained'}>
              Next section
            </Button>
          </View>
        )}
        renderItem={({item}) => <Item title={item} />}
        keyExtractor={(item, index) => `${index}`}
      />
    </Layout>
  );
};

export default TipsAndActivitiesScreen;
