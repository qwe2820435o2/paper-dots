export type StickerCategory =
  | 'hot'
  | 'smileys'
  | 'kittens'
  | 'puppies'
  | 'capybara'
  | 'marine'
  | 'plants';

export interface StickerDef {
  id: string;
  category: StickerCategory;
  imageUrl: string;
  label: string;
}

export interface PlacedSticker {
  uid: string; // unique instance id
  stickerId: string; // references StickerDef.id
  x: number; // absolute canvas px
  y: number; // absolute canvas px
  scale: number; // 1.0 = default
  rotation: number; // degrees
}

export const STICKER_CATEGORIES: { key: StickerCategory; label: string }[] = [
  { key: 'hot',      label: 'Hot' },
  { key: 'smileys',  label: 'Smileys' },
  { key: 'kittens',  label: 'Kittens' },
  { key: 'puppies',  label: 'Puppies' },
  { key: 'capybara', label: 'Capybara' },
  { key: 'marine',   label: 'Marine Life' },
  { key: 'plants',   label: 'Plants & Nature' },
];

type RegularCategory = Exclude<StickerCategory, 'hot'>;

const CATEGORY_FOLDERS: Record<RegularCategory, string> = {
  smileys:  'Smileys',
  kittens:  'Kittens',
  puppies:  'Puppies',
  capybara: 'Capybara',
  marine:   'Marine Life, Reptiles',
  plants:   'Plants & Nature',
};

const STICKER_FILES: Record<RegularCategory, string[]> = {
  smileys: [
    'grinning-blob-smiley-face.png',
    'laughing-blob-smiley-face.png',
    'winking-blob-smiley-face.png',
    'kissing-blob-smiley-face-with-closed-eyes.png',
    'smirking-blob-smiley-face.png',
    'unamused-blob-smiley-face.png',
    'blob-smiley-face-with-rolling-eyes.png',
    'persevering-blob-smiley-face.png',
    'dizzy-blob-smiley-face.png',
    'sleeping-blob-smiley-face.png',
    'yawning-blob-smiley-face.png',
    'nerd-blob-smiley-face.png',
    'blob-smiley-face-with-thermometer.png',
    'smiling-face-with-horns.png',
    'ghost.png',
  ],
  kittens: [
    'pleading-hungry-kitten.png',
    'cat-holding-heart.png',
    'blob-cat-kissy-face.png',
    'blob-cat-kissy-face-with-closed-eyes.png',
    'blob-cat-with-smirking-face.png',
    'blob-cat-angry-face.png',
    'blob-cat-fearful.png',
    'blob-cat-being-petted.png',
    'a-baby-cat-with-hearts-on-head.png',
    'angry-cat-with-hammer.png',
    'black-cat-wearing-sunglasses.png',
    'cat-with-sunglasses.png',
    'cat-with-hat-and-lollipop.png',
    'cat-holding-follower-sign.png',
    'excited-black-and-white-cat.png',
    'weary-cat.png',
    'blue-kawaii-cat.png',
    'unicorn-cat.png',
    'girl-in-cat-costume.png',
  ],
  puppies: [
    'golden-retriever-smiling.png',
    'happy-samoyed.png',
    'corgi-dog-with-sunglasses.png',
    'labrador-dog-with-hearts.png',
    'a-cute-pomeranian.png',
    'circular-white-pomeranian-dog-wearing-a-pink-bow.png',
    'australian-shepherd.png',
    'boston-terrier.png',
    'pitbull-boxer-mix.png',
    'cute-cartoon-puppy.png',
    'golden-retriever.png',
    'dog-face-3d.png',
    'dog-face-flat.png',
    'brown-dog-face-flat.png',
    'golden-retriever-face-flat.png',
    'dog-with-cat.png',
    'dog-with-ma-foi-text.png',
  ],
  capybara: [
    'capybara-partying.png',
    'capybara-wearing-sunglasses.png',
    'capybara-wearing-glasses.png',
    'capybara-wearing-cowboy-hat.png',
    'capybara-wearing-a-cowboy-hat-riding-a-trex.png',
    'capybara-surfing.png',
    'capybara-sticking-out-tongue.png',
    'king-capybara-with-mustache.png',
    'sleeping-capybara-with-zzz-symbol.png',
    'can-you-make-a-brown-capybara-wereing-a-bright-red.png',
  ],
  marine: [
    'frog-with-sunglasses.png',
    'a-fat-seal-with-a-top-hat-and-mustash.png',
    'seal.png',
    'shark.png',
    'spouting-whale.png',
    'blowfish.png',
    'blowfish-3d.png',
    'shrimp.png',
    'turtle.png',
    'frog.png',
    'crocodile.png',
    'anime-snake.png',
  ],
  plants: [
    'sunflower.png',
    'four-leaf-clover.png',
    'blossom.png',
    'flower.png',
    'blue-colored-shamrock.png',
    'brown-mushroom.png',
    'cactus.png',
    'deciduous-tree.png',
    'deciduous-tree-outlined.png',
    'evergreen-tree.png',
    'palm-tree.png',
    'honeybee.png',
    'honeybee-outlined.png',
    'lady-beetle.png',
    'snail.png',
    'snail-purple.png',
  ],
};

const HOT_STICKER_REFS: Array<{ category: RegularCategory; file: string }> = [
  { category: 'smileys',  file: 'grinning-blob-smiley-face.png' },
  { category: 'smileys',  file: 'laughing-blob-smiley-face.png' },
  { category: 'smileys',  file: 'ghost.png' },
  { category: 'kittens',  file: 'pleading-hungry-kitten.png' },
  { category: 'kittens',  file: 'cat-holding-heart.png' },
  { category: 'kittens',  file: 'blob-cat-kissy-face.png' },
  { category: 'puppies',  file: 'golden-retriever-smiling.png' },
  { category: 'puppies',  file: 'happy-samoyed.png' },
  { category: 'puppies',  file: 'corgi-dog-with-sunglasses.png' },
  { category: 'capybara', file: 'capybara-partying.png' },
  { category: 'capybara', file: 'capybara-wearing-sunglasses.png' },
  { category: 'marine',   file: 'frog-with-sunglasses.png' },
  { category: 'marine',   file: 'a-fat-seal-with-a-top-hat-and-mustash.png' },
  { category: 'plants',   file: 'sunflower.png' },
  { category: 'plants',   file: 'four-leaf-clover.png' },
];

const hotStickers: StickerDef[] = HOT_STICKER_REFS.map(({ category, file }) => ({
  id: `hot/${file.replace('.png', '')}`,
  category: 'hot',
  imageUrl: `/stickers/${CATEGORY_FOLDERS[category]}/${file}`,
  label: file.replace('.png', ''),
}));

const regularStickers: StickerDef[] = (
  Object.entries(STICKER_FILES) as [RegularCategory, string[]][]
).flatMap(([key, files]) =>
  files.map((filename) => {
    const name = filename.replace('.png', '');
    return {
      id: `${key}/${name}`,
      category: key,
      imageUrl: `/stickers/${CATEGORY_FOLDERS[key]}/${filename}`,
      label: name,
    };
  })
);

export const STICKERS: StickerDef[] = [...hotStickers, ...regularStickers];

export function getStickerDef(id: string): StickerDef | undefined {
  return STICKERS.find((s) => s.id === id);
}
