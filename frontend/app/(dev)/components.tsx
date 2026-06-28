import Button from "@/components/common/Button";
import ChatInput from "@/components/common/chat/ChatInput";
import ChatDrawer from "@/components/common/chat/ChatDrawer";
import ChatHeader from "@/components/common/chat/ChatHeader";
import ChatBubble from "@/components/common/chat/ChatBubble";
import IconButton from "@/components/common/IconButton";
import LanguageCard from "@/components/common/LanguageCard";
import Spinner from "@/components/common/Spinner";
import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ComponentsGallery() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleMenuPress = () => {
    setDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
  };

  const handleNewChat = () => {
    setDrawerVisible(false);
    Alert.alert("새로운 대화", "새 채팅이 시작됩니다.");
  };

  const handleLanguageChange = () => {
    setDrawerVisible(false);
    Alert.alert("언어 변경", "언어 선택 화면이 열립니다.");
  };

  const handleChatHistory = () => {
    setDrawerVisible(false);
    Alert.alert("대화 내역", "이전 대화로 이동합니다.");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>예시 컴포넌트</Text>

      {/* 임시용 라우터 */}
      <View style={[styles.section, { gap: SPACING.MEDIUM }]}>
        <Link href="/(main)/chat">메인 화면으로 이동</Link>
        <Link href="/(main)/chat/[id]">메인 화면으로 이동</Link>
        <Link href="/(onboarding)">온보딩 화면으로 이동</Link>
        <Link href="/(onboarding)/login">로그인 화면으로 이동</Link>
        <Link href="/language">설정 화면으로 이동</Link>
      </View>

      {/* ChatHeader & Drawer 컴포넌트 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ChatHeader & Drawer</Text>
        <ChatHeader onMenuPress={handleMenuPress} />
        <Text style={styles.subTitle}>
          우상단 메뉴 버튼을 클릭해서 Drawer를 테스트해보세요!
        </Text>
      </View>

      {/* ChatInput 컴포넌트 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ChatInput</Text>
        <ChatInput />
      </View>

      {/* LanguageCard 컴포넌트 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LanguageCard</Text>
        <View
          style={[
            styles.section,
            { flexDirection: "row", gap: SPACING.MEDIUM, flexWrap: "wrap" },
          ]}
        >
          <LanguageCard
            countryCode="KR"
            languageName="한국어"
            isSelected={false}
          />
          <LanguageCard
            countryCode="US"
            languageName="영어"
            isSelected={true}
          />
          <LanguageCard
            countryCode="KH"
            languageName="캄보디아어"
            isSelected={false}
          />
          <LanguageCard
            countryCode="VN"
            languageName="베트남어"
            isSelected={false}
          />
          <LanguageCard
            countryCode="NP"
            languageName="네팔어"
            isSelected={false}
          />
        </View>
      </View>

      {/* chat bubble 컴포넌트 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ChatBubble</Text>
        <View style={styles.chatContainer}>
          <ChatBubble role="user" text="안전모를 착용해야 하나요?" />
          <ChatBubble
            role="assistant"
            text="네, 작업 현장에서는 반드시 안전모를 착용해야 합니다. 낙하물로부터 머리를 보호하기 위해 필수적입니다."
          />
          <ChatBubble role="user" text="화학물질 취급할 때 주의사항은?" />
          <ChatBubble
            role="assistant"
            text="화학물질 취급 시에는 보호장갑, 보호안경, 마스크를 착용하고 환기가 잘 되는 곳에서 작업하세요. MSDS(물질안전보건자료)를 꼭 확인하시기 바랍니다."
          />
          <ChatBubble
            role="user"
            text="에러 테스트"
            userError="네트워크 연결을 확인해주세요"
          />
          <ChatBubble
            role="assistant"
            text="서버 연결 실패"
            assistantError="응답 생성 중 오류 발생"
          />
          <ChatBubble
            role="assistant"
            text="서버 연결 실패"
            assistantError="응답 생성 중 오류 발생"
            onRetry={() => console.log("Retry clicked")}
          />
        </View>
      </View>

      {/* Button 컴포넌트들 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Button</Text>
        <View style={styles.buttonRow}>
          <Button
            label="Primary"
            onPress={() => console.log("Primary clicked")}
          />
        </View>
        <View style={styles.buttonRow}>
          <Button
            label="Tertiary"
            variant="tertiary"
            onPress={() => console.log("Tertiary clicked")}
          />
        </View>
        <View style={styles.buttonRow}>
          <Button
            label="Outline"
            variant="outline"
            onPress={() => console.log("Outline clicked")}
          />
        </View>
        <View style={styles.buttonRow}>
          <Button
            label="Blue Filled"
            variant="blueFilled"
            onPress={() => console.log("Blue Filled clicked")}
          />
        </View>
        <View style={styles.buttonRow}>
          <Button
            label="Blue Outline"
            variant="blueOutline"
            onPress={() => console.log("Blue Outline clicked")}
          />
        </View>
      </View>

      {/* Size 변형 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Button Sizes</Text>
        <View style={styles.buttonRow}>
          <Button
            label="Small"
            size="small"
            onPress={() => console.log("Small clicked")}
          />
        </View>
        <View style={styles.buttonRow}>
          <Button
            label="Medium"
            size="medium"
            onPress={() => console.log("Medium clicked")}
          />
        </View>
        <View style={styles.buttonRow}>
          <Button
            label="Large"
            size="large"
            onPress={() => console.log("Large clicked")}
          />
        </View>
      </View>

      {/* State 변형 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Button States</Text>
        <View style={styles.buttonRow}>
          <Button
            label="Disabled"
            disabled
            onPress={() => console.log("Disabled clicked")}
          />
        </View>
      </View>

      {/* Icon Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Icon Buttons</Text>
        <Text style={styles.subTitle}>아이콘 + 텍스트 (Drawer 메뉴용)</Text>
        <View style={styles.buttonRow}>
          <Button
            label="대시보드"
            icon={
              <Ionicons name="grid-outline" size={20} color={COLORS.BLACK} />
            }
            iconPosition="left"
            variant="tertiary"
            onPress={() => console.log("Dashboard clicked")}
          />
        </View>
        <View style={styles.buttonRow}>
          <Button
            label="설정"
            icon={
              <Ionicons
                name="settings-outline"
                size={20}
                color={COLORS.BLACK}
              />
            }
            iconPosition="left"
            variant="outline"
            onPress={() => console.log("Settings clicked")}
          />
        </View>
      </View>

      {/* IconButton 컴포넌트들 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>IconButton (아이콘 전용)</Text>
        <Text style={styles.subTitle}>No Shape</Text>
        <View style={styles.buttonRow}>
          <IconButton
            icon={<Ionicons name="attach" size={32} color={COLORS.BLACK} />}
            backgroundColor="transparent"
            onPress={() => console.log("Attach clicked")}
          />
        </View>
        <Text style={styles.subTitle}>Square Shape</Text>
        <View
          style={[
            styles.buttonRow,
            { flexDirection: "row", gap: SPACING.MEDIUM },
          ]}
        >
          <IconButton
            icon={<Ionicons name="attach" size={16} color={COLORS.BLACK} />}
            size="small"
            backgroundColor="transparent"
            borderColor={COLORS.BLACK}
            borderWidth={1}
            shape="square"
            onPress={() => console.log("Attach clicked")}
          />
          <IconButton
            icon={<Ionicons name="send" size={20} color={COLORS.WHITE} />}
            size="medium"
            backgroundColor={COLORS.BLACK}
            shape="square"
            onPress={() => console.log("Send clicked")}
          />
          <IconButton
            icon={<Ionicons name="close" size={24} color={COLORS.BLACK} />}
            size="large"
            backgroundColor={COLORS.LIGHT_GRAY}
            shape="square"
            onPress={() => console.log("Close clicked")}
          />
        </View>

        <Text style={styles.subTitle}>Circle Shape</Text>
        <View
          style={[
            styles.buttonRow,
            { flexDirection: "row", gap: SPACING.MEDIUM },
          ]}
        >
          <IconButton
            icon={
              <Ionicons name="menu-outline" size={16} color={COLORS.BLACK} />
            }
            size="small"
            backgroundColor="transparent"
            borderColor={COLORS.BLACK}
            borderWidth={1}
            shape="circle"
            onPress={() => console.log("Menu small clicked")}
          />
          <IconButton
            icon={<Ionicons name="heart" size={20} color={COLORS.WHITE} />}
            size="medium"
            backgroundColor={COLORS.BLACK}
            shape="circle"
            onPress={() => console.log("Heart clicked")}
          />
          <IconButton
            icon={
              <Ionicons name="settings" size={24} color={COLORS.MOEL_BLUE} />
            }
            size="large"
            backgroundColor="transparent"
            borderColor={COLORS.MOEL_BLUE}
            borderWidth={2}
            shape="circle"
            onPress={() => console.log("Settings clicked")}
          />
        </View>

        <Text style={styles.subTitle}>Disabled States</Text>
        <View
          style={[
            styles.buttonRow,
            { flexDirection: "row", gap: SPACING.MEDIUM },
          ]}
        >
          <IconButton
            icon={<Ionicons name="trash" size={20} color={COLORS.LIGHT_GRAY} />}
            size="medium"
            backgroundColor={COLORS.BLACK}
            disabled
            onPress={() => console.log("Disabled clicked")}
          />
        </View>
      </View>

      {/* Spinner 컴포넌트들 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spinner (로딩 인디케이터)</Text>

        <Text style={styles.subTitle}>배경색 자동 감지</Text>
        <View
          style={[
            styles.buttonRow,
            { flexDirection: "row", gap: SPACING.LARGE, alignItems: "center" },
          ]}
        >
          {/* 밝은 배경 */}
          <View
            style={{
              backgroundColor: COLORS.WHITE,
              padding: SPACING.LARGE,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: COLORS.LIGHT_GRAY,
            }}
          >
            <Spinner backgroundColor={COLORS.WHITE} />
          </View>

          {/* 어두운 배경 */}
          <View
            style={{
              backgroundColor: COLORS.BLACK,
              padding: SPACING.LARGE,
              borderRadius: 8,
            }}
          >
            <Spinner backgroundColor={COLORS.BLACK} />
          </View>

          {/* 파란 배경 */}
          <View
            style={{
              backgroundColor: COLORS.MOEL_BLUE,
              padding: SPACING.LARGE,
              borderRadius: 8,
            }}
          >
            <Spinner backgroundColor={COLORS.MOEL_BLUE} />
          </View>

          {/* 투명 배경 */}
          <View
            style={{
              padding: SPACING.LARGE,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: COLORS.LIGHT_GRAY,
            }}
          >
            <Spinner backgroundColor="transparent" />
          </View>
        </View>

        <Text style={styles.subTitle}>직접 색상 지정</Text>
        <View
          style={[
            styles.buttonRow,
            { flexDirection: "row", gap: SPACING.LARGE, alignItems: "center" },
          ]}
        >
          <Spinner backgroundColor={COLORS.BLACK} color={COLORS.BLACK} />
        </View>

        <Text style={styles.subTitle}>크기 변형</Text>
        <View
          style={[
            styles.buttonRow,
            { flexDirection: "row", gap: SPACING.LARGE, alignItems: "center" },
          ]}
        >
          <Spinner
            size="small"
            backgroundColor={COLORS.MOEL_BLUE}
            color={COLORS.MOEL_BLUE}
          />
          <Spinner
            size={30}
            backgroundColor={COLORS.GREEN}
            color={COLORS.GREEN}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>버튼 예시(다른 요소와 함께)</Text>
        <View
          style={{
            flexDirection: "row",
            gap: SPACING.MEDIUM,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text>버튼</Text>
          <Button
            label="Primary"
            size="small"
            onPress={() => console.log("Primary clicked")}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>개발용 컴포넌트 갤러리</Text>
      </View>

      {/* ChatDrawer - 테스트용 */}
      <ChatDrawer
        visible={drawerVisible}
        onClose={handleDrawerClose}
        onNewChat={handleNewChat}
        onLanguageChange={handleLanguageChange}
        onChatHistory={handleChatHistory}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  content: {
    padding: SPACING.LARGE,
    paddingTop: 60, // Safe area top
  },
  title: {
    fontSize: FONT_SIZES.H2,
    fontWeight: "bold",
    color: COLORS.BLACK,
    textAlign: "center",
    marginBottom: SPACING.XL,
  },
  section: {
    marginBottom: SPACING.XL,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.H3,
    fontWeight: "600",
    marginBottom: SPACING.LARGE,
    color: COLORS.MOEL_BLUE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
    paddingBottom: SPACING.SMALL,
  },
  chatContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: SPACING.MEDIUM,
    minHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },
  subTitle: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: "500",
    color: COLORS.MOEL_DARK_GRAY,
    marginBottom: SPACING.MEDIUM,
    marginTop: SPACING.MEDIUM,
  },
  buttonRow: {
    marginBottom: SPACING.MEDIUM,
  },
  footer: {
    marginTop: SPACING.XL,
    paddingTop: SPACING.LARGE,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
    alignItems: "center",
  },
  footerText: {
    fontSize: FONT_SIZES.CAPTION,
    color: COLORS.MOEL_DARK_GRAY,
    fontStyle: "italic",
  },
});
