import { useQuery } from '@tanstack/react-query';
import { useServices } from './stores/services';

export const useTransferQuery = (id: string) => {
  const supabase = useServices((a) => a.supabase);
  return useQuery({
    queryKey: ['transfers', { id }],
    queryFn: async () => {
      const { data } = await supabase
        .from('transfers')
        .select('*')
        .eq('id', id)
        .single();
      return data;
    },
  });
};
