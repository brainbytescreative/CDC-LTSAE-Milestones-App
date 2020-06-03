// import milestoneChecklist from './milestoneChecklist.json!milestoneChecklist';

import {StyleSheet} from 'react-native';
import {StackNavigationOptions} from '@react-navigation/stack';
import {NotificationTriggerInput} from 'expo-notifications/src/Notifications.types';

export const states = [
  'AL',
  'AK',
  'AS',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'DC',
  'FL',
  'GA',
  'GU',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'MP',
  'OH',
  'OK',
  'OR',
  'PA',
  'PR',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VI',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
] as const;

export type StateCode = typeof states[number];

export type Guardian = 'guardian' | 'healthcareProvider';

export const guardianTypes: ['guardian', 'healthcareProvider'] = ['guardian', 'healthcareProvider'];

export const skillTypes = ['social', 'language', 'cognitive', 'movement'];
export type SkillType = typeof skillTypes[number];

export const colors = Object.freeze({
  lightGreen: '#BCFDAC',
  blueLink: '#0645AD',
  purple: '#CEB9EF',
  iceCold: '#94F5EB',
  aquamarine: '#64FCD4',
  lightGray: '#E3E3E3',
  gray: '#B9B9B9',
  darkGray: '#707070',
  black: '#000',
  tanHide: '#FC9554',
  apricot: '#EB7373',
  yellow: '#FCFC9C',
  aquamarineTransparent: 'rgba(100, 252, 212, 0.28)',
  whiteTransparent: 'rgba(255, 255, 255, 0.8)',
  white: 'rgba(255, 255, 255, 1)',
  sections: {
    social: '#EBDEFE',
    language: '#C9FFF0',
    cognitive: '#DBFFD2',
    movement: '#FFFECF',
    actEarly: '#FFC7C7',
  },
});

export const checklistSections = [...skillTypes, 'actEarly'];

export const sharedStyle = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
  },
  border: {
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: colors.gray,
  },
  screenTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    textTransform: 'capitalize',
    marginHorizontal: 32,
    marginTop: 36,
  },
  boldText: {
    fontFamily: 'Montserrat-Bold',
  },
  largeBoldText: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
  },
  regularText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
  },
  midText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Regular',
  },
  midTextBold: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
});

export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
export type DeepWriteable<T> = {-readonly [P in keyof T]: DeepWriteable<T[P]>};

export const sharedScreenOptions: StackNavigationOptions = {
  headerStyle: {
    elevation: 0, // remove shadow on Android
    shadowOpacity: 0, // remove shadow on iOS
    backgroundColor: colors.iceCold,
  },
  headerTintColor: 'black',
  headerTitleAlign: 'center',
  headerBackTitle: ' ',
  headerTitleStyle: {
    ...sharedStyle.largeBoldText,
  },
};

export const childAges = [2, 4, 6, 9, 12, 18, 24, 36, 48, 60];
export const missingConcerns = [1, 7, 15, 25, 34, 42, 51, 58, 68, 80];
export const tooYongAgeDays = 42;
export type LanguageType = 'en' | 'es';

export const notificationIntervals: Readonly<Record<string, NotificationTriggerInput>> = Object.freeze({
  tips: {
    seconds: 20, // todo 2 weeks
  },
});

