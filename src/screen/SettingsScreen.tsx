// import React, { useEffect, useState } from "react";
// import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
// import { useTranslation } from "react-i18next";
// import { router } from "expo-router";
// import { getGameProgress, getWordFindLevel } from "../utils/storage";
// import {
//   getMusicSetting,
//   getSoundSetting,
//   saveMusicSetting,
//   saveSoundSetting
// } from "../services/soundService";

// export default function SettingsScreen() {
//   const [userStats, setUserStats] = useState({
//     coins: 0,
//     crosswordLevel: 0,
//     wordFindLevel: 0,
//     username: ""
//   });
//   const [musicEnabled, setMusicEnabled] = useState(true);
//   const [soundEnabled, setSoundEnabled] = useState(true);

//   const { t, i18n } = useTranslation();
//   const handleLogout = async () => {
//     try {
//       await logout();
//       router.replace('/');
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };
//   const changeLanguage = (lang: string) => {
//     i18n.changeLanguage(lang);
//   };
// useEffect(() => {
//   const load = async () => {
//     setMusicEnabled(await getMusicSetting());
//     setSoundEnabled(await getSoundSetting());
//   };
//   load();
// }, []);

//   useEffect(() => {
//     loadUserStats();
//   }, [user]);

//   const loadUserStats = async () => {
//     try {
//       // Get game progress for crossword
//       const gameProgress = await getGameProgress();
      
//       // Get word find level separately
//       const wordFindLevel = await getWordFindLevel();
      
//       console.log("Settings - Loaded stats:", {
//         user: user,
//         gameProgress: gameProgress,
//         wordFindLevel: wordFindLevel
//       });
      
//       // Determine which level to display
//       let displayCrosswordLevel = 1;
//       let displayWordFindLevel = 1;
      
//       // For crossword level (0-based to 1-based)
//       if (user?.level !== undefined) {
//         displayCrosswordLevel = Math.max(user.level, 1);
//       } else if (gameProgress.level !== undefined) {
//         displayCrosswordLevel = Math.max(gameProgress.level + 1, 1);
//       }
      
//       // For word find level (0-based to 1-based)
//       displayWordFindLevel = Math.max(wordFindLevel + 1, 1);
      
//       // Determine coins
//       const displayCoins = user?.coin ?? gameProgress.coins ?? 0;
      
//       // Get username
//       const username = user?.username || user?.email || "Guest";
      
//       setUserStats({
//         coins: displayCoins,
//         crosswordLevel: displayCrosswordLevel,
//         wordFindLevel: displayWordFindLevel,
//         username: username
//       });
//     } catch (error) {
//       console.error("Error loading user stats:", error);
//       setUserStats({
//         coins: user?.coin ?? 0,
//         crosswordLevel: user?.level ?? 1,
//         wordFindLevel: 1,
//         username: user?.username || user?.email || "Guest"
//       });
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* User Info Section */}
//       {/* <View style={styles.userSection}>
//         <View style={styles.userAvatar}>
//           <Text style={styles.avatarText}>
//             {userStats.username.charAt(0).toUpperCase()}
//           </Text>
//         </View>
//         <Text style={styles.userName}>{userStats.username}</Text>
//         <Text style={styles.userStatus}>
//           {user ? "Logged In" : "Playing as Guest"}
//         </Text>
//       </View> */}

//       <Text style={styles.title}>⚙️ {t("Settings") || "Settings"}</Text>
//          {/* Account Section */}
//       {user ? (
//         <View style={styles.accountContainer}>
//           <Text style={styles.sectionTitle}>Account</Text>
//           <View style={styles.accountInfo}>
//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Email:</Text>
//               <Text style={styles.infoValue}>{user.email}</Text>
//             </View>
//             {user.username && (
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Username:</Text>
//                 <Text style={styles.infoValue}>{user.username}</Text>
//               </View>
//             )}
//           </View>
//         </View>
//       ) : (
//         <View style={styles.guestContainer}>
//           <Text style={styles.sectionTitle}>Guest Mode</Text>
//           <Text style={styles.guestText}>
//             You are playing as a guest. Sign up to save your progress across devices!
//           </Text>
//           <TouchableOpacity 
//             style={styles.signupButton}
//             onPress={() => router.push("/signup")}
//           >
//             <Text style={styles.signupButtonText}>Create Account</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//       {/* User Stats */}
//       <View style={styles.statsContainer}>
//         <View style={styles.statBox}>
//           <Text style={styles.statLabel}>💰 {t("Coins") || "Coins"}</Text>
//           <Text style={styles.statValue}>{userStats.coins}</Text>
//         </View>
//         {/* <View style={styles.statBox}>
//           <Text style={styles.statLabel}>🎯 Crossword</Text>
//           <Text style={styles.statValue}>Level {userStats.crosswordLevel}</Text>
//         </View> */}
//         <View style={styles.statBox}>
//           <Text style={styles.statLabel}>🔍 Word Find</Text>
//           <Text style={styles.statValue}>Level {userStats.wordFindLevel}</Text>
//         </View>
//       </View>
//           <Text style={styles.sectionTitle}>🔊 Audio</Text>

