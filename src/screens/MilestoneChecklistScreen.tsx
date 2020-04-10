import React, {useMemo, useState} from 'react';
import Text from '../components/Text';
import Layout from '../components/Layout';
import ChildSelectorModal from '../components/ChildSelectorModal';
import {Dimensions, Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {images, SkillType, skillTypes} from '../resources/constants';
import {Button} from 'react-native-paper';
import _ from 'lodash';
import milestoneChecklist, {SkillSection} from '../resources/milestoneChecklist';
import {useTranslation} from 'react-i18next';
import ViewPager from '@react-native-community/viewpager';
import YouTube from 'react-native-youtube';

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

const QuestionItem: React.FC<SkillSection> = ({id, value, photos, videos}) => {
  const {t} = useTranslation('milestones');
  const photo = photos?.map((item, index) => {
    const name = (item.name && t(item.name)) || '';
    const image = images[name];
    return (
      <Image
        // resizeMethod={'scale'}
        resizeMode={'contain'}
        key={`photo-${index}`}
        accessibilityLabel={item.alt && t(item.alt)}
        source={image}
        style={{width: '100%'}}
      />
    );
  });

  const video = videos?.map((item, index) => {
    const code = item.name && t(item?.name);
    return (
      <YouTube
        key={`video-${index}`}
        videoId={code} // The YouTube video ID
        play={false} // control playback of video with true/false
        fullscreen={false} // control whether the video should play in fullscreen or inline
        loop={false} // control whether the video should loop when ended
        // onReady={(e) => this.setState({isReady: true})}
        // onChangeState={(e) => this.setState({status: e.state})}
        // onChangeQuality={(e) => this.setState({quality: e.quality})}
        // onError={(e) => this.setState({error: e.error})}
        style={{alignSelf: 'stretch', height: 260}}
      />
    );
  });

  return (
    <View style={{paddingHorizontal: 20, paddingBottom: 20, flex: 1}}>
      {photos && photos.length > 0 && (
        <ViewPager style={{flex: 1, height: 260}} initialPage={0}>
          {photo}
        </ViewPager>
      )}
      {video}
      <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
        <TouchableOpacity style={styles.answerButton}>
          <Text>YES</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.answerButton, {width: 50, borderRadius: 100}]}>
          <Text style={{fontSize: 9}}>UNSURE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.answerButton}>
          <Text>NOT YET</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

type Section = SkillType | 'actEarly';

const MilestoneChecklistScreen: React.FC<{}> = () => {
  const [section, setSection] = useState<Section>();

  const sections = useMemo<Section[]>(() => {
    return [...skillTypes, 'actEarly'];
  }, []);

  const questions = useMemo<SkillSection[] | undefined>(() => {
    return _.chain(milestoneChecklist).find({id: 2}).get(`milestones.${section}`).value();
  }, [section]);

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
      {section && skillTypes.includes(section) && (
        <FlatList
          data={questions}
          renderItem={({item}) => <QuestionItem {...item} />}
          keyExtractor={(item, index) => `${item}-${index}`}
        />
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
  answerButton: {
    borderWidth: 1,
    height: 50,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MilestoneChecklistScreen;
