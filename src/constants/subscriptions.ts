type SubType = {
  name: string
  description: string
}
//NOTE: Organizer? Organization?
export const SUB_TYPES: SubType[] = [
  {
    name: "artist",
    description: "Artist",
  },
  {
    name: "organizer",
    description: "Project Organizer",
  },
  {
    name: "judge",
    description: "Judge",
  },
  {
    name: "guest",
    description:
      "Default account type before filling out form; Deletes in 24 hours",
  },
  {
    name: "admin",
    description: "Administrator",
  },
]
