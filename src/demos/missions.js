/**
 * Missions: small goals on a simulator page, each one a single idea from its
 * lesson. Demos dispatch a bubbling `demo-op` event with what the learner just
 * did ({ op, ... }); a mission is done when `done(detail)` is true, `times`
 * times (default 1).
 */
export const missions = {
  'array-ops': [
    { id: 'read', en: 'Read any value by its index.', bn: 'ইনডেক্স দিয়ে যেকোনো একটা মান পড়ো।',
      hint: { en: 'One jump, no scan: O(1).', bn: 'এক লাফে, খোঁজা ছাড়া: O(1)।' },
      done: (d) => d.op === 'read' },
    { id: 'front', en: 'Insert at the front (index 0).', bn: 'একদম সামনে (ইনডেক্স 0) যোগ করো।',
      hint: { en: 'Count the teal cells: every value moved.', bn: 'সবুজাভ ঘরগুলো গোনো: সব মান সরেছে।' },
      done: (d) => d.op === 'insert' && d.index === 0 },
    { id: 'free', en: 'Add a value without moving a single one.', bn: 'একটাও মান না সরিয়ে একটা মান যোগ করো।',
      hint: { en: 'Where is there already an empty slot?', bn: 'কোথায় আগে থেকেই খালি ঘর আছে?' },
      done: (d) => (d.op === 'append' || d.op === 'insert') && d.moved === 0 },
    { id: 'delete', en: 'Delete the first value.', bn: 'প্রথম মানটা মোছো।',
      hint: { en: 'Everything after it slides left.', bn: 'এর পরের সবাই বামে সরে আসে।' },
      done: (d) => d.op === 'delete' && d.index === 0 },
  ],
  'binary-search': [
    { id: 'search', en: 'Run a search and count the checks.', bn: 'একটা সার্চ চালাও আর কয়টি চেক লাগল গোনো।',
      hint: { en: 'Compare it with a left-to-right scan.', bn: 'বাম থেকে ডানে খোঁজার সাথে তুলনা করো।' },
      done: (d) => d.op === 'search' },
    { id: 'missing', en: 'Search for a value that is not in the list.', bn: 'তালিকায় নেই এমন একটা মান খোঁজো।',
      hint: { en: 'Watch lo pass hi.', bn: 'দেখো lo কখন hi-কে পেরিয়ে যায়।' },
      done: (d) => d.op === 'search' && !d.found },
    { id: 'quick', en: 'Find a value in 2 checks or fewer.', bn: '২টি বা তার কম চেকে একটা মান খুঁজে বের করো।',
      hint: { en: 'Which index does the first check look at?', bn: 'প্রথম চেকে কোন ইনডেক্স দেখা হয়?' },
      done: (d) => d.op === 'search' && d.found && d.checks <= 2 },
    { id: 'predict', en: 'Turn on "Predict first" and guess 3 steps right.', bn: '"আগে আন্দাজ করো" চালু করে ৩টি ধাপ ঠিক আন্দাজ করো।',
      hint: { en: 'mid = (lo + hi) // 2', bn: 'mid = (lo + hi) // 2' },
      times: 3, done: (d) => d.op === 'predict' && d.right },
  ],
};
