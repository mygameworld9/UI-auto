
import React from 'react';
import { Container } from './Container';
import { Typography } from './Typography';
import { Button } from './Button';
import { Hero } from './Hero';
import { Card } from './Card';
import { StatCard } from './StatCard';
import { Progress } from './Progress';
import { Alert } from './Alert';
import { Avatar } from './Avatar';
import { Input } from './Input';
import { Separator } from './Separator';
import { Badge } from './Badge';
import { Accordion } from './Accordion';
import { ImageComponent } from './Image';
import { BentoContainer, BentoCard } from './BentoGrid';
import { Kanban } from './Kanban';

// Lazy load heavy components to optimize bundle size and TTI
const ChartComponent = React.lazy(() => import('./Chart').then(module => ({ default: module.ChartComponent })));
const MapWidget = React.lazy(() => import('./Map').then(module => ({ default: module.MapWidget })));
const Table = React.lazy(() => import('./Table').then(module => ({ default: module.Table })));

/* -------------------------------------------------------------------------- */
/*                            COMPONENT REGISTRY MAP                          */
/* -------------------------------------------------------------------------- */
export const ComponentRegistry: Record<string, React.FC<any>> = {
  container: Container,
  card: Card,
  separator: Separator,
  hero: Hero,
  accordion: Accordion,
  
  text: Typography,
  button: Button,
  input: Input,
  badge: Badge,
  avatar: Avatar,
  alert: Alert,
  
  stat: StatCard,
  progress: Progress,
  image: ImageComponent,
  
  // New Complex Components
  bento_container: BentoContainer,
  bento_card: BentoCard,
  kanban: Kanban,

  // Lazy Components
  chart: ChartComponent,
  table: Table,
  map: MapWidget
};
