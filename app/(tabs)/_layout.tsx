import { Tabs } from 'expo-router';
import BottomTabBar from '../../components/BottomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="fav" />
      <Tabs.Screen name="pro" />
    </Tabs>
  );
}
