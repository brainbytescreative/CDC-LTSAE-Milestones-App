import React from 'react';
import {View} from 'react-native';

import ChildSelectorModal from '../../components/ChildSelectorModal';
import {colors} from '../../resources/constants';
import ActEarlyPage from '../MilestoneChecklist/ActEarlyPage';

const WhenActEarlyScreen: React.FC = () => {
  // const {data: {id: childId} = {}} = useGetCurrentChild();
  // const {progress: sectionsProgress} = useGetSectionsProgress(childId);

  return (
    <View style={{backgroundColor: colors.white, flex: 1}}>
      <ChildSelectorModal />
      {/*<View style={{flex: 0}}>*/}
      {/*  <FlatList*/}
      {/*    data={checklistSections}*/}
      {/*    horizontal={true}*/}
      {/*    renderItem={({item}) => (*/}
      {/*      <SectionItem progress={sectionsProgress?.get(item)} selectedSection={'actEarly'} section={item} />*/}
      {/*    )}*/}
      {/*    keyExtractor={(item, index) => `${item}-${index}`}*/}
      {/*  />*/}
      {/*</View>*/}
      <ActEarlyPage />
    </View>
  );
};

export default WhenActEarlyScreen;
