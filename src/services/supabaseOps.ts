    // Fetch all clients for an adviser
    const fetchClients = async (adviserId: string) => {
        const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('adviser_id', adviserId);
    
        if (error) throw error;
        return data;
    };
    
    // Fetch client data
    const fetchClientData = async (clientId: string) => {
        const { data, error } = await supabase
        .from('client_data')
        .select('*')
        .eq('client_id', clientId)
        .single();
    
        if (error) throw error;
        return data;
    };

    // Insert new client
    const insertClient = async (client: {
        name: string;
        email: string;
        adviser_id: string;
    }) => {
        const { error } = await supabase.from('clients').insert([client]);
        if (error) throw error;
    };
  
    // Insert client financial data
    const insertClientData = async (data: {
        client_id: string;
        income: number;
        expenses: number;
        assets: number;
        liabilities: number;
        goals: string;
    }) => {
        const { error } = await supabase.from('client_data').insert([data]);
        if (error) throw error;
    };
  
  // Update client data
    const updateClientData = async (
        clientId: string,
        updatedData: Partial<{
        income: number;
        expenses: number;
        assets: number;
        liabilities: number;
        goals: string;
        }>
    ) => {
        const { error } = await supabase
        .from('client_data')
        .update(updatedData)
        .eq('client_id', clientId);
    
        if (error) throw error;
    };

// Delete a client
    const deleteClient = async (clientId: string) => {
        const { error } = await supabase.from('clients').delete().eq('id', clientId);
        if (error) throw error;
    };
    
    // Delete client data
    const deleteClientData = async (clientId: string) => {
        const { error } = await supabase.from('client_data').delete().eq('client_id', clientId);
        if (error) throw error;
    };
  