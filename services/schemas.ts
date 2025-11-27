import { z } from "zod";

// Recursive schema definition Helper
// We need this because UINode -> Component -> Children -> UINode
const baseNodeSchema = z.record(z.string(), z.any());

export const UINodeSchema: z.ZodType<any> = z.lazy(() => 
  z.record(z.string(), z.any()) // Allow loose structure for now, but ensure it's an object
    .refine((data) => {
      // Must have exactly one key
      const keys = Object.keys(data);
      return keys.length > 0;
    }, { message: "Node must have at least one component key" })
);

// We can define stricter schemas per component if needed, 
// but for the Stream, we primarily need to ensure it's a valid Object
// and not a half-baked string.

export const validateNode = (node: any) => {
  const result = UINodeSchema.safeParse(node);
  return result.success ? result.data : null;
};