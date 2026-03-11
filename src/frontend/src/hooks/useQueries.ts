import { useQuery } from "@tanstack/react-query";
import type { Tool } from "../backend";
import { useActor } from "./useActor";

export function useAllTools() {
  const { actor, isFetching } = useActor();
  return useQuery<Tool[]>({
    queryKey: ["tools"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTools();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}

export function useToolBySlug(slug: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Tool | null>({
    queryKey: ["tool", slug],
    queryFn: async () => {
      if (!actor || !slug) return null;
      try {
        return await actor.getToolBySlug(slug);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useToolsByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Tool[]>({
    queryKey: ["tools", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getToolsByCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
    staleTime: 5 * 60 * 1000,
  });
}
