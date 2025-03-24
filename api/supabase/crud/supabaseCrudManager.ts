import { supabase } from '../client';
import { ErrorCode } from '../../../utils/ErrorCode';

// Generic CRUD operations
const create = async (table: string, data: any) => {
    try {
        const { data: result, error } = await supabase
            .from(table)
            .insert([data])
            .select()
            .single();

        if (error) {
            console.error(`Create error in ${table}:`, error);
            return { error: ErrorCode.serverError };
        }

        return { data: result };
    } catch (error) {
        console.error(`Create error in ${table}:`, error);
        return { error: ErrorCode.serverError };
    }
};

const read = async (table: string, id: string) => {
    try {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Read error in ${table}:`, error);
            return { error: ErrorCode.serverError };
        }

        return { data };
    } catch (error) {
        console.error(`Read error in ${table}:`, error);
        return { error: ErrorCode.serverError };
    }
};

const update = async (table: string, id: string, data: any) => {
    try {
        const { data: result, error } = await supabase
            .from(table)
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Update error in ${table}:`, error);
            return { error: ErrorCode.serverError };
        }

        return { data: result };
    } catch (error) {
        console.error(`Update error in ${table}:`, error);
        return { error: ErrorCode.serverError };
    }
};

const remove = async (table: string, id: string) => {
    try {
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Delete error in ${table}:`, error);
            return { error: ErrorCode.serverError };
        }

        return { success: true };
    } catch (error) {
        console.error(`Delete error in ${table}:`, error);
        return { error: ErrorCode.serverError };
    }
};

const list = async (table: string, query: any = {}) => {
    try {
        let supabaseQuery = supabase.from(table).select('*');

        // Apply filters if provided
        if (query.filters) {
            Object.entries(query.filters).forEach(([key, value]) => {
                supabaseQuery = supabaseQuery.eq(key, value);
            });
        }

        // Apply pagination if provided
        if (query.page && query.limit) {
            const start = (query.page - 1) * query.limit;
            const end = start + query.limit - 1;
            supabaseQuery = supabaseQuery.range(start, end);
        }

        // Apply ordering if provided
        if (query.orderBy) {
            supabaseQuery = supabaseQuery.order(query.orderBy, { ascending: query.ascending ?? true });
        }

        const { data, error } = await supabaseQuery;

        if (error) {
            console.error(`List error in ${table}:`, error);
            return { error: ErrorCode.serverError };
        }

        return { data };
    } catch (error) {
        console.error(`List error in ${table}:`, error);
        return { error: ErrorCode.serverError };
    }
};

const crudManager = {
    create,
    read,
    update,
    remove,
    list,
};

export default crudManager; 