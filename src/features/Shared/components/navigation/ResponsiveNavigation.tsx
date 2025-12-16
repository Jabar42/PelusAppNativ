import React from 'react';
import { useWindowDimensions } from 'react-native';
import Sidebar from './Sidebar';
import MobileMenu from './MobileMenu';

interface ResponsiveNavigationProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export default function ResponsiveNavigation({
  state,
  descriptors,
  navigation,
}: ResponsiveNavigationProps) {
  const { width } = useWindowDimensions();
  
  // Breakpoint: md = 768px
  // Si width > 768px, mostrar Sidebar, sino MobileMenu
  const isLargeScreen = width > 768;

  if (isLargeScreen) {
    return <Sidebar state={state} descriptors={descriptors} navigation={navigation} />;
  }

  return <MobileMenu state={state} descriptors={descriptors} navigation={navigation} />;
}