// <View style={styles.switchRow}>
//   <Text style={styles.switchLabel}>Music</Text>
//   <Switch
//     value={musicEnabled}
//     onValueChange={async (v) => {
//       setMusicEnabled(v);
//       await saveMusicSetting(v);
//     }}
//   />
// </View>

// <View style={styles.switchRow}>
//   <Text style={styles.switchLabel}>Sound Effects</Text>
//   <Switch
//     value={soundEnabled}
//     onValueChange={async (v) => {
//       setSoundEnabled(v);
//       await saveSoundSetting(v);
//     }}
//   />
// </View>

      

//       {/* Language Selection */}
//       <Text style={[styles.sectionTitle, { marginTop: 30 }]}>{t("Language") || "Language"}</Text>
//       <View style={styles.languageContainer}>
//         <TouchableOpacity 
//           style={[styles.langButton, i18n.language === 'en' && styles.activeLang]} 
//           onPress={() => changeLanguage("en")}
//         >
//           <Text style={styles.langText}>English</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[styles.langButton, i18n.language === 'ta' && styles.activeLang]} 
//           onPress={() => changeLanguage("ta")}
//         >
//           <Text style={styles.langText}>தமிழ்</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[styles.langButton, i18n.language === 'fr' && styles.activeLang]} 
//           onPress={() => changeLanguage("fr")}
//         >
//           <Text style={styles.langText}>Français</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[styles.langButton, i18n.language === 'de' && styles.activeLang]} 
//           onPress={() => changeLanguage("de")}
//         >
//           <Text style={styles.langText}>Deutsch</Text>
//         </TouchableOpacity>
//       </View>

     
  
//       {/* About Section */}
//       <View style={styles.aboutContainer}>
//         <Text style={styles.aboutTitle}>About Tamil Word Game</Text>
//         <Text style={styles.aboutText}>
//           A fun and educational game to learn Tamil words through crossword puzzles and word find games.
//           Complete levels, earn coins, and improve your Tamil vocabulary!
//         </Text>
//         <Text style={styles.versionText}>Version 1.0.0</Text>
//       </View>
//       {/* Navigation Buttons */}
//       <View style={styles.buttonsContainer}>
//         {/* <TouchableOpacity style={styles.button} onPress={() => router.push("/profile")}>
//           <Text style={styles.buttonText}>👤 {t("Profile") || "Profile"}</Text>
//         </TouchableOpacity> */}

//         {/* <TouchableOpacity style={styles.button} onPress={() => router.push("/game")}>
//           <Text style={styles.buttonText}>🎮 {t("Play Crossword") || "Play Crossword"}</Text>
//         </TouchableOpacity> */}

//         {/* <TouchableOpacity style={styles.button} onPress={() => router.push("/wordfind")}>
//           <Text style={styles.buttonText}>🔍 {t("Play Word Find") || "Play Word Find"}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.button} onPress={() => router.push("/")}>
//           <Text style={styles.buttonText}>🏠 {t("Home") || "Home"}</Text>
//         </TouchableOpacity> */}
//       </View>
//       {user ? (
//               <View >
//                 {/* <View style={styles.avatar}>
//                   <Text style={styles.avatarText}>
//                     {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
//                   </Text>
//                 </View>
                
//                 <Text style={styles.username}>{user.username || 'User'}</Text>
//                 <Text style={styles.email}>{user.email}</Text>
                
//                 <View style={styles.statsContainer}>
//                   <View style={styles.statItem}>
//                     <Text style={styles.statValue}>{progress.coins || 0}</Text>
//                     <Text style={styles.statLabel}>Coins</Text>
//                   </View> */}
//                   {/* <View style={styles.statItem}>
//                     <Text style={styles.statValue}>{progress.level || 1}</Text>
//                     <Text style={styles.statLabel}>Crossword Level</Text>
//                   </View> */}
//                   {/* <View style={styles.statItem}>
//                     <Text style={styles.statValue}>
//                       {progress.wordFindLevel || 0}
//                     </Text>
//                     <Text style={styles.statLabel}>WordFind Level</Text>
//                   </View>
//                 </View> */}
                
//                 {/* <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
//                   <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
//                 </TouchableOpacity> */}
      
