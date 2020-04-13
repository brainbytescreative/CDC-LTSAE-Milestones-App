import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button} from 'react-native-paper';
import Text from '../../components/Text';

interface Props {
  onGetStarted: () => void;
  milestoneAgeFormatted: string | undefined;
}

const FrontPage: React.FC<Props> = ({onGetStarted, milestoneAgeFormatted}) => {
  return (
    <>
      <Text style={[styles.header, {marginTop: 20}]}>{milestoneAgeFormatted}</Text>
      <Text style={[styles.header]}>Milestone checklist</Text>
      <Text style={[styles.header, {fontWeight: 'normal'}]}>Front page</Text>
      <Text style={[styles.text]}>
        Please note: if your child is between milestones, you will answer questions for the younger milestone
      </Text>
      <Text style={[styles.text]}>"Unsure" items will trigger reminder every xx weeks until answered</Text>
      <Text style={[styles.text]}>You'll be answering questions about Social, Cognitive etc.</Text>

      <View style={{alignItems: 'center', marginTop: 30}}>
        <Button onPress={onGetStarted} mode={'outlined'}>
          Get started
        </Button>
      </View>
    </>
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

export default FrontPage;