export const images = {
  '20651': require('./images/20651.jpg'),
  '20652': require('./images/20652.jpg'),
  '20653': require('./images/20653.jpg'),
  '20654': require('./images/20654.jpg'),
  '20655': require('./images/20655.jpg'),
  '20656': require('./images/20656.jpg'),
  '20657': require('./images/20657.jpg'),
  '20658': require('./images/20658.jpg'),
  '20659': require('./images/20659.jpg'),
  '20660': require('./images/20660.jpg'),
  '20661': require('./images/20661.jpg'),
  '20662': require('./images/20662.jpg'),
  '20663': require('./images/20663.jpg'),
  '20664': require('./images/20664.jpg'),
  '20665': require('./images/20665.jpg'),
  '20666': require('./images/20666.jpg'),
  '20667': require('./images/20667.jpg'),
  '20668': require('./images/20668.jpg'),
  '20669': require('./images/20669.jpg'),
  '20670': require('./images/20670.jpg'),
  '20671': require('./images/20671.jpg'),
  '20672': require('./images/20672.jpg'),
  '20673': require('./images/20673.jpg'),
  '20674': require('./images/20674.jpg'),
  '20675': require('./images/20675.jpg'),
  '20676': require('./images/20676.jpg'),
  '20677': require('./images/20677.jpg'),
  '20678': require('./images/20678.jpg'),
  '20679': require('./images/20679.jpg'),
  '20680': require('./images/20680.jpg'),
  '20681': require('./images/20681.jpg'),
  '20682': require('./images/20682.jpg'),
  '20683': require('./images/20683.jpg'),
  '20684': require('./images/20684.jpg'),
  '20685': require('./images/20685.jpg'),
  '20686': require('./images/20686.jpg'),
  '20687': require('./images/20687.jpg'),
  '20688': require('./images/20688.jpg'),
  '20689': require('./images/20689.jpg'),
  '20690': require('./images/20690.jpg'),
  '20691': require('./images/20691.jpg'),
  '20693': require('./images/20693.jpg'),
  '20694': require('./images/20694.jpg'),
  '20695': require('./images/20695.jpg'),
  '20696': require('./images/20696.jpg'),
  '20697': require('./images/20697.jpg'),
  '20698': require('./images/20698.jpg'),
  '20699': require('./images/20699.jpg'),
  '20700': require('./images/20700.jpg'),
  '20701': require('./images/20701.jpg'),
  '20702': require('./images/20702.jpg'),
  '20703': require('./images/20703.jpg'),
  '20704': require('./images/20704.jpg'),
  '20705': require('./images/20705.jpg'),
  '20706': require('./images/20706.jpg'),
  '20707': require('./images/20707.jpg'),
  '20708': require('./images/20708.jpg'),
  '20709': require('./images/20709.jpg'),
  '20710': require('./images/20710.jpg'),
  '20711': require('./images/20711.jpg'),
  '20712': require('./images/20712.jpg'),
  '20713': require('./images/20713.jpg'),
  '20714': require('./images/20714.jpg'),
  '20715': require('./images/20715.jpg'),
  '20716': require('./images/20716.jpg'),
  '20717': require('./images/20717.jpg'),
  '20718': require('./images/20718.jpg'),
  '20719': require('./images/20719.jpg'),
  '20720': require('./images/20720.jpg'),
  '20721': require('./images/20721.jpg'),
  '20722': require('./images/20722.jpg'),
  '20723': require('./images/20723.jpg'),
  '20724': require('./images/20724.jpg'),
  '20725': require('./images/20725.jpg'),
  '20726': require('./images/20726.jpg'),
  '20727': require('./images/20727.jpg'),
  '20728': require('./images/20728.jpg'),
  '20729': require('./images/20729.jpg'),
  '20730': require('./images/20730.jpg'),
  '20731': require('./images/20731.jpg'),
  '20732': require('./images/20732.jpg'),
  '20733': require('./images/20733.jpg'),
  '20734': require('./images/20734.jpg'),
  '20735': require('./images/20735.jpg'),
  '20736': require('./images/20736.jpg'),
  '20737': require('./images/20737.jpg'),
  '20738': require('./images/20738.jpg'),
  '20739': require('./images/20739.jpg'),
  '20740': require('./images/20740.jpg'),
  '20741': require('./images/20741.jpg'),
  '20742': require('./images/20742.jpg'),
  '20743': require('./images/20743.jpg'),
  '20744': require('./images/20744.jpg'),
  '20745': require('./images/20745.jpg'),
  '20746': require('./images/20746.jpg'),
  '20747': require('./images/20747.jpg'),
  '20748': require('./images/20748.jpg'),
  '20749': require('./images/20749.jpg'),
  '20750': require('./images/20750.jpg'),
  '20751': require('./images/20751.jpg'),
  '20752': require('./images/20752.jpg'),
  '20753': require('./images/20753.jpg'),
  '20754': require('./images/20754.jpg'),
  '20755': require('./images/20755.jpg'),
  '20756': require('./images/20756.jpg'),
  '20757': require('./images/20757.jpg'),
  '20758': require('./images/20758.jpg'),
  '20759': require('./images/20759.jpg'),
  '20760': require('./images/20760.jpg'),
  '20761': require('./images/20761.jpg'),
  '20762': require('./images/20762.jpg'),
  '20763': require('./images/20763.jpg'),
  '20764': require('./images/20764.jpg'),
  '20765': require('./images/20765.jpg'),
  '20766': require('./images/20766.jpg'),
  '20767': require('./images/20767.jpg'),
  '20768': require('./images/20768.jpg'),
  '20769': require('./images/20769.jpg'),
  '20770': require('./images/20770.jpg'),
  '20771': require('./images/20771.jpg'),
  '20772': require('./images/20772.jpg'),
  '20773': require('./images/20773.jpg'),
  '20774': require('./images/20774.jpg'),
  '20775': require('./images/20775.jpg'),
  '20776': require('./images/20776.jpg'),
  '20777': require('./images/20777.jpg'),
  '20778': require('./images/20778.jpg'),
  '20779': require('./images/20779.jpg'),
  '20780': require('./images/20780.jpg'),
  '20781': require('./images/20781.jpg'),
  '20782': require('./images/20782.jpg'),
  '20783': require('./images/20783.jpg'),
  '20784': require('./images/20784.jpg'),
  '20785': require('./images/20785.jpg'),
  '20786': require('./images/20786.jpg'),
  '20787': require('./images/20787.jpg'),
  '20788': require('./images/20788.jpg'),
  '20789': require('./images/20789.jpg'),
  '20790': require('./images/20790.jpg'),
  '20791': require('./images/20791.jpg'),
  '20792': require('./images/20792.jpg'),
  '20793': require('./images/20793.jpg'),
  '20910': require('./images/20910.jpg'),
  '20911': require('./images/20911.jpg'),
  '20925': require('./images/20925.jpg'),
  en_m24_s144_1: require('./images/en_m24_s144_1.jpg'),
  en_m60_s221_140: require('./images/en_m60_s221_140.jpg'),
  es_m2_s1_1: require('./images/es_m2_s1_1.jpg'),
  es_m2_s2_2: require('./images/es_m2_s2_2.jpg'),
  es_m2_s2_3: require('./images/es_m2_s2_3.jpg'),
  es_m2_s3_4: require('./images/es_m2_s3_4.jpg'),
  es_m2_s6_8: require('./images/es_m2_s6_8.jpg'),
  es_m2_s7_5: require('./images/es_m2_s7_5.jpg'),
  es_m2_s7_6: require('./images/es_m2_s7_6.jpg'),
  es_m2_s7_7: require('./images/es_m2_s7_7.jpg'),
  es_m2_s9_9: require('./images/es_m2_s9_9.jpg'),
  es_m4_s15_10: require('./images/es_m4_s15_10.jpg'),
  es_m4_s20_11: require('./images/es_m4_s20_11.jpg'),
  es_m4_s21_12: require('./images/es_m4_s21_12.jpg'),
  es_m4_s21_13: require('./images/es_m4_s21_13.jpg'),
  es_m4_s23_14: require('./images/es_m4_s23_14.jpg'),
  es_m4_s24_15: require('./images/es_m4_s24_15.jpg'),
  es_m4_s25_16: require('./images/es_m4_s25_16.jpg'),
  es_m4_s25_17: require('./images/es_m4_s25_17.jpg'),
  es_m4_s26_18: require('./images/es_m4_s26_18.jpg'),
  es_m4_s28_19: require('./images/es_m4_s28_19.jpg'),
  es_m4_s29_26: require('./images/es_m4_s29_26.jpg'),
  es_m4_s30_27: require('./images/es_m4_s30_27.jpg'),
  es_m4_s30_28: require('./images/es_m4_s30_28.jpg'),
  es_m4_s30_29: require('./images/es_m4_s30_29.jpg'),
  es_m4_s31_30: require('./images/es_m4_s31_30.jpg'),
  es_m4_s33_31: require('./images/es_m4_s33_31.jpg'),
  es_m6_s38_32: require('./images/es_m6_s38_32.jpg'),
  es_m6_s38_33: require('./images/es_m6_s38_33.jpg'),
  es_m6_s39_34: require('./images/es_m6_s39_34.jpg'),
  es_m6_s41_35: require('./images/es_m6_s41_35.jpg'),
  es_m6_s48_36: require('./images/es_m6_s48_36.jpg'),
  es_m6_s49_37: require('./images/es_m6_s49_37.jpg'),
  es_m6_s50_38: require('./images/es_m6_s50_38.jpg'),
  es_m6_s52_39: require('./images/es_m6_s52_39.jpg'),
  es_m9_s64_40: require('./images/es_m9_s64_40.jpg'),
  es_m9_s64_41: require('./images/es_m9_s64_41.jpg'),
  es_m9_s65_42: require('./images/es_m9_s65_42.jpg'),
  es_m9_s67_43: require('./images/es_m9_s67_43.jpg'),
  es_m9_s67_44: require('./images/es_m9_s67_44.jpg'),
  es_m9_s67_45: require('./images/es_m9_s67_45.jpg'),
  es_m9_s69_46: require('./images/es_m9_s69_46.jpg'),
  es_m9_s70_47: require('./images/es_m9_s70_47.jpg'),
  es_m9_s70_48: require('./images/es_m9_s70_48.jpg'),
  es_m9_s70_49: require('./images/es_m9_s70_49.jpg'),
  es_m9_s71_50: require('./images/es_m9_s71_50.jpg'),
  es_m9_s72_51: require('./images/es_m9_s72_51.jpg'),
  es_m9_s74_52: require('./images/es_m9_s74_52.jpg'),
  es_m9_s75_53: require('./images/es_m9_s75_53.jpg'),
  es_m9_s75_54: require('./images/es_m9_s75_54.jpg'),
  es_m9_s75_55: require('./images/es_m9_s75_55.jpg'),
  es_m12_s82_56: require('./images/es_m12_s82_56.jpg'),
  es_m12_s82_57: require('./images/es_m12_s82_57.jpg'),
  es_m12_s82_58: require('./images/es_m12_s82_58.jpg'),
  es_m12_s84_59: require('./images/es_m12_s84_59.jpg'),
  es_m12_s86_60: require('./images/es_m12_s86_60.jpg'),
  es_m12_s87_61: require('./images/es_m12_s87_61.jpg'),
  es_m12_s87_62: require('./images/es_m12_s87_62.jpg'),
  es_m12_s94_63: require('./images/es_m12_s94_63.jpg'),
  es_m12_s94_64: require('./images/es_m12_s94_64.jpg'),
  es_m12_s94_65: require('./images/es_m12_s94_65.jpg'),
  es_m12_s96_66: require('./images/es_m12_s96_66.jpg'),
  es_m12_s101_67: require('./images/es_m12_s101_67.jpg'),
  es_m12_s103_68: require('./images/es_m12_s103_68.jpg'),
  es_m12_s103_69: require('./images/es_m12_s103_69.jpg'),
  es_m12_s103_70: require('./images/es_m12_s103_70.jpg'),
  es_m12_s103_71: require('./images/es_m12_s103_71.jpg'),
  es_m12_s106_72: require('./images/es_m12_s106_72.jpg'),
  es_m18_s108_73: require('./images/es_m18_s108_73.jpg'),
  es_m18_s111_74: require('./images/es_m18_s111_74.jpg'),
  es_m18_s113_75: require('./images/es_m18_s113_75.jpg'),
  es_m18_s114_76: require('./images/es_m18_s114_76.jpg'),
  es_m18_s115_77: require('./images/es_m18_s115_77.jpg'),
  es_m18_s116_377: require('./images/es_m18_s116_377.jpg'),
  es_m18_s119_78: require('./images/es_m18_s119_78.jpg'),
  es_m18_s120_80: require('./images/es_m18_s120_80.jpg'),
  es_m18_s121_79: require('./images/es_m18_s121_79.jpg'),
  es_m18_s123_81: require('./images/es_m18_s123_81.jpg'),
  es_m18_s129_82: require('./images/es_m18_s129_82.jpg'),
  es_m18_s130_83: require('./images/es_m18_s130_83.jpg'),
  es_m24_s135_84: require('./images/es_m24_s135_84.jpg'),
  es_m24_s136_85: require('./images/es_m24_s136_85.jpg'),
  es_m24_s137_86: require('./images/es_m24_s137_86.jpg'),
  es_m24_s144_1: require('./images/es_m24_s144_1.jpg'),
  es_m24_s145_87: require('./images/es_m24_s145_87.jpg'),
  es_m24_s146_88: require('./images/es_m24_s146_88.jpg'),
  es_m24_s146_89: require('./images/es_m24_s146_89.jpg'),
  es_m24_s147_90: require('./images/es_m24_s147_90.jpg'),
  es_m24_s149_91: require('./images/es_m24_s149_91.jpg'),
  es_m24_s150_92: require('./images/es_m24_s150_92.jpg'),
  es_m24_s154_93: require('./images/es_m24_s154_93.jpg'),
  es_m24_s155_94: require('./images/es_m24_s155_94.jpg'),
  es_m24_s157_97: require('./images/es_m24_s157_97.jpg'),
  es_m24_s158_95: require('./images/es_m24_s158_95.jpg'),
  es_m24_s158_96: require('./images/es_m24_s158_96.jpg'),
  es_m24_s159_98: require('./images/es_m24_s159_98.jpg'),
  es_m24_s159_99: require('./images/es_m24_s159_99.jpg'),
  es_m36_s161_100: require('./images/es_m36_s161_100.jpg'),
  es_m36_s161_101: require('./images/es_m36_s161_101.jpg'),
  es_m36_s161_102: require('./images/es_m36_s161_102.jpg'),
  es_m36_s162_103: require('./images/es_m36_s162_103.jpg'),
  es_m36_s164_104: require('./images/es_m36_s164_104.jpg'),
  es_m36_s166_105: require('./images/es_m36_s166_105.jpg'),
  es_m36_s166_106: require('./images/es_m36_s166_106.jpg'),
  es_m36_s166_107: require('./images/es_m36_s166_107.jpg'),
  es_m36_s166_108: require('./images/es_m36_s166_108.jpg'),
  es_m36_s167_109: require('./images/es_m36_s167_109.jpg'),
  es_m36_s169_111: require('./images/es_m36_s169_111.jpg'),
  es_m36_s169_112: require('./images/es_m36_s169_112.jpg'),
  es_m36_s173_113: require('./images/es_m36_s173_113.jpg'),
  es_m36_s178_114: require('./images/es_m36_s178_114.jpg'),
  es_m36_s179_155: require('./images/es_m36_s179_155.jpg'),
  es_m36_s180_116: require('./images/es_m36_s180_116.jpg'),
  es_m36_s182_117: require('./images/es_m36_s182_117.jpg'),
  es_m36_s183_118: require('./images/es_m36_s183_118.jpg'),
  es_m36_s184_119: require('./images/es_m36_s184_119.jpg'),
  es_m36_s185_120: require('./images/es_m36_s185_120.jpg'),
  es_m36_s186_121: require('./images/es_m36_s186_121.jpg'),
  es_m36_s187_122: require('./images/es_m36_s187_122.jpg'),
  es_m36_s188_123: require('./images/es_m36_s188_123.jpg'),
  es_m36_s189_124: require('./images/es_m36_s189_124.jpg'),
  es_m48_s191_125: require('./images/es_m48_s191_125.jpg'),
  es_m48_s194_126: require('./images/es_m48_s194_126.jpg'),
  es_m48_s200_127: require('./images/es_m48_s200_127.jpg'),
  es_m48_s206_128: require('./images/es_m48_s206_128.jpg'),
  es_m48_s207_129: require('./images/es_m48_s207_129.jpg'),
  es_m48_s209_130: require('./images/es_m48_s209_130.jpg'),
  es_m48_s211_131: require('./images/es_m48_s211_131.jpg'),
  es_m48_s212_132: require('./images/es_m48_s212_132.jpg'),
  es_m48_s212_133: require('./images/es_m48_s212_133.jpg'),
  es_m48_s212_134: require('./images/es_m48_s212_134.jpg'),
  es_m48_s213_135: require('./images/es_m48_s213_135.jpg'),
  es_m60_s214_136: require('./images/es_m60_s214_136.jpg'),
  es_m60_s215_137: require('./images/es_m60_s215_137.jpg'),
  es_m60_s220_138: require('./images/es_m60_s220_138.jpg'),
  es_m60_s221_139: require('./images/es_m60_s221_139.jpg'),
  es_m60_s221_140: require('./images/es_m60_s221_140.jpg'),
  es_m60_s225_141: require('./images/es_m60_s225_141.jpg'),
  es_m60_s227_142: require('./images/es_m60_s227_142.jpg'),
  es_m60_s229_143: require('./images/es_m60_s229_143.jpg'),
  es_m60_s233_144: require('./images/es_m60_s233_144.jpg'),
  es_m60_s233_145: require('./images/es_m60_s233_145.jpg'),
  es_m60_s233_146: require('./images/es_m60_s233_146.jpg'),
  es_m60_s233_147: require('./images/es_m60_s233_147.jpg'),
  es_m60_s234_148: require('./images/es_m60_s234_148.jpg'),
  es_m60_s235_149: require('./images/es_m60_s235_149.jpg'),
  es_m60_s236_150: require('./images/es_m60_s236_150.jpg'),
  es_m60_s236_151: require('./images/es_m60_s236_151.jpg'),
  es_m168_s168_110: require('./images/es_m168_s168_110.jpg'),
} as {[key: string]: any};
