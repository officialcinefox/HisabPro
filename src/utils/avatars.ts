import { ImageSourcePropType } from 'react-native';

export interface AvatarOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  source: ImageSourcePropType;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'male1',
    name: 'Abhishek (Default)',
    gender: 'male',
    source: require('../../assets/avatars/male1.png'),
  },
  {
    id: 'male2',
    name: 'Merchant Bro',
    gender: 'male',
    source: require('../../assets/avatars/male2.png'),
  },
  {
    id: 'female1',
    name: 'Pooja',
    gender: 'female',
    source: require('../../assets/avatars/female1.png'),
  },
  {
    id: 'female2',
    name: 'Ananya',
    gender: 'female',
    source: require('../../assets/avatars/female2.png'),
  },
];

export const getAvatarSource = (avatarId?: string | null): ImageSourcePropType => {
  if (!avatarId) return AVATAR_OPTIONS[0].source;
  const found = AVATAR_OPTIONS.find((a) => a.id === avatarId);
  return found ? found.source : AVATAR_OPTIONS[0].source;
};
