
import { z } from "zod";

// ----------------------------------------------------------------------
// HELPER SCHEMAS
// ----------------------------------------------------------------------

// Action Schema for buttons, clickable areas, etc.
const ActionSchema = z.object({
  type: z.string(),
  payload: z.any().optional(),
  path: z.string().optional(),
});

// Recursive definition wrapper
// We use z.lazy because UINode contains UINodes (children)
export const UINodeSchema: z.ZodType<any> = z.lazy(() => 
  z.union([
    ContainerNode,
    HeroNode,
    TextNode,
    ButtonNode,
    CardNode,
    TableNode,
    StatNode,
    ProgressNode,
    AlertNode,
    AvatarNode,
    ChartNode,
    AccordionNode,
    ImageNode,
    MapNode,
    InputNode,
    BadgeNode,
    SeparatorNode,
    // Fallback for completely unknown nodes to prevent crash, 
    // but specific schemas above take precedence.
    z.record(z.string(), z.any()) 
  ])
);

// ----------------------------------------------------------------------
// COMPONENT PROPS SCHEMAS
// ----------------------------------------------------------------------

const NodeArray = z.array(UINodeSchema).optional().default([]);

// 1. Container
const ContainerProps = z.object({
  layout: z.string().optional(), // Loose validation to allow Component defaults
  gap: z.string().optional(),
  padding: z.boolean().optional(),
  background: z.string().optional(),
  bgImage: z.string().optional(),
  className: z.string().optional(),
  children: NodeArray,
});
const ContainerNode = z.object({ container: ContainerProps });

// 2. Hero
const HeroProps = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  gradient: z.string().optional(),
  align: z.string().optional(),
  children: NodeArray,
});
const HeroNode = z.object({ hero: HeroProps });

// 3. Text
const TextProps = z.object({
  content: z.string().optional().default(""), // Allow empty, but ensure string
  variant: z.string().optional(),
  color: z.string().optional(),
  font: z.string().optional(),
});
const TextNode = z.object({ text: TextProps });

// 4. Button
const ButtonProps = z.object({
  label: z.string().optional(),
  variant: z.string().optional(),
  icon: z.string().optional(),
  action: ActionSchema.optional(),
});
const ButtonNode = z.object({ button: ButtonProps });

// 5. Card
const CardProps = z.object({
  title: z.string().optional(),
  variant: z.string().optional(),
  children: NodeArray,
});
const CardNode = z.object({ card: CardProps });

// 6. Table
// Row can be a string, number, or a nested UI Node (e.g. Badge inside table)
const TableCell = z.union([z.string(), z.number(), UINodeSchema, z.null()]);
const TableProps = z.object({
  headers: z.array(z.string()).optional(),
  rows: z.array(z.array(TableCell)).optional(),
});
const TableNode = z.object({ table: TableProps });

// 7. Stat
const StatProps = z.object({
  label: z.string().optional(),
  value: z.string().optional(),
  trend: z.string().optional(),
  trendDirection: z.enum(['UP', 'DOWN', 'NEUTRAL']).optional(),
});
const StatNode = z.object({ stat: StatProps });

// 8. Progress
const ProgressProps = z.object({
  label: z.string().optional(),
  value: z.number().optional().default(0),
  color: z.string().optional(),
});
const ProgressNode = z.object({ progress: ProgressProps });

// 9. Alert
const AlertProps = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  variant: z.string().optional(),
});
const AlertNode = z.object({ alert: AlertProps });

// 10. Avatar
const AvatarProps = z.object({
  initials: z.string().optional(),
  src: z.string().optional(),
  status: z.string().optional(),
});
const AvatarNode = z.object({ avatar: AvatarProps });

// 11. Chart
const ChartDataPoint = z.object({
  name: z.string(),
  value: z.number(),
});
const ChartProps = z.object({
  title: z.string().optional(),
  type: z.string().optional(),
  color: z.string().optional(),
  data: z.array(ChartDataPoint).optional().default([]),
});
const ChartNode = z.object({ chart: ChartProps });

// 12. Accordion
const AccordionItem = z.object({
  title: z.string(),
  content: NodeArray,
});
const AccordionProps = z.object({
  variant: z.string().optional(),
  items: z.array(AccordionItem).optional().default([]),
});
const AccordionNode = z.object({ accordion: AccordionProps });

// 13. Image
const ImageProps = z.object({
  src: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  aspectRatio: z.string().optional(),
});
const ImageNode = z.object({ image: ImageProps });

// 14. Map
const MapMarker = z.object({
  title: z.string(),
  lat: z.number(),
  lng: z.number(),
});
const MapProps = z.object({
  label: z.string().optional(),
  defaultZoom: z.number().optional(),
  style: z.string().optional(),
  markers: z.array(MapMarker).optional().default([]),
});
const MapNode = z.object({ map: MapProps });

// 15. Input
const InputProps = z.object({
  label: z.string().optional(),
  placeholder: z.string().optional(),
  inputType: z.string().optional(),
});
const InputNode = z.object({ input: InputProps });

// 16. Badge
const BadgeProps = z.object({
  label: z.string().optional(),
  color: z.string().optional(),
});
const BadgeNode = z.object({ badge: BadgeProps });

// 17. Separator (Empty object allowed)
const SeparatorNode = z.object({ separator: z.object({}).optional() });


// ----------------------------------------------------------------------
// EXPORTED VALIDATOR
// ----------------------------------------------------------------------

export const validateNode = (node: any) => {
  // During streaming, node might be undefined or null
  if (!node) return null;

  const result = UINodeSchema.safeParse(node);
  
  if (result.success) {
    return result.data;
  } else {
    // In strict mode, we return null if schema doesn't match.
    // This prevents rendering malformed or "half-baked" nodes during the stream.
    // e.g. { "chart": { "data": [ ... ] } } is valid
    // but { "chart": { "data": "oops" } } is invalid and won't render.
    // console.warn("Validation Failed:", result.error); 
    return null;
  }
};