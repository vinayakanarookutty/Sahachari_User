import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getUserProfile, updateUserProfile } from "../services/user.api";

export function useProfile() {
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");

  const { data: profile, isLoading, refetch, } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<any>) => updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      closeEditModal();
    },
  });

  const openEditModal = (field: string, currentValue: string) => {
    setEditField(field);
    setEditValue(currentValue || "");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditField("");
    setEditValue("");
  };

  const handleSave = () => {
    if (!editValue.trim()) return alert("Field cannot be empty");
    updateProfileMutation.mutate({ [editField]: editValue });
  };

  return {
    profile,
    isLoading,
    showEditModal,
    editField,
    editValue,
    setEditValue,
    isUpdating: updateProfileMutation.isPending,
    openEditModal,
    closeEditModal,
    handleSave,
    refetch,
  };
}