//                 {/* <TouchableOpacity style={styles.wordFindButton} onPress={() => router.push('/wordfind')}>
//                   <Text style={styles.wordFindButtonText}>🔍 Word Find Game</Text>
//                 </TouchableOpacity> */}
                
//                 {/* <TouchableOpacity style={styles.gameButton} onPress={() => router.push('/game')}>
//                   <Text style={styles.gameButtonText}>🎮 Crossword Game</Text>
//                 </TouchableOpacity> */}
                
//                 <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//                   <Text style={styles.logoutButtonText}>🚪 Logout</Text>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <View >
//                               </View>
//             )}
//       <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//         <Text style={styles.backButtonText}>← Back</Text>
//       </TouchableOpacity>
      
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: "#f2f2f7",
//     alignItems: "center",
//     flexGrow: 1,
//   },
//   userSection: {
//     alignItems: "center",
//     marginBottom: 20,
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 20,
//     width: "100%",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   logoutButton: {
//     backgroundColor: "#FF3B30",
//     paddingVertical: 15,
//     paddingHorizontal: 30,
//     borderRadius: 25,
//     width: "100%",
//     alignItems: "center",
//   },
//   logoutButtonText: {
//     color: "#fff",   },
//   switchRow: {
//   flexDirection: "row",
//   justifyContent: "space-between",
//   alignItems: "center",
//   backgroundColor: "#fff",
//   padding: 15,
//   borderRadius: 12,
//   marginBottom: 10,
//   width: "100%",
// },

// switchLabel: {
//   fontSize: 16,
//   fontWeight: "600",
// },

//   userAvatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "#6200EE",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   avatarText: {
//     fontSize: 28,
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   userName: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 5,
//   },
//   userStatus: {
//     fontSize: 14,
//     color: "#666",
//     fontStyle: "italic",
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     marginBottom: 20,
//     color: "#111",
//   },
//   statsContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-around",
//     width: "100%",
//     marginBottom: 30,
//   },
//   statBox: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 15,
//     alignItems: "center",
//     width: "30%",
//     marginBottom: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: "#555",
//     marginBottom: 5,
//     textAlign: "center",
//   },
//   statValue: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#111",
//     textAlign: "center",
//   },
//   buttonsContainer: {
//     width: "100%",
//     marginTop: 10,
//   },
//   button: {
//     backgroundColor: "#4a90e2",
//     paddingVertical: 15,
//     borderRadius: 12,
//     marginVertical: 6,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: "#111",
//     marginBottom: 15,
//     alignSelf: "flex-start",
//     width: "100%",
//   },
//   languageContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "center",
//     marginBottom: 30,
//     width: "100%",
//   },
//   langButton: {
//     backgroundColor: "#fff",
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     margin: 5,
//     borderRadius: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 3,
//     minWidth: 100,
//   },
//   activeLang: {
//     backgroundColor: "#4CAF50",
//   },
//   langText: {
//     fontSize: 16,
//     color: "#111",
//     fontWeight: "500",
//     textAlign: "center",
//   },
//   accountContainer: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 15,
//     width: "100%",
//     marginTop: 20,
//     marginBottom: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   accountInfo: {
//     marginTop: 10,
//   },
//   infoRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f0f0f0",
//   },
//   infoLabel: {
//     fontSize: 14,
//     color: "#666",
//     fontWeight: "500",
//   },
//   infoValue: {
//     fontSize: 14,
//     color: "#333",
//     fontWeight: "400",
//   },
//   guestContainer: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 15,
//     width: "100%",
//     marginTop: 20,
//     marginBottom: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 3,
//     alignItems: "center",
//   },
//   guestText: {
//     fontSize: 14,
//     color: "#666",
//     textAlign: "center",
//     marginBottom: 15,
//     lineHeight: 20,
//   },
//   signupButton: {
//     backgroundColor: "#34C759",
//     paddingVertical: 12,
//     paddingHorizontal: 30,
//     borderRadius: 25,
//     alignItems: "center",
//   },
//   signupButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   aboutContainer: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 15,
//     width: "100%",
//     marginTop: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   aboutTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 10,
//   },
//   aboutText: {
//     fontSize: 14,
//     color: "#666",
//     lineHeight: 20,
//     marginBottom: 10,
//   },
//   versionText: {
//     fontSize: 12,
//     color: "#999",
//     fontStyle: "italic",
//   },
//   backButton: {
//     paddingVertical: 15,
//     paddingHorizontal: 30,
//     borderRadius: 25,
//     marginTop: 30,
//     marginBottom: 20,
//   },
//   backButtonText: {
//     color: "#007AFF",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });

// function logout() {
//   throw new Error("Function not implemented.");
// }
