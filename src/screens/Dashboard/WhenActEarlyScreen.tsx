import React from 'react';
import {FlatList, View} from 'react-native';
import {checklistSections, colors} from '../../resources/constants';
import ChildSelectorModal from '../../components/ChildSelectorModal';
import SectionItem from '../MilestoneChecklist/SectionItem';
import ActEarlyPage from '../MilestoneChecklist/ActEarlyPage';
import {useGetSectionsProgress} from '../../hooks/checklistHooks';
import {useGetCurrentChild} from '../../hooks/childrenHooks';

const WhenActEarlyScreen: React.FC<{}> = () => {
  const {data: {id: childId} = {}} = useGetCurrentChild();
  const {progress: sectionsProgress} = useGetSectionsProgress(childId);

  return (
    <View style={{backgroundColor: colors.white, flex: 1}}>
      <ChildSelectorModal />
      <View style={{flex: 0}}>
        <FlatList
          data={checklistSections}
          horizontal={true}
          renderItem={({item}) => (
            <SectionItem progress={sectionsProgress?.get(item)} selectedSection={'actEarly'} section={item} />
          )}
          keyExtractor={(item, index) => `${item}-${index}`}
        />
      </View>
      <ActEarlyPage />
    </View>
  );
};

export default WhenActEarlyScreen;
