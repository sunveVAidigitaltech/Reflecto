/**
 * REFLECTO - CHAPTER STORY DEFINITIONS & CHARACTER DIALOGUES
 * Illustrated friendly cards introducing game mechanics as kids progress.
 */

const REFLECTO_STORIES = {
  1: {
    chapter: 1,
    chapterTitle: "Sunny Start",
    title: "Welcome to Reflecto! ☀️",
    characterName: "Pip the Star",
    characterAvatar: "⭐",
    dialogue: "Hi there, little explorer! I'm Pip! I love taking cozy naps, but it's time to play. Can you tap the bouncy mirrors to shine bright sunshine into my eyes so I can wake up and sparkle?",
    tip: "💡 Tap any mirror or press Flip to bounce the light beam!",
    accentColor: "#F59E0B"
  },
  2: {
    chapter: 2,
    chapterTitle: "Wobbly Walls",
    title: "Toy Wooden Blocks! 🧱",
    characterName: "Barnaby the Block",
    characterAvatar: "🧱",
    dialogue: "Clonk! I'm Barnaby the wooden toy block! Light cannot pass through sturdy wood. You'll need to use your clever mirrors to bounce your beam around me!",
    tip: "💡 Plan your bounce path around wooden blocks to reach the star!",
    accentColor: "#BA8B52"
  },
  3: {
    chapter: 3,
    chapterTitle: "Twin Beams",
    title: "Double the Sunshine! ☀️☀️",
    characterName: "Sunny & Ray",
    characterAvatar: "🔦",
    dialogue: "Double the glow, double the joy! Now there are multiple flashlights and more sleepy star friends. Don't worry—beams pass right through each other without bumping!",
    tip: "💡 Every sleepy star must be illuminated to finish the level!",
    accentColor: "#0284C7"
  },
  4: {
    chapter: 4,
    chapterTitle: "Prism Pals",
    title: "Rainbow Gem Splitters! 💎",
    characterName: "Percy the Prism",
    characterAvatar: "💎",
    dialogue: "Sparkle sparkle! I'm Percy the Rainbow Prism! When your light enters my diamond heart, I magically split it into TWO beams at once! One goes straight, one bounces!",
    tip: "💡 Splitters turn 1 beam into 2 beams to awaken multiple stars!",
    accentColor: "#8B5CF6"
  },
  5: {
    chapter: 5,
    chapterTitle: "Color Magic",
    title: "Jelly Stained Glass! 🍇🍓",
    characterName: "Jelly the Filter",
    characterAvatar: "🌈",
    dialogue: "Yum! Stained-glass jelly tiles! Each star friend has a favorite color. Shine your beam through my jelly tiles to transform its color to match the star's wish!",
    tip: "💡 Colored stars only awaken when illuminated by their matching color!",
    accentColor: "#EC4899"
  },
  6: {
    chapter: 6,
    chapterTitle: "Portal Party",
    title: "Magic Donuts & Grumpy Clouds! 🍩☁️",
    characterName: "Dot the Donut",
    characterAvatar: "🍩",
    dialogue: "Whoosh! Enter my magic donut portal and instantly pop out of the matching letter portal across the board! But watch out for Grumpy Clouds—they hate bright light!",
    tip: "💡 Portals teleport light across the board. Never shine beams into grumpy clouds!",
    accentColor: "#9333EA"
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = REFLECTO_STORIES;
}
