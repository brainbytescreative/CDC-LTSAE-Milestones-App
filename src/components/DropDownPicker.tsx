import React, {useReducer, useRef} from 'react';
import {
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {Portal} from 'react-native-paper';

interface Item {
  label: string;
  value: string | number;
}

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
  value: string | null | undefined;
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
}) => {
  const [state, setState] = useReducer((p: State, a: State) => ({...p, ...a}), {
    defaultNull,
    visible: false,
    choice: {
      label: undefined,
      value: undefined,
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
          ...Platform.select({
            default: {
              zIndex,
            },
          }),
        },
      ]}>
      <TouchableOpacity
        ref={tochableRef}
        onLayout={(event) => {
          // console.log(event.nativeEvent.layout);
          setState({
            top: event.nativeEvent.layout.height - 1,
          });
        }}
        disabled={disabled}
        onPress={toggle}
        activeOpacity={1}
        style={[styles.dropDown, style, state.visible && styles.noBottomRadius, {flexDirection: 'row', flex: 1}]}>
        <View style={[styles.dropDownDisplay]}>
          <Text style={[labelStyle, {opacity}]}>{label}</Text>
        </View>
        {!!(customArrowDown || customArrowUp) && (
          <View style={[styles.arrow]}>
            <View style={[arrowStyle, {opacity}]}>{!state.visible ? customArrowUp : customArrowDown}</View>
          </View>
        )}
      </TouchableOpacity>
      {/*<Portal>*/}
      <View
        style={[
          styles.dropDown,
          styles.dropDownBox,
          !state.visible && styles.hidden,
          {
            top: state.top,
            // left: state.left,
            // width: state.width,
            maxHeight: dropDownMaxHeight,
            zIndex,
          },
          itemsContainerStyle,
        ]}>
        <ScrollView bounces={false} style={[{width: '100%', zIndex}]} nestedScrollEnabled={true}>
          {items.map((item, index) => (
            <TouchableOpacity
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
  dropDown: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#dfdfdf',
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
