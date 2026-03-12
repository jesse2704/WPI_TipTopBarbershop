import type { Service } from "../types";

export const services: Service[] = [
  {
    id: "classic-cut",
    name: "Classic Cut",
    price: 30,
    duration: 30,
    description: "A timeless haircut tailored to your style.",
  },
  {
    id: "buzz-cut",
    name: "Buzz Cut",
    price: 20,
    duration: 20,
    description: "Clean and sharp all-over clipper cut.",
  },
  {
    id: "beard-trim",
    name: "Beard Trim",
    price: 20,
    duration: 20,
    description: "Precision beard shaping and grooming.",
  },
  {
    id: "hot-towel-shave",
    name: "Hot Towel Shave",
    price: 35,
    duration: 40,
    description: "Luxurious straight-razor shave with hot towels.",
  },
  {
    id: "haircut-and-beard",
    name: "Haircut & Beard Combo",
    price: 45,
    duration: 50,
    description: "Full haircut plus a crisp beard trim.",
  },
  {
    id: "kids-cut",
    name: "Kids Cut",
    price: 20,
    duration: 25,
    description: "A great cut for the young gentlemen (12 & under).",
  },
];
