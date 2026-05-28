import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiError } from "@/shared/services/ApiClient";
import {
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/master/apiCalling"; 

export const useEmployees = () => {
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const data = await getEmployee();
      const items = Array.isArray(data) ? data : data?.employees || [];
      return items.map((item) => ({ ...item, _id: item._id ?? item.id }));
    },
    onError: (err) => {
      console.error(getApiError(err, "Failed to fetch employees. Please try again."));
    }
  });

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onMutate: async (newEmployee) => {
      await queryClient.cancelQueries({ queryKey: ['employees'] });
      const previousEmployees = queryClient.getQueryData(['employees']);
      queryClient.setQueryData(['employees'], (old) => [
        { ...newEmployee, _id: Date.now().toString() }, // optimistic ID
        ...(old || [])
      ]);
      return { previousEmployees };
    },
    onError: (err, newEmployee, context) => {
      console.error(getApiError(err, "Failed to create employee record."));
      queryClient.setQueryData(['employees'], context.previousEmployees);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateEmployee(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['employees'] });
      const previousEmployees = queryClient.getQueryData(['employees']);
      queryClient.setQueryData(['employees'], (old) =>
        (old || []).map(emp => emp._id === id ? { ...emp, ...payload } : emp)
      );
      return { previousEmployees };
    },
    onError: (err, variables, context) => {
      console.error(getApiError(err, "Failed to update employee details."));
      queryClient.setQueryData(['employees'], context.previousEmployees);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['employees'] });
      const previousEmployees = queryClient.getQueryData(['employees']);
      queryClient.setQueryData(['employees'], (old) =>
        (old || []).filter(emp => emp._id !== id)
      );
      return { previousEmployees };
    },
    onError: (err, id, context) => {
      console.error(getApiError(err, "Failed to remove employee. Reverting table configuration."));
      queryClient.setQueryData(['employees'], context.previousEmployees);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  return {
    employees,
    isLoading,
    error,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
    onCreate: async (payload) => {
      try {
        await createMutation.mutateAsync(payload);
        return true;
      } catch {
        return false;
      }
    },
    onUpdate: async (id, payload) => {
      try {
        await updateMutation.mutateAsync({ id, payload });
        return true;
      } catch {
        return false;
      }
    },
    onDelete: async (id) => {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {}
    },
  };
};
