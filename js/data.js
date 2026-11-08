/* Size data by gestational week.
 * Lengths are approximate: crown-to-rump through week 19, crown-to-heel from week 20.
 * Figures are averages for fun comparison, not medical guidance. */
(function (global) {
  "use strict";

  // week: [length cm, weight g]
  var STATS = {
    4: [0.1, 0], 5: [0.2, 0], 6: [0.5, 0], 7: [1.0, 1], 8: [1.6, 1], 9: [2.3, 2],
    10: [3.1, 4], 11: [4.1, 7], 12: [5.4, 14], 13: [7.4, 23], 14: [8.7, 43],
    15: [10.1, 70], 16: [11.6, 100], 17: [13.0, 140], 18: [14.2, 190], 19: [15.3, 240],
    20: [25.6, 300], 21: [26.7, 360], 22: [27.8, 430], 23: [28.9, 501], 24: [30.0, 600],
    25: [34.6, 660], 26: [35.6, 760], 27: [36.6, 875], 28: [37.6, 1005], 29: [38.6, 1153],
    30: [39.9, 1319], 31: [41.1, 1502], 32: [42.4, 1702], 33: [43.7, 1918], 34: [45.0, 2146],
    35: [46.2, 2383], 36: [47.4, 2622], 37: [48.6, 2859], 38: [49.8, 3083], 39: [50.7, 3288],
    40: [51.2, 3462]
  };

  // Each theme lists [name, emoji] for weeks 4..40 (37 entries).
  var THEMES = {
    fruit: {
      label: "Fruits & Veggies",
      emoji: "🍎",
      items: [
        ["Poppy seed", "🌱"], ["Sesame seed", "🌾"], ["Lentil", "🫘"], ["Blueberry", "🫐"],
        ["Olive", "🫒"], ["Cherry", "🍒"], ["Strawberry", "🍓"], ["Lime", "🍋‍🟩"],
        ["Kiwi", "🥝"], ["Lemon", "🍋"], ["Peach", "🍑"], ["Apple", "🍎"],
        ["Avocado", "🥑"], ["Pear", "🍐"], ["Bell pepper", "🫑"], ["Mango", "🥭"],
        ["Banana", "🍌"], ["Carrot", "🥕"], ["Sweet potato", "🍠"], ["Grapefruit", "🍊"],
        ["Ear of corn", "🌽"], ["Head of broccoli", "🥦"], ["Zucchini", "🥒"], ["Head of lettuce", "🥬"],
        ["Eggplant", "🍆"], ["Butternut squash", "🎃"], ["Coconut", "🥥"], ["Bunch of grapes", "🍇"],
        ["Pineapple", "🍍"], ["Cantaloupe", "🍈"], ["Honeydew melon", "🍈"], ["Bunch of kale", "🥬"],
        ["Romaine lettuce", "🥬"], ["Swiss chard", "🥬"], ["Pumpkin", "🎃"], ["Mini watermelon", "🍉"],
        ["Watermelon", "🍉"]
      ]
    },
    animals: {
      label: "Animals",
      emoji: "🐾",
      items: [
        ["Flea", "🦟"], ["Ant", "🐜"], ["Ladybug", "🐞"], ["Honeybee", "🐝"],
        ["Cricket", "🦗"], ["Snail", "🐌"], ["Butterfly", "🦋"], ["Tree frog", "🐸"],
        ["Mouse", "🐁"], ["Goldfish", "🐠"], ["Hamster", "🐹"], ["Baby chick", "🐤"],
        ["Gecko", "🦎"], ["Hedgehog", "🦔"], ["Chipmunk", "🐿️"], ["Sparrow", "🐦"],
        ["Bat", "🦇"], ["Rat", "🐀"], ["Crab", "🦀"], ["Parrot", "🦜"],
        ["Bunny", "🐇"], ["Owl", "🦉"], ["Skunk", "🦨"], ["Duck", "🦆"],
        ["Kitten", "🐈"], ["Hen", "🐔"], ["Turtle", "🐢"], ["Penguin", "🐧"],
        ["Raccoon", "🦝"], ["Octopus", "🐙"], ["Fox kit", "🦊"], ["Koala", "🐨"],
        ["Beaver", "🦫"], ["Otter", "🦦"], ["Lamb", "🐑"], ["Puppy", "🐶"],
        ["Seal pup", "🦭"]
      ]
    },
    sweets: {
      label: "Sweet Treats",
      emoji: "🧁",
      items: [
        ["Sprinkle", "✨"], ["Sugar crystal", "🧂"], ["Chocolate chip", "🍫"], ["Jelly bean", "🫘"],
        ["Gumdrop", "🍬"], ["Mochi ball", "🍡"], ["Cherry cordial", "🍒"], ["Fortune cookie", "🥠"],
        ["Lollipop", "🍭"], ["Mini cupcake", "🧁"], ["Cookie", "🍪"], ["Donut", "🍩"],
        ["Ice cream cone", "🍦"], ["Soft pretzel", "🥨"], ["Croissant", "🥐"], ["Slice of cake", "🍰"],
        ["Chocolate bar", "🍫"], ["Churro", "🥖"], ["Waffle", "🧇"], ["Flan", "🍮"],
        ["Honey pot", "🍯"], ["Pancake stack", "🥞"], ["Popcorn bucket", "🍿"], ["Pie", "🥧"],
        ["Birthday cake", "🎂"], ["Shaved ice", "🍧"], ["Gingerbread house", "🏠"], ["Ice cream sundae", "🍨"],
        ["Box of chocolates", "🎁"], ["Candy jar", "🍬"], ["Bundt cake", "🍩"], ["Cookie cake", "🍪"],
        ["Cotton candy", "🍭"], ["Jumbo candy cane", "🍬"], ["Pavlova", "🍰"], ["Giant gingerbread man", "🍪"],
        ["Wedding cake", "💒"]
      ]
    },
    toys: {
      label: "Toys & Sports",
      emoji: "⚽",
      items: [
        ["Speck of glitter", "✨"], ["Bead", "📿"], ["Pushpin", "📌"], ["Button", "🔘"],
        ["Die", "🎲"], ["Marble", "🔮"], ["Chess pawn", "♟️"], ["Golf ball", "⛳"],
        ["Ping-pong ball", "🏓"], ["Building brick", "🧱"], ["Tennis ball", "🎾"], ["Baseball", "⚾"],
        ["Toy car", "🚗"], ["Hockey puck", "🏒"], ["Softball", "🥎"], ["Yo-yo", "🪀"],
        ["Juggling pin", "🤹"], ["Nesting doll", "🪆"], ["Frisbee", "🥏"], ["Volleyball", "🏐"],
        ["Soccer ball", "⚽"], ["Basketball", "🏀"], ["Football", "🏈"], ["Rugby ball", "🏉"],
        ["Game controller", "🎮"], ["Boxing glove", "🥊"], ["Roller skate", "🛼"], ["Bowling ball", "🎳"],
        ["Kite", "🪁"], ["Trumpet", "🎺"], ["Violin", "🎻"], ["Teddy bear", "🧸"],
        ["Badminton racket", "🏸"], ["Accordion", "🪗"], ["Banjo", "🪕"], ["Skateboard", "🛹"],
        ["Piñata", "🪅"]
      ]
    }
  };

  var FIRST_WEEK = 4, LAST_WEEK = 40;

  function sizeForWeek(themeKey, week) {
    var theme = THEMES[themeKey] || THEMES.fruit;
    if (week < FIRST_WEEK) return null;
    var w = Math.min(week, LAST_WEEK);
    var item = theme.items[w - FIRST_WEEK];
    var s = STATS[w];
    return { week: w, name: item[0], emoji: item[1], lengthCm: s[0], weightG: s[1] };
  }

  global.BabyData = { THEMES: THEMES, STATS: STATS, FIRST_WEEK: FIRST_WEEK, LAST_WEEK: LAST_WEEK, sizeForWeek: sizeForWeek };
})(typeof window !== "undefined" ? window : globalThis);
