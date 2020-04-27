import React, {useState} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Portal, Text, Title} from 'react-native-paper';
import {useHeaderHeight} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import {useSafeArea} from 'react-native-safe-area-context';

const notifications = Array(45);

const NotificationsBadge: React.FC<{}> = () => {
  const headerHeight = useHeaderHeight();
  const {bottom} = useSafeArea();
  const navigation = useNavigation();
  const [visible, setIsVisible] = useState(false);

  React.useLayoutEffect(() => {
    const onPress = () => {
      setIsVisible(!visible);
    };
    navigation.setOptions({
      headerRight: () => {
        return (
          <TouchableOpacity onPress={onPress} style={visible ? styles.crossContainer : styles.badgeContainer}>
            {visible ? <EvilIcons size={32} name={'close'} /> : <Title style={styles.badgeText}>4</Title>}
          </TouchableOpacity>
        );
      },
    });
  }, [navigation, visible]);

  return (
    <>
      {visible && (
        <Portal>
          <View style={{flex: 1, backgroundColor: 'white', marginTop: headerHeight}}>
            <Title
              style={{
                fontSize: 22,
                textAlign: 'center',
                marginVertical: 16,
              }}>
              Notifications
            </Title>
            <FlatList
              data={notifications}
              style={{flex: 1}}
              keyExtractor={(item, index) => `${index}`}
              ItemSeparatorComponent={() => (
                <View style={{borderWidth: 1, margin: 20, borderColor: 'gray', borderStyle: 'dashed'}} />
              )}
              ListFooterComponent={() => <View style={{height: bottom}} />}
              renderItem={() => (
                <View
                  style={{
                    flexDirection: 'row',
                    paddingHorizontal: 20,
                    // justifyContent: 'space-between',
                  }}>
                  <Text style={{flex: 1}}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sed iaculis velit, eu fermentum ipsum.
                    Vivamus velit sem, lacinia eget ante in, eleifend finibus tellus. Proin tempus sodales tellus non
                    lobortis.
                  </Text>

                  <TouchableOpacity style={{justifyContent: 'flex-start', alignItems: 'flex-end'}}>
                    <EvilIcons style={{margin: -5}} size={32} name={'close'} />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </Portal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    backgroundColor: '#fff',
    width: 23,
    height: 23,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 32,
  },
  crossContainer: {
    marginHorizontal: 28,
  },
  badgeText: {
    fontSize: 15,
  },
});

export default NotificationsBadge;
