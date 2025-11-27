import React from 'react';
import { Container } from './Container';
import { Typography } from './Typography';
import { Button } from './Button';
import { Hero } from './Hero';
import { Card } from './Card';
import { Table } from './Table';
import { StatCard } from './StatCard';
import { Progress } from './Progress';
import { Alert } from './Alert';
import { Avatar } from './Avatar';
import { ChartComponent } from './Chart';
import { Input } from './Input';
import { Separator } from './Separator';
import { Badge } from './Badge';
import { Accordion } from './Accordion';
import { ImageComponent } from './Image';
import { MapWidget } from './Map';

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
  chart: ChartComponent,
  table: Table,
  progress: Progress,
  
  image: ImageComponent,
  map: MapWidget
};
