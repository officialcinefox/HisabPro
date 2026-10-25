import { ImageSourcePropType } from 'react-native';

export interface AvatarOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  category: '3d' | 'illustrated';
  source: ImageSourcePropType;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'abhishek',
    name: 'Abhishek (Default)',
    gender: 'male',
    category: '3d',
    source: require('../../assets/avatars/abhishek.png'),
  },
  {
    id: 'male1',
    name: '3D Bro',
    gender: 'male',
    category: '3d',
    source: require('../../assets/avatars/male1.png'),
  },
  {
    id: 'male2',
    name: '3D Merchant',
    gender: 'male',
    category: '3d',
    source: require('../../assets/avatars/male2.png'),
  },
  {
    id: 'female1',
    name: 'Pooja (3D)',
    gender: 'female',
    category: '3d',
    source: require('../../assets/avatars/female1.png'),
  },
  {
    id: 'female2',
    name: 'Ananya (3D)',
    gender: 'female',
    category: '3d',
    source: require('../../assets/avatars/female2.png'),
  },
  {
    id: 'male_rohan',
    name: 'Rohan',
    gender: 'male',
    category: 'illustrated',
    source: require('../../assets/avatars/male_rohan.png'),
  },
  {
    id: 'male_vikram',
    name: 'Vikram',
    gender: 'male',
    category: 'illustrated',
    source: require('../../assets/avatars/male_vikram.png'),
  },
  {
    id: 'female_priya',
    name: 'Priya',
    gender: 'female',
    category: 'illustrated',
    source: require('../../assets/avatars/female_priya.png'),
  },
  {
    id: 'female_sneha',
    name: 'Sneha',
    gender: 'female',
    category: 'illustrated',
    source: require('../../assets/avatars/female_sneha.png'),
  },
];

export const getAvatarSource = (avatarId?: string | null): ImageSourcePropType => {
  if (!avatarId) return AVATAR_OPTIONS[0].source;
  const found = AVATAR_OPTIONS.find((a) => a.id === avatarId);
  return found ? found.source : AVATAR_OPTIONS[0].source;
};
