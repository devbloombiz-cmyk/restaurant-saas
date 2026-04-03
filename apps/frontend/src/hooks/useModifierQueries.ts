import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createModifier, deleteModifier, fetchModifiers, updateModifier } from "@/services/modifierService";

export function useModifiersQuery() {
  return useQuery({ queryKey: ["modifiers"], queryFn: fetchModifiers });
}

export function useCreateModifierMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createModifier,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["modifiers"] });
    }
  });
}

export function useUpdateModifierMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateModifier>[1] }) => updateModifier(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["modifiers"] });
    }
  });
}

export function useDeleteModifierMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteModifier,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["modifiers"] });
    }
  });
}
