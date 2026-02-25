// src/data/portfolio.ts

export const PORTFOLIO_DATA = {
  personal: {
    name: "KRISHNABHARATHI",
    lastName: "SAKTHIVEL",
    role: "Full Stack Developer",
    roleAlt: ["Full Stack Developer","Java Developer", "React Native Dev", "Spring Boot Dev"],
    tagline: "Crafting Scalable Digital Experiences",
    email: "krishnabharathisakthivel@gmail.com",
    phone: "7708654719",
    location: "Tiruchirappalli, Tamil Nadu 621209",
    linkedin: "https://www.linkedin.com/in/krishnabharathi12",
    github: "https://github.com/krishnabharathisakthivel",
    website: "https://www.yaazhtech.com",
    profileImage: require('../../assets/images/profile.jpeg'),
  },

  skills: [
    { name: "React Native", level: 78, category: "Frontend", color: "#61DAFB", icon: "📱" },
    { name: "Spring Boot", level: 85, category: "Backend", color: "#6DB33F", icon: "🌱" },
    { name: "Java", level: 90, category: "Backend", color: "#F89820", icon: "☕" },
    { name: "React.js", level: 82, category: "Frontend", color: "#61DAFB", icon: "⚛️" },
    { name: "REST APIs", level: 88, category: "Backend", color: "#7F5AF0", icon: "🔌" },
    { name: "PostgreSQL", level: 68, category: "Database", color: "#336791", icon: "🐘" },
    { name: "DynamoDB", level: 75, category: "Database", color: "#4053D6", icon: "⚡" },
    { name: "Git", level: 85, category: "Tools", color: "#F05032", icon: "🔀" },
    { name: "Android Studio", level: 75, category: "Tools", color: "#F05032", icon: "📱" },
    { name: "IntelliJ IDEA", level: 88, category: "Tools", color: "#F05032", icon: "🔀" },
    { name: "VS Code", level: 86, category: "Tools", color: "#F05032", icon: "🔀" },
    { name: "MySQL", level: 70, category: "Database", color: "#4479A1", icon: "💾" },
    { name: "JavaScript", level: 60, category: "Frontend", color: "#F7DF1E", icon: "🟨" },
  ],

  experience: [
    {
      id: "exp1",
      role: "Full Stack Developer Intern",
      company: "Yaazhtech",
      duration: "6 Months",
      period: "2025",
      type: "Internship",
      website: "https://www.yaazhtech.com",
      description: "Developed a full-stack E-Learning application with React Native + Spring Boot",
      highlights: [
        "Worked on 2+ client-based full-stack projects using React Native and Spring Boot, contributing across the complete development lifecycle from requirement analysis to deployment, while participating in client meetings to gather requirements and deliver business-aligned technical solutions.",
        "Designed and implemented 20+ secure RESTful APIs with JWT-based authentication, built admin dashboards for content and user management, and integrated cloud databases including DynamoDB to ensure scalable and efficient data handling.",
        "Implemented AI-powered features by integrating external AI APIs to dynamically generate learning content from prompts, process responses, and store structured data into databases, along with backend automation workflows such as scheduled weekly assessments and automated email notification systems.",
        "Optimized application performance and user experience through improved API response times, responsive UI enhancements, modular architecture, and clean coding practices, ensuring maintainable and production-ready scalable applications.",
      ],
      tech: ["React Native", "Spring Boot", "JWT", "REST APIs", "DynamoDB","AI Integration","AWS Cloud"],
      screenshots: [
        require('../../assets/images/y1.png'),
        require('../../assets/images/y2.png'),
        require('../../assets/images/y3.png'),
        require('../../assets/images/y4.png'),
        require('../../assets/images/y5.png'),
        require('../../assets/images/y6.png'),
        require('../../assets/images/y7.png'),
      ],
    },
    
  ],

  projects: [
    {
      id: "proj1",
      title: "E-Learning Platform",
      subtitle: "Yaazhtech Internship",
      description: "Full-stack E-Learning application with course management, quizzes, and admin dashboard",
      tech: ["React Native", "Spring Boot", "JWT", "MySQL"],
      website: "https://www.yaazhtech.com/content-categories",
      github: "https://github.com/krishnabharathisakthivel",
      color: "#7F5AF0",
      screenshots: [
        require('../../assets/images/y1.png'),
        require('../../assets/images/y2.png'),
        require('../../assets/images/y3.png'),
      ],
    },
    {
      id: "proj2",
      title: "Word Found Gaming App",
      subtitle: "Mobile Game",
      description: "Cross-platform mobile gaming app with JWT auth, leaderboard and multiple game modes",
      tech: ["React Native", "Spring Boot", "DynamoDB", "REST APIs"],
      website: "https://learntamil.yaazhtech.com",
      github: "https://github.com/krishnabharathisakthivel",
      color: "#2CB67D",
      screenshots: [
        require('../../assets/images/g1.png'),
        require('../../assets/images/g2.png'),
        require('../../assets/images/g3.png'),
      ],
    },
  ],

  education: [
    {
      id: "edu1",
      degree: "Master of Computer Applications",
      institution: "Muthayammal Engineering College",
      university: "Anna University",
      period: "2023 – 2025",
      score: "82%",
      icon: "🎓",
    },
    {
      id: "edu2",
      degree: "Bachelor of Science – Mathematics",
      institution: "Bishop Heber College",
      university: "Bharathidasan University",
      period: "2020 – 2023",
      score: "78%",
      icon: "📐",
    },
  ],

  certifications: [
    { name: "Java & C", issuer: "T4TEQ Software Solutions", icon: "☕" },
    { name: "Python", issuer: "GUVI", icon: "🐍" },
    { name: "Cloud Computing & Cyber Security", issuer: "NPTEL", icon: "☁️" },
  ],

  stats: [
    { label: "REST APIs Built", value: 20, suffix: "+" },
    { label: "Projects Completed", value: 3, suffix: "" },
    { label: "Months Experience", value: 6, suffix: "" },
    { label: "Tech Skills", value: 12, suffix: "" },
  ],
};
