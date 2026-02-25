// app/projects.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../src/theme/ThemeContext";

const { width } = Dimensions.get("window");
const isDesktop = width > 900;

// Mobile image width = screen width - horizontal padding (24*2) - card padding (22*2) - border (1*2)
const MOBILE_IMAGE_WIDTH = width - 48 - 44 - 2;

const projects = [
  {
    id: "proj1",
    title: "E-Learning Platform",
    subtitle: "Yaazhtech Internship",
    description:
      "Developed a scalable full-stack E-Learning mobile application using React Native for the frontend and Spring Boot for the backend, enabling seamless course delivery and student engagement. Designed and implemented 20+ secure RESTful APIs for course management, user enrollment, assessments, progress tracking, and administrative operations following industry best practices. Built a comprehensive Admin Dashboard with features for content upload, quiz creation, student performance monitoring, and course lifecycle management to improve operational efficiency. Integrated frontend and backend modules with secure authentication and authorization mechanisms, ensuring protected user access and data integrity across the platform. Implemented AI-powered functionality by integrating external AI APIs to dynamically generate learning content based on user prompts, process responses, and persist structured learning data into the database for efficient retrieval and analytics. Designed backend logic to automatically fetch relevant educational content from AI services, validate responses, and store processed data securely in the database to support personalized learning workflows. Developed an automated weekly assessment workflow, including scheduled evaluation logic, progress calculation, and automated email notification system for sending performance reports to students. Optimized application performance by improving API response time, reducing load latency, and enhancing UI responsiveness for better user experience across devices. Followed clean architecture principles, modular coding standards, and version control practices to ensure maintainability and scalability of the application.",
    tech: ["React Native", "Spring Boot", "JWT", "DynamoDB", "REST APIs"],
    website: "https://www.yaazhtech.com/content-categories",
    github: "https://github.com/krishnabharathisakthivel",
    color: "#7F5AF0",
    screenshots: [
      require("../assets/images/y6.png"),
      require("../assets/images/y7.png"),
      require("../assets/images/y1.png"),
    ],
  },
  {
    id: "proj2",
    title: "Word Found Gaming App",
    subtitle: "Mobile Game",
    description:
      "Developed a cross-platform mobile gaming application using React Native, delivering a highly responsive user interface with smooth animations and optimized rendering performance across Android devices. Implemented secure user authentication and session management using JWT-based authorization, ensuring protected access control and reliable user identity management. Designed and developed scalable RESTful APIs using Spring Boot to handle core game functionalities, including scoring algorithms, leaderboard management, player progress tracking, and reward distribution. Integrated Amazon DynamoDB for efficient NoSQL data storage, enabling fast retrieval of user profiles, game progress, and leaderboard data while maintaining scalability for concurrent users. Architected multiple engaging game modes with real-time state management, dynamic difficulty adjustments, level progression systems, and reward mechanisms to improve user retention and engagement. Enhanced overall user experience by integrating interactive sound effects, background music, and performance optimizations that reduced latency and improved gameplay responsiveness. Applied modular architecture, reusable component design, and clean coding practices to ensure maintainability and future scalability of the application.",
    tech: ["React Native", "Spring Boot", "PostgreSQL", "REST APIs"],
    website: "https://learntamil.yaazhtech.com",
    github: "https://github.com/krishnabharathisakthivel",
    color: "#2CB67D",
    screenshots: [
      require("../assets/images/g1.png"),
      require("../assets/images/g2.png"),
      require("../assets/images/g3.png"),
    ],
  },
];

const ProjectCard = ({ project, index, colors }: any) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);

  const imageOpacity = useSharedValue(1);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Card entrance animation
  useEffect(() => {
    opacity.value = withDelay(index * 200, withTiming(1, { duration: 600 }));
    translateY.value = withDelay(index * 200, withSpring(0));
  }, []);

  // Auto image slider
  useEffect(() => {
    if (!project.screenshots || project.screenshots.length <= 1) return;

    const interval = setInterval(() => {
      imageOpacity.value = withTiming(0, { duration: 400 }, () => {
        runOnJS(setCurrentIndex)(
          (prev: number) =>
            prev === project.screenshots.length - 1 ? 0 : prev + 1
        );
        imageOpacity.value = withTiming(1, { duration: 400 });
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          flexDirection: isDesktop ? "row" : "column",
        },
        animatedStyle,
      ]}
    >
      {/* Gradient glow */}
      <LinearGradient
        colors={[`${project.color}15`, "transparent"]}
        style={StyleSheet.absoluteFill}
      />

      {/* LEFT SIDE */}
      <View style={[styles.left, isDesktop ? { flex: 1 } : {}]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {project.title}
        </Text>

        <Text style={[styles.subtitle, { color: project.color }]}>
          {project.subtitle}
        </Text>

        {/* Tech */}
        <View style={styles.techRow}>
          {project.tech.map((t: string) => (
            <View
              key={t}
              style={[
                styles.techTag,
                {
                  backgroundColor: `${project.color}15`,
                  borderColor: `${project.color}40`,
                },
              ]}
            >
              <Text style={[styles.techText, { color: project.color }]}>
                {t}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          {project.description}
        </Text>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <Pressable
            onPress={() => Linking.openURL(project.website)}
            style={[styles.btn, { backgroundColor: project.color }]}
          >
            <Text style={styles.btnText}>Live Demo</Text>
          </Pressable>
        </View>
      </View>

      {/* RIGHT SIDE IMAGE (AUTO CHANGING) */}
      <View style={[styles.right, isDesktop ? { flex: 1 } : {}]}>
        <Animated.Image
          source={project.screenshots[currentIndex]}
          style={[
            styles.image,
            imageAnimatedStyle,
            isDesktop
              ? { width: 680, height: 420 }
              : { width: MOBILE_IMAGE_WIDTH, height: MOBILE_IMAGE_WIDTH * 0.65 },
          ]}
          resizeMode="cover"
        />
      </View>
    </Animated.View>
  );
};

export default function ProjectsScreen() {
  const { colors, isDark } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      {/* Background Gradient */}
      <LinearGradient
        colors={
          isDark
            ? ["#0D0D0D", "#1A100A", "#0D0D0D"]
            : ["#F5F5F7", "#FFF8EE", "#F5F5F7"]
        }
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Featured Projects
        </Text>

        <Text style={[styles.subtitleTop, { color: colors.textMuted }]}>
          Selected works & technical builds
        </Text>

        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            colors={colors}
          />
        ))}

        <View />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 60,
    paddingHorizontal: 24,
    gap: 40,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitleTop: {
    textAlign: "center",
    fontSize: 13,
    marginBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 22,
    gap: 20,
    overflow: "hidden",
  },
  left: {
    justifyContent: "center",
    gap: 10,
  },
  right: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  desc: {
    fontSize: 13,
    lineHeight: 20,
  },
  techRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  techTag: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  techText: {
    fontSize: 11,
    fontWeight: "700",
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  btnOutline: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  btnOutlineText: {
    fontWeight: "700",
    fontSize: 12,
  },
  image: {
    borderRadius: 6,
  },
});
