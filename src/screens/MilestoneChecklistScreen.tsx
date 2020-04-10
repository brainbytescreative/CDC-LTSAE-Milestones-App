import React, {useMemo, useState} from 'react';
import Text from '../components/Text';
import Layout from '../components/Layout';
import ChildSelectorModal from '../components/ChildSelectorModal';
import {Dimensions, StyleSheet, TouchableOpacity, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {SkillType, skillTypes} from '../resources/constants';
import {Button} from 'react-native-paper';

interface ItemProps {
  section: Section;
  setSection: React.Dispatch<React.SetStateAction<Section | undefined>>;
  selectedSection: Section | undefined;
}

const Item: React.FC<ItemProps> = ({section, setSection, selectedSection}) => (
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
          color: selectedSection === section ? 'white' : 'black',
        }}>
        {section}
      </Text>
    </View>
  </TouchableOpacity>
);

type Section = SkillType | 'actEarly';

const MilestoneChecklistScreen: React.FC<{}> = () => {
  const [section, setSection] = useState<Section>();

  const sections = useMemo<Section[]>(() => {
    return [...skillTypes, 'actEarly'];
  }, []);

  return (
    <Layout>
      <ChildSelectorModal />
      <View style={{flex: 0}}>
        <FlatList
          data={sections}
          horizontal={true}
          renderItem={({item}) => <Item setSection={setSection} selectedSection={section} section={item} />}
          keyExtractor={(item, index) => `${item}-${index}`}
        />
      </View>
      {!section && (
        <>
          <Text style={[styles.header, {marginTop: 20}]}>4 month</Text>
          <Text style={[styles.header]}>Milestone checklist</Text>
          <Text style={[styles.header, {fontWeight: 'normal'}]}>Front page</Text>
          <Text style={[styles.text]}>
            Please note: if your child is between milestones, you will answer questions for the younger milestone
          </Text>
          <Text style={[styles.text]}>"Unsure" items will trigger reminder every xx weeks until answered</Text>
          <Text style={[styles.text]}>You'll be answering questions about Social, Cognitive etc.</Text>

          <View style={{alignItems: 'center', marginTop: 30}}>
            <Button
              onPress={() => {
                setSection(sections[0]);
              }}
              mode={'outlined'}>
              Get started
            </Button>
          </View>
        </>
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 5,
  },
  text: {
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    fontSize: 16,
  },
});

export default MilestoneChecklistScreen;
