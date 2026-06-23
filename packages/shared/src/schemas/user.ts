import { z } from 'zod';

/**
 * User — the local account. In MVP this is a single local user with a UUID
 * `id`; post-R3 the id becomes the Discord snowflake (`discordId`). The
 * field name stays `id` so MVP exports stay byte-compatible with the
 * post-OAuth schema (OUTLINE §4 / MVP §6).
 */
export const userSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof userSchema>;
