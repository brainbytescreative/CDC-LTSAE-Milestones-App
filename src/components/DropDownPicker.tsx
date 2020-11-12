import React, {useReducer, useRef} from 'react';
import {Platform, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle} from 'react-native';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';

// interface Item {
//   label: string;
//   value: string | number;
// }

interface Props {
  /**
   * The items for the component.	array		Yes
   */
  items: Choice[];
  /**
   * Additional styles for the active item.  object  {}  No
   */
  activeItemStyle?: StyleProp<ViewStyle>;
  /**
   * Additional styles for the active label.  object  {}  No
   */
  activeLabelStyle?: StyleProp<TextStyle>;
  /**
   * Additional styles for the labels.  object  {}  No
   */
  labelStyle?: StyleProp<TextStyle>;
  /**
   *  Additional styles for the arrow.	object	{}	No
   */
  arrowStyle?: StyleProp<ViewStyle>;
  /**
   *  Default text to be shown to the user which must be used with defaultNull	string	'Select an item'	No
   */
  placeholder?: string;
  placeholderColor?: string;
  /**
   *  The index of the default item.	number	0	No
   */
  defaultIndex?: number;
  /**
   *  Additional styles for the container view.	object	{}	No
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   *  Additional styles for the picker.	object	{}	No
   */
  style?: StyleProp<ViewStyle>;
  /**
   *  Callback which returns item and index. The item is the selected object.	function		No
   * @param item
   */
  onChangeItem?: (item: Choice, index: number) => void;
  /**
   * 	The value of the default item.	any		No
   */
  value?: any;
  /**
   * 	This sets the choice to null which should be used with placeholder	bool	true	No
   */
  defaultNull?: boolean;
  /**
   * 	Height of the dropdown box.	number	150	No
   */
  dropDownMaxHeight?: number;
  /**
   * 	Additional styles for the items.	object	{}	No
   */
  itemStyle?: StyleProp<ViewStyle>;
  itemsContainerStyle?: StyleProp<ViewStyle>;

  /**
   * 	Customize the arrow-up.	jsx	null	No
   */
  customArrowUp?: React.ReactElement;
  /**
   * 	Customize the arrow-down.	jsx	null	No
   */
  customArrowDown?: React.ReactElement;
  /**
   * 	This property specifies the stack order of the component.	number	5000	No
   */
  zIndex?: number;
  /**
   * 	This disables the component.	bool	false	No
   */
  disabled?: boolean;
}

interface Choice {
  label: string | null | undefined;
  value: string | null | undefined | number;
}

interface State {
  choice?: Choice;
  visible?: boolean;
  defaultNull?: boolean;
  top?: number;
  width?: number;
  left?: number;
}

const DropDownPicker: React.FC<Props> = ({
  zIndex = 5000,
  defaultNull = false,
  placeholder = 'Select an item',
  placeholderColor,
  dropDownMaxHeight = 150,
  style = {},
  containerStyle = {},
  itemStyle = {},
  itemsContainerStyle = {},
  labelStyle = {},
  activeItemStyle = {},
  activeLabelStyle = {},
  arrowStyle = {},
  disabled = false,
  onChangeItem,
  customArrowUp,
  customArrowDown,
  items,
  value,
  defaultIndex,
}) => {
  const [state, setState] = useReducer((p: State, a: State) => ({...p, ...a}), {
    defaultNull,
    visible: false,
    choice: {
      label: items?.[Number(defaultIndex)]?.label,
      value: items?.[Number(defaultIndex)]?.value,
    },
  });

  const label = defaultNull && !state.choice?.label?.length ? placeholder : state.choice?.label;
  const opacity = disabled ? 0.5 : 1;

  const toggle = () => {
    setState({
      visible: !state.visible,
    });
  };

  // todo rewrite this logic
  const select = (item: Choice, index: number) => {
    onChangeItem && onChangeItem(item, index);
    setState({
      choice: {
        label: item.label,
        value: item.value,
      },
      visible: false,
      defaultNull: false,
    });
  };

  if (!state.choice?.value && !!value) {
    const index = items.findIndex((v) => v.value === value);
    index >= 0 && select(items[index], index);
  }

  const tochableRef = useRef<TouchableOpacity | null>(null);

  // tochableRef.current?.measure((fx, fy, width, height, left, py) => {
  //   const top = py + height - 1;
  //   state.top !== top &&
  //     setState({
  //       top,
  //       width,
  //       left,
  //     });
  // });

  return (
    <View
      style={[
        containerStyle,
        {
          ...Platform.select<ViewStyle>({
            ios: {
              zIndex: zIndex,
            },
          }),
        },
      ]}>
      <View style={[styles.dropDownContainer, state.visible && styles.noBottomRadius, style]}>
        <TouchableOpacity
          accessibilityRole={'menu'}
          ref={tochableRef}
          onLayout={(event) => {
            setState({
              top: event.nativeEvent.layout.height,
            });
          }}
          disabled={disabled}
          onPress={toggle}>
          <View style={[styles.dropDown, {flexDirection: 'row', flex: 1}]}>
            <View style={[styles.dropDownDisplay]}>
              <Text
                style={[
                  labelStyle,
                  {opacity},
                  Boolean(placeholder) && !state?.choice?.value && {color: placeholderColor},
                ]}>
                {label}
              </Text>
            </View>
            {!!(customArrowDown || customArrowUp) && (
              <View style={[styles.arrow]}>
                <View style={[arrowStyle, {opacity}]}>{!state.visible ? customArrowUp : customArrowDown}</View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.dropDown,
          styles.dropDownBox,
          !state.visible && styles.hidden,
          {
            top: state.top,
            backgroundColor: '#fff',
            // backgroundColor: 'black',
            borderBottomRightRadius: 10,
            borderBottomLeftRadius: 10,
            maxHeight: dropDownMaxHeight,
            ...Platform.select<ViewStyle>({
              default: {zIndex},
              android: {
                elevation: zIndex,
                zIndex,
              },
            }),
          },
          itemsContainerStyle,
        ]}>
        <ScrollView nestedScrollEnabled bounces={false} style={[{width: '100%', zIndex}]}>
          {items
            .filter((v) => v.value !== state.choice?.value)
            .map((item, index) => (
              <TouchableOpacity
                accessibilityRole={'menuitem'}
                key={index}
                onPress={() => select(item, index)}
                style={[styles.dropDownItem, itemStyle, state.choice?.value === item.value && activeItemStyle]}>
                <Text style={[labelStyle, state.choice?.value === item.value && activeLabelStyle]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
      {/*</Portal>*/}
    </View>
  );
};

const styles = StyleSheet.create({
  arrow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    paddingVertical: 8,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  dropDownContainer: {
    backgroundColor: '#fff',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderWidth: 1,
    borderColor: '#dfdfdf',
  },
  dropDown: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dropDownDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    flexGrow: 1,
  },
  dropDownBox: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    position: 'absolute',
    width: '100%',
  },
  dropDownItem: {
    paddingVertical: 8,
    width: '100%',
    justifyContent: 'center',
  },
  hidden: {
    position: 'relative',
    display: 'none',
  },
  noBottomRadius: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
});

export default DropDownPicker;
