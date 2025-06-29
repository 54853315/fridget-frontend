export const methods = ["烘培", "蒸", "煮", "炒", "煎", "炸", "烤", "炖", "焖", "拌", "腌"];
export const categories = ["已解冻", "冷冻状态", "调味品", "香料", "乳制品", "水果", "酒/水"];
export const kitchenware = {
  "🍚": "电饭煲",
  "🍳": "炒锅",
  "🔥": "烤箱",
  "🥘": "蒸锅",
  "⚡": "压力锅",
  "📡": "微波炉",
  "🌪️": "空气炸锅",
  "☕": "烧水壶",
  "🥤": "榨汁机",
};
export const choices = ["1人", "2人", "3 人", "4-6人"];

export const spicyChoices = ["免辣", "微辣", "中辣", "超级辣"];

export const vegetarianOptions = [
  { value: "no", label: "不是素食者" },
  { value: "strict", label: "严格素食者" },
  { value: "lactose", label: "乳糖不耐受者" },
  {
    value: "ovo",
    label: "蛋奶素食者（指不吃肉、鱼、家禽）",
  },
  { value: "pescatarian", label: "鱼素者（指不吃红肉和禽类）" },
  {
    value: "flexitarian",
    label: "弹性素食者（卡路里管理）",
  },
];
