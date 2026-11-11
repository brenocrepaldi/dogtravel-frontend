export type DogSize = "small" | "medium" | "large" | "giant";

export type DogGender = "male" | "female";

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  age: number;
  size: DogSize;
  gender: DogGender;
  photoUrl?: string;
  notes?: string;
}
