interface Task {
  id: number
  title: string
  description?: string
}

interface Category {
  title: string
  tasks: Task[]
}

export interface Column {
  categories: Category[]
  mainTitle?: string
  description?: string
}

export const roadmapData: Column = {
  mainTitle: "Roadmap",
  description: "A visual representation of the project's progress.",
  categories: [
    {
      title: "Considering",
      tasks: [
        {
          id: 1,
          title: "Design Landing Page",
          description: "Create the initial design for the landing page.",
        },
        {
          id: 2,
          title: "Setup Analytics",
          description: "Integrate Google Analytics into the website.",
        },
        {
          id: 3,
          title: "Design Landing Page",
          description: "Create the initial design for the landing page.",
        },
      ],
    },
    {
      title: "Planned",
      tasks: [
        {
          id: 4,
          title: "Design Landing Page",
          description: "Create the initial design for the landing page.",
        },
        {
          id: 5,
          title: "Setup Analytics",
          description: "Integrate Google Analytics into the website.",
        },
        {
          id: 6,
          title: "Design Landing Page",
          description: "Create the initial design for the landing page.",
        },
        {
          id: 7,
          title: "Setup Analytics",
          description: "Integrate Google Analytics into the website.",
        },
        {
          id: 8,
          title: "Design Landing Page",
          description: "Create the initial design for the landing page.",
        },
        {
          id: 9,
          title: "Setup Analytics",
          description: "Integrate Google Analytics into the website.",
        },
      ],
    },
    {
      title: "Working On",
      tasks: [
        {
          id: 10,
          title: "Develop Authentication",
          description: "Implement user login and registration flows.",
        },
        {
          id: 11,
          title: "Optimize Performance",
          description: "Improve load times and optimize performance.",
        },
      ],
    },
    {
      title: "Implemented",
      tasks: [
        {
          id: 12,
          title: "Homepage Design",
          description: "Complete homepage design and deploy.",
        },
        {
          id: 13,
          title: "User Login",
          description: "Secure user login implemented.",
        },
        {
          id: 14,
          title: "Homepage Design",
          description: "Complete homepage design and deploy.",
        },
        {
          id: 15,
          title: "User Login",
          description: "Secure user login implemented.",
        },
        {
          id: 16,
          title: "Homepage Design",
          description: "Complete homepage design and deploy.",
        },
        {
          id: 17,
          title: "User Login",
          description: "Secure user login implemented.",
        },
        {
          id: 18,
          title: "Homepage Design",
          description: "Complete homepage design and deploy.",
        },
        {
          id: 19,
          title: "User Login",
          description: "Secure user login implemented.",
        },
      ],
    },
  ],
}